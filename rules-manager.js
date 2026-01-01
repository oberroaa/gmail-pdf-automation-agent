import fs from "fs";
import path from "path";

const RULES_DIR = "./rules";

// ================================
// CARGAR TODAS LAS REGLAS
// ================================
export function getAllRules() {
    if (!fs.existsSync(RULES_DIR)) return {};

    const files = fs.readdirSync(RULES_DIR)
        .filter(f => f.endsWith(".json"));

    const rules = {};

    for (const file of files) {
        const fullPath = path.join(RULES_DIR, file);
        const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));

        if (!content.name || !content.ruleset) continue;

        rules[content.name] = content;
    }

    return rules;
}

// ================================
// RESOLVER REGLA
// ================================
export function resolveRule(requestedRuleName) {
    const rules = getAllRules();

    // 1️⃣ Regla solicitada
    if (requestedRuleName && rules[requestedRuleName]) {
        return rules[requestedRuleName];
    }

    // 2️⃣ Fallback a default
    if (rules.default) {
        return rules.default;
    }

    // 3️⃣ Error real
    throw new Error("No se pudo resolver ninguna regla válida");
}
