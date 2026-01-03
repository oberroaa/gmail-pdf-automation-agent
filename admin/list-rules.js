import fs from "fs";
import path from "path";

const RULES_PATH = path.resolve("admin/rules/rules.json");

const data = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));

console.log("\n📋 REGLAS DISPONIBLES:\n");

data.rules.forEach(r => {
    const isDefault = r.name === data.default ? "⭐ DEFAULT" : "";
    console.log(`- ${r.name} ${isDefault}`);
});

console.log("");
