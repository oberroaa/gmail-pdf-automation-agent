import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// ================================
// CONFIG
// ================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

// ================================
// PROMPT CONTROLADO
// ================================
function buildPrompt(userPrompt) {
    return `
Eres un sistema que CREA REGLAS PARA ANALIZAR PDFs.

RESPONDE ÚNICAMENTE CON JSON.
NO expliques nada.
NO agregues comentarios.
NO uses markdown.
NO uses \`\`\`.

Formato EXACTO requerido:

{
  "name": "string",
  "description": "string",
  "ruleset": {
    "filters": {
      "uom_include": ["FT"],
      "material_prefix": ["BDA", "WTK"]
    },
    "format": {
      "decimals": 3
    }
  }
}

Reglas estrictas:
- uom_include es OBLIGATORIO y no puede estar vacío
- material_prefix puede estar vacío []
- decimals debe ser número
- NO inventes campos
- NO cambies la estructura

Prompt del administrador:
${userPrompt}
`;
}

// ================================
// VALIDACIÓN ESTRICTA
// ================================
function validateRuleJson(rule) {
    if (!rule || typeof rule !== "object") {
        throw new Error("Regla vacía o inválida");
    }

    if (typeof rule.name !== "string" || !rule.name.trim()) {
        throw new Error("name inválido");
    }

    if (typeof rule.description !== "string") {
        throw new Error("description inválido");
    }

    if (!rule.ruleset || typeof rule.ruleset !== "object") {
        throw new Error("ruleset faltante");
    }

    if (
        !Array.isArray(rule.ruleset.filters?.uom_include) ||
        rule.ruleset.filters.uom_include.length === 0
    ) {
        throw new Error("filters.uom_include inválido");
    }

    if (
        rule.ruleset.filters.material_prefix &&
        !Array.isArray(rule.ruleset.filters.material_prefix)
    ) {
        throw new Error("filters.material_prefix inválido");
    }

    if (typeof rule.ruleset.format?.decimals !== "number") {
        throw new Error("format.decimals inválido");
    }

    return true;
}

// ================================
// SERVICIO PRINCIPAL
// ================================
export async function generateRuleFromPrompt(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY no configurada");
    }

    if (!prompt || !prompt.trim()) {
        throw new Error("Prompt vacío");
    }

    const response = await fetch(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: buildPrompt(prompt) }]
                    }
                ]
            })
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(
            `Error Gemini ${response.status}: ${errText}`
        );
    }

    const data = await response.json();

    const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error("Respuesta vacía de la IA");
    }

    // ================================
    // LIMPIEZA DEFENSIVA
    // ================================
    const clean = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    let ruleJson;
    try {
        ruleJson = JSON.parse(clean);
    } catch (err) {
        throw new Error(
            "La IA no devolvió JSON válido:\n" + clean
        );
    }

    validateRuleJson(ruleJson);

    return ruleJson;
}
