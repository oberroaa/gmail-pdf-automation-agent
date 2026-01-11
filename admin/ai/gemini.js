// admin/ai/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ------------------ ENV ------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga .env desde la raíz del proyecto
dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY no está definida");
}

console.log("🔑 GEMINI_API_KEY cargada ✅");

// ------------------ CLIENTE ------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------ GENERADOR ------------------
export async function generateRuleJSON(name, userPrompt) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite"
  });

  const systemPrompt = `
Eres un generador de reglas para un sistema Node.js.

RESPONDE ÚNICAMENTE CON JSON VÁLIDO.
NO markdown.
NO texto adicional.

Formato obligatorio:
{
  "name": "${name}",
  "description": "string",
  "ruleset": {
    "filters": {
      "uom_include": [],
      "material_prefix": []
    },
    "format": {
      "decimals": 2
    }
  },
  "isDefault": false
}
`;

  const promptFinal = systemPrompt + "\n\n" + userPrompt;

  const result = await model.generateContent(promptFinal);
  const text = result.response.text();

  const clean = text.trim().replace(/```json|```/gi, "");

  let json;
  try {
    json = JSON.parse(clean);
  } catch (err) {
    throw new Error("❌ Gemini devolvió JSON inválido:\n" + clean);
  }

  if (!json.ruleset) {
    throw new Error("❌ JSON generado no contiene ruleset");
  }

  return json;
}
