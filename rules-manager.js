// ================================
// RULES MANAGER
// ================================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 carpeta /rules al mismo nivel que agent.js
const RULES_DIR = path.join(__dirname, "rules");

// ================================
// CARGAR TODAS LAS REGLAS
// ================================
export function getAllRules() {
    if (!fs.existsSync(RULES_DIR)) {
        console.warn("⚠️ RULES_DIR no existe");
        return {};
    }

    const files = fs.readdirSync(RULES_DIR)
        .filter(f => f.endsWith(".json"));

    const rules = {};

    for (const file of files) {
        const fullPath = path.join(RULES_DIR, file);
        const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));

        if (!content.name || !content.ruleset) {
            console.warn(`⚠️ Regla inválida ignorada: ${file}`);
            continue;
        }

        rules[content.name] = content;
    }



    return rules;
}

// ================================
// RESOLVER REGLA
// ================================
export function resolveRule(requestedRuleName = null) {
    const rules = getAllRules();

    // 1️⃣ Regla solicitada
    if (requestedRuleName && rules[requestedRuleName]) {
        return rules[requestedRuleName];
    }

    // 2️⃣ Default
    if (rules.default) {
        return rules.default;
    }

    // 3️⃣ Error real
    throw new Error("No se pudo resolver ninguna regla válida");
}
