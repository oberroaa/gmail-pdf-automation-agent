// admin/server.js
// Servidor ADMIN con MongoDB Atlas (CRUD completo)

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { getRulesCollection } from "../db.js";
import { generateRuleJSON } from "./ai/gemini.js";

// ================================
// PATHS & ENV
// ================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

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
            `[ADMIN-DB] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
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
        service: "gmail-pdf-tuuci-admin-mongodb",
        timestamp: new Date().toISOString(),
    });
});

// ================================
// LISTAR REGLAS (MongoDB)
// ================================
app.get("/rules", async (req, res) => {
    try {
        const collection = await getRulesCollection();
        const rules = await collection.find({}).sort({ name: 1 }).toArray();

        // Mapeamos para mantener compatibilidad con el front (el campo 'file' ya no existe pero lo emulamos)
        const frontRules = rules.map(r => ({
            file: `${r.name}.json`, // Emulación para no romper el front
            name: r.name,
            description: r.description,
            ruleset: r.ruleset ?? null,
            isDefault: r.isDefault === true,
        }));

        res.json(frontRules);
    } catch (err) {
        console.error("[ADMIN][LIST RULES]", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// EDITAR REGLA (MongoDB)
// ================================
app.put("/rules/:name", async (req, res) => {
    try {
        const originalName = req.params.name;
        const incoming = req.body;

        if (incoming.name !== originalName) {
            return res.status(400).json({ error: "No se permite cambiar el nombre de la regla" });
        }

        if (originalName === "default" && incoming.isDefault !== true) {
            return res.status(400).json({ error: "La regla default no puede dejar de ser default" });
        }

        const collection = await getRulesCollection();

        // Eliminamos el _id de MongoDB si viene por error en el body para no causar conflictos en el update
        const { _id, ...updateData } = incoming;

        await collection.updateOne(
            { name: originalName },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][EDIT RULE]", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// ELIMINAR REGLA (MongoDB)
// ================================
app.delete("/rules/:file", async (req, res) => {
    const fileName = decodeURIComponent(req.params.file);
    const ruleName = fileName.replace(".json", ""); // El front manda 'file', extraemos el name

    if (ruleName === "default") {
        return res.status(400).json({ error: "La regla default no puede eliminarse" });
    }

    try {
        const collection = await getRulesCollection();
        await collection.deleteOne({ name: ruleName });
        console.log("🗑️ Regla eliminada en DB:", ruleName);
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][DELETE RULE]", err);
        res.status(500).json({ error: "Error eliminando la regla" });
    }
});

// ================================
// MARCAR DEFAULT (MongoDB)
// ================================
app.post("/rules/:name/default", async (req, res) => {
    try {
        const { name } = req.params;
        const collection = await getRulesCollection();

        // 1. Quitar default a todas
        await collection.updateMany({}, { $set: { isDefault: false } });

        // 2. Poner default a la elegida
        const result = await collection.updateOne(
            { name: name },
            { $set: { isDefault: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Regla no encontrada" });
        }

        res.json({ success: true, default: name });
    } catch (err) {
        console.error("[ADMIN][SET DEFAULT]", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// GUARDAR REGLA (MongoDB CREATE)
// ================================
app.post("/rules/save", async (req, res) => {
    try {
        const ruleJSON = req.body;
        const name = ruleJSON.name;

        if (!name) return res.status(400).json({ error: "Nombre de regla inválido" });

        const collection = await getRulesCollection();

        // Verificamos si existe
        const existing = await collection.findOne({ name });
        if (existing) {
            return res.status(409).json({ error: `Ya existe una regla con el nombre "${name}"` });
        }

        await collection.insertOne({
            ...ruleJSON,
            isDefault: ruleJSON.isDefault || false,
            createdAt: new Date()
        });

        return res.status(201).json({
            success: true,
            rule: { ...ruleJSON, file: `${name}.json` }
        });

    } catch (err) {
        console.error("[ADMIN][SAVE RULE]", err);
        return res.status(500).json({ error: "Error guardando regla" });
    }
});

// ================================
// PREVIEW DE REGLA (Gemini IA)
// ================================
app.post('/rules/preview', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

        const generatedRule = await generateRuleJSON("PREVIEW_RULE", prompt);
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
    if (!rule || typeof rule !== 'object') return { valid: false, warnings: ['Regla inválida'] };
    if (!rule.name) warnings.push('Falta "name"');
    if (!rule.ruleset) {
        warnings.push('Falta "ruleset"');
        return { valid: false, warnings };
    }
    return { valid: warnings.length === 0, warnings };
}

// ================================
// BOOT
// ================================
app.listen(PORT, () => {
    console.log("----------------------------------------");
    console.log("� ADMIN SERVER (MONGODB) STARTED");
    console.log(`📡 http://localhost:${PORT}`);
    console.log("----------------------------------------");
});
