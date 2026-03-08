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
 * Busca la regla por nombre, o la que esté marcada como 'isDefault'
 */
export async function resolveRule(requestedRuleName = null) {
    const collection = await getRulesCollection();

    // 1️⃣ Si el email pidió una regla específica por nombre
    if (requestedRuleName) {
        const rule = await collection.findOne({ name: requestedRuleName });
        if (rule) return rule;
    }

    // 2️⃣ Si no, buscamos la que marcaste como Default (la estrella) en el Dashboard
    const defaultRule = await collection.findOne({ isDefault: true });
    if (defaultRule) return defaultRule;

    // 3️⃣ Si no hay ninguna marcada como default, buscamos una que se llame "default"
    const fallbackRule = await collection.findOne({ name: "default" });
    if (fallbackRule) return fallbackRule;

    throw new Error("No se pudo resolver ninguna regla válida. Configura una como 'Default' en el panel.");
}

