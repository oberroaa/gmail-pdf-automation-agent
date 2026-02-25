// ================================
// RULES MANAGER (MongoDB Version)
// ================================
import { getRulesCollection } from "./db.js";

/**
 * CARGAR TODAS LAS REGLAS desde MongoDB
 * NOTA: Ahora es asíncrona porque la BD requiere espera.
 */
export async function getAllRules() {
    try {
        const collection = await getRulesCollection();
        const rulesArray = await collection.find({}).toArray();

        const rules = {};
        for (const r of rulesArray) {
            rules[r.name] = r;
        }

        return rules;
    } catch (error) {
        console.error("❌ Error cargando reglas desde MongoDB:", error.message);
        return {};
    }
}

/**
 * RESOLVER REGLA
 * NOTA: Ahora es asíncrona.
 */
export async function resolveRule(requestedRuleName = null) {
    const rules = await getAllRules();

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
