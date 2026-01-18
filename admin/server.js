// admin/server.js
// Servidor ADMIN con CRUD completo de reglas (ESM compatible)

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import fs from "fs/promises";
import cors from "cors";
import { generateRuleJSON } from "./ai/gemini.js";

// ================================
// PATHS & ENV
// ================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 👉 DIRECTORIO ÚNICO DE REGLAS (USAR ESTE SIEMPRE)
const RULES_DIR = path.join(rootDir, "rules");

dotenv.config({
    path: path.join(rootDir, ".env"),
});

// ================================
// APP
// ================================
const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Logger simple
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const ms = Date.now() - start;
        console.log(
            `[ADMIN] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
        );
    });
    next();
});

// ================================
// HEALTH
// ================================
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "gmail-pdf-tuuci-admin",
        timestamp: new Date().toISOString(),
    });
});

// ================================
// LISTAR REGLAS (FRONT FRIENDLY)
// ================================
app.get("/rules", async (req, res) => {
    try {
        const files = await fs.readdir(RULES_DIR);
        const rules = [];

        for (const file of files) {
            if (!file.endsWith(".json")) continue;

            const raw = await fs.readFile(path.join(RULES_DIR, file), "utf-8");
            const json = JSON.parse(raw);

            rules.push({
                file,
                name: json.name,
                description: json.description,
                ruleset: json.ruleset ?? null,
                isDefault: json.isDefault === true,
            });
        }

        // 🔥 React espera un ARRAY, no {count, rules}
        res.json(rules);
    } catch (err) {
        console.error("[ADMIN][LIST RULES]", err);
        res.status(500).json({ error: err.message });
    }
});



// ================================
// EDITAR REGLA
// ================================
app.put("/rules/:name", async (req, res) => {
    try {
        const filePath = path.join(RULES_DIR, `${req.params.name}.json`);
        await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf-8");
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][EDIT RULE]", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// ELIMINAR REGLA (IDEMPOTENTE + POR FILE ✅)
// ================================
app.delete("/rules/:file", async (req, res) => {
    const fileName = decodeURIComponent(req.params.file);
    const filePath = path.join(RULES_DIR, fileName);

    try {
        await fs.unlink(filePath);
        console.log("🗑️ Regla eliminada:", fileName);
    } catch (err) {
        // 🔥 Si no existe → NO ERROR
        if (err.code !== "ENOENT") {
            console.error("[ADMIN][DELETE RULE]", err);
            return res.status(500).json({
                error: "Error eliminando la regla"
            });
        }

        console.log("ℹ️ Regla no existía, se considera eliminada:", fileName);
    }

    res.json({
        success: true
    });
});



// ================================
// MARCAR DEFAULT (🔥 YA CORREGIDO)
// ================================
app.post("/rules/:name/default", async (req, res) => {
    try {
        const { name } = req.params;
        const files = await fs.readdir(RULES_DIR);

        let found = false;

        for (const file of files) {
            if (!file.endsWith(".json")) continue;

            const filePath = path.join(RULES_DIR, file);
            const raw = await fs.readFile(filePath, "utf-8");
            const json = JSON.parse(raw);

            if (json.name === name) {
                json.isDefault = true;
                found = true;
            } else {
                json.isDefault = false;
            }

            await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
        }

        if (!found) {
            return res.status(404).json({ error: "Regla no encontrada" });
        }

        res.json({ success: true, default: name });
    } catch (err) {
        console.error("[ADMIN][SET DEFAULT]", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/rules/save", async (req, res) => {
    try {
        const { name, prompt } = req.body;

        if (!name || !prompt) {
            return res.status(400).json({
                error: "name y prompt son obligatorios"
            });
        }

        const filePath = path.join(RULES_DIR, `${name}.json`);

        if (await fs.stat(filePath).catch(() => false)) {
            return res.status(409).json({
                error: "Ya existe una regla con ese nombre"
            });
        }

        const ruleJSON = await generateRuleJSON(name, prompt);

        await fs.writeFile(
            filePath,
            JSON.stringify(ruleJSON, null, 2),
            "utf-8"
        );

        console.log("✅ Regla guardada:", name);

        res.json({
            success: true,
            rule: ruleJSON
        });

    } catch (err) {
        console.error("[ADMIN][SAVE RULE]", err);
        res.status(500).json({
            error: "Error guardando la regla"
        });
    }
});



// ================================
// PREVIEW DE REGLA (NO GUARDA)
// ================================
app.post('/rules/preview', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({
                error: 'Prompt requerido'
            });
        }

        // 🔹 USAR LA MISMA IA QUE YA USAS EN POST /rules
        const generatedRule = await generateRuleJSON(
            "PREVIEW_RULE",
            prompt
        );


        // 🔹 Validación mínima
        const validation = validateRuleStructure(generatedRule);

        res.json({
            generatedRule,
            valid: validation.valid,
            warnings: validation.warnings
        });

    } catch (err) {
        console.error('Error en preview:', err);
        res.status(500).json({ error: 'Error generando preview' });
    }
});


function validateRuleStructure(rule) {
    const warnings = [];

    if (!rule || typeof rule !== 'object') {
        return { valid: false, warnings: ['La regla no es un objeto válido'] };
    }

    if (!rule.name || typeof rule.name !== 'string') {
        warnings.push('Falta o es inválido el campo "name"');
    }

    if (!rule.description || typeof rule.description !== 'string') {
        warnings.push('Falta o es inválido el campo "description"');
    }

    if (!rule.ruleset || typeof rule.ruleset !== 'object') {
        warnings.push('Falta el objeto "ruleset"');
        return { valid: false, warnings };
    }

    if (!rule.ruleset.filters || typeof rule.ruleset.filters !== 'object') {
        warnings.push('Falta "ruleset.filters"');
    }

    if (!rule.ruleset.format || typeof rule.ruleset.format !== 'object') {
        warnings.push('Falta "ruleset.format"');
    }

    if (typeof rule.isDefault !== 'boolean') {
        warnings.push('Falta o es inválido el campo "isDefault"');
    }

    return {
        valid: warnings.length === 0,
        warnings
    };
}




// ================================
// BOOT
// ================================
app.listen(PORT, () => {
    console.log("----------------------------------------");
    console.log("🛠️  ADMIN SERVER STARTED");
    console.log(`📡 http://localhost:${PORT}`);
    console.log("📂 Rules:", RULES_DIR);
    console.log("----------------------------------------");
});
