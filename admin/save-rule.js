import fs from "fs";
import path from "path";

const RULES_PATH = path.resolve("admin/rules/rules.json");

export function saveRule(rule) {
    if (!rule?.name) {
        throw new Error("Regla sin nombre");
    }

    const data = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));

    const exists = data.rules.find(r => r.name === rule.name);
    if (exists) {
        throw new Error(`Ya existe una regla con el nombre "${rule.name}"`);
    }

    data.rules.push(rule);

    if (!data.default) {
        data.default = rule.name;
    }

    fs.writeFileSync(RULES_PATH, JSON.stringify(data, null, 2));

    return rule.name;
}
