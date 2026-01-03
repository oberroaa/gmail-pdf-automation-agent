import fs from "fs";
import path from "path";

const RULES_PATH = path.resolve("admin/rules/rules.json");
const ruleName = process.argv[2];

if (!ruleName) {
    console.error("❌ Debes indicar el nombre de la regla");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));

const index = data.rules.findIndex(r => r.name === ruleName);
if (index === -1) {
    console.error(`❌ La regla "${ruleName}" no existe`);
    process.exit(1);
}

data.rules.splice(index, 1);

if (data.default === ruleName) {
    data.default = data.rules[0]?.name ?? null;
}

fs.writeFileSync(RULES_PATH, JSON.stringify(data, null, 2));

console.log(`🗑️ Regla "${ruleName}" eliminada`);
