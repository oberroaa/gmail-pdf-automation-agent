// admin/server.js
// Servidor ADMIN con CRUD completo de reglas (ESM compatible)

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import fs from "fs/promises";
import cors from "cors";
import { generateRuleJSON } from "./ai/gemini.js";

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

app.use(cors()); // ✅ CORS FIX
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

const rulesDir = path.resolve(rootDir, "rules");

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
// LISTAR REGLAS (🔥 FRONT FRIENDLY)
// ================================
app.get("/rules", async (req, res) => {
    try {
        const files = await fs.readdir(rulesDir);
        const rules = [];

        for (const file of files) {
            if (!file.endsWith(".json")) continue;

            const raw = await fs.readFile(path.join(rulesDir, file), "utf-8");
            const json = JSON.parse(raw);

            rules.push({
                file,
                name: json.name,
                description: json.description,
                ruleset: json.ruleset ?? null,
                isDefault: json.isDefault === true,
            });
        }

        // ✅ DEVOLVEMOS DIRECTO ARRAY (lo que espera React)
        res.json(rules);
    } catch (err) {
        console.error("[ADMIN][LIST RULES] Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// RESTO DEL CRUD (SIN CAMBIOS)
// ================================
app.post("/rules/new", async (req, res) => {
    try {
        const { name, prompt } = req.body;
        if (!name || !prompt) {
            return res.status(400).json({ error: "name y prompt son requeridos" });
        }

        const ruleJSON = await generateRuleJSON(name, prompt);
        const filePath = path.join(rulesDir, `${name}.json`);

        await fs.writeFile(filePath, JSON.stringify(ruleJSON, null, 2), "utf-8");

        res.json({ success: true, file: `${name}.json`, rule: ruleJSON });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/rules/:name", async (req, res) => {
    try {
        const filePath = path.join(rulesDir, `${req.params.name}.json`);
        await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf-8");
        res.json({ message: "Rule updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/rules/:name", async (req, res) => {
    try {
        await fs.unlink(path.join(rulesDir, `${req.params.name}.json`));
        res.json({ message: "Rule deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/rules/:name/default", async (req, res) => {
    try {
        const files = await fs.readdir(rulesDir);

        for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const filePath = path.join(rulesDir, file);
            const json = JSON.parse(await fs.readFile(filePath, "utf-8"));
            json.isDefault = json.name === req.params.name;
            await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
        }

        res.json({ message: "Default rule updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
app.listen(PORT, () => {
    console.log("🛠️ ADMIN SERVER:", `http://localhost:${PORT}`);
});
