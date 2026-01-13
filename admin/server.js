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
// CREAR REGLA (IA)
// ================================
app.post("/rules/new", async (req, res) => {
    try {
        const { name, prompt } = req.body;

        if (!name || !prompt) {
            return res.status(400).json({
                error: "name y prompt son requeridos",
            });
        }

        const ruleJSON = await generateRuleJSON(name, prompt);
        const filePath = path.join(RULES_DIR, `${name}.json`);

        await fs.writeFile(filePath, JSON.stringify(ruleJSON, null, 2), "utf-8");

        res.json({
            success: true,
            file: `${name}.json`,
            rule: ruleJSON,
        });
    } catch (err) {
        console.error("[ADMIN][NEW RULE]", err);
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
// ELIMINAR REGLA
// ================================
app.delete("/rules/:name", async (req, res) => {
    try {
        const filePath = path.join(RULES_DIR, `${req.params.name}.json`);
        await fs.unlink(filePath);
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][DELETE RULE]", err);
        res.status(500).json({ error: "Regla no encontrada" });
    }
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
