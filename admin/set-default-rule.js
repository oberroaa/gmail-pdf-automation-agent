import fs from "fs";
import path from "path";

const RULES_PATH = path.resolve("admin/rules/rules.json");
const ruleName = process.argv[2];

if (!ruleName) {
    console.error("❌ Debes indicar el nombre de la regla");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));

const exists = data.rules.find(r => r.name === ruleName);
if (!exists) {
    console.error(`❌ La regla "${ruleName}" no existe`);
    process.exit(1);
}

data.default = ruleName;

fs.writeFileSync(RULES_PATH, JSON.stringify(data, null, 2));

console.log(`✅ Regla "${ruleName}" establecida como DEFAULT`);
