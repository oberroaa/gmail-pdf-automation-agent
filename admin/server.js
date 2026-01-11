// admin/server.js
// Servidor ADMIN con CRUD completo de reglas (ESM compatible)

// ================================
// ENV (CARGA CORRECTA DESDE RAÍZ)
// ================================
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

dotenv.config({
    path: path.join(rootDir, ".env"),
});

// DEBUG REAL
console.log("🔑 GEMINI KEY (ADMIN):", process.env.GEMINI_API_KEY);

// ================================
// IMPORTS
// ================================
import express from "express";
import fs from "fs/promises";
import { generateRuleJSON } from "./ai/gemini.js";

// ================================
// APP
// ================================
const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

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
// LISTAR REGLAS
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
                isDefault: json.isDefault === true,
            });
        }

        res.json({ count: rules.length, rules });
    } catch (err) {
        console.error("[ADMIN][LIST RULES] Error:", err);
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

        if (!ruleJSON.ruleset) {
            throw new Error("La IA no devolvió ruleset válido");
        }

        const filePath = path.join(rulesDir, `${name}.json`);
        await fs.writeFile(filePath, JSON.stringify(ruleJSON, null, 2), "utf-8");

        res.json({
            success: true,
            file: `${name}.json`,
            rule: ruleJSON,
        });
    } catch (err) {
        console.error("❌ Error IA REAL:", err);

        res.status(500).json({
            error: err.message,
            stack: err.stack,
        });
    }
});

// ================================
// EDITAR REGLA
// ================================
app.put("/rules/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const rule = req.body;

        if (!rule || typeof rule !== "object") {
            return res.status(400).json({ error: "Body debe ser JSON válido" });
        }

        const filePath = path.join(rulesDir, `${name}.json`);
        await fs.access(filePath);

        await fs.writeFile(filePath, JSON.stringify(rule, null, 2), "utf-8");

        res.json({ message: "Rule updated", file: `${name}.json` });
    } catch (err) {
        console.error("❌ EDIT ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// ELIMINAR REGLA
// ================================
app.delete("/rules/:name", async (req, res) => {
    try {
        const filePath = path.join(rulesDir, `${req.params.name}.json`);
        await fs.unlink(filePath);
        res.json({ message: "Rule deleted" });
    } catch (err) {
        console.error("❌ DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// MARCAR DEFAULT
// ================================
app.post("/rules/:name/default", async (req, res) => {
    try {
        const files = await fs.readdir(rulesDir);

        for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const filePath = path.join(rulesDir, file);
            const raw = await fs.readFile(filePath, "utf-8");
            const json = JSON.parse(raw);

            json.isDefault = json.name === req.params.name;

            await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
        }

        res.json({ message: "Default rule updated" });
    } catch (err) {
        console.error("❌ DEFAULT ERROR:", err);
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
    console.log("📂 Rules:", rulesDir);
    console.log("----------------------------------------");
});

export default app;
