// ================================
// ADMIN - TEST RULE WITH PDF
// ================================
import fs from "fs";
import path from "path";
import analyzePdfWithRules from "../analyze-pdf.js";

// ================================
// ARGS
// ================================
const args = process.argv.slice(2);

function getArg(flag) {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
}

const ruleName = getArg("--rule");
const pdfPath = getArg("--pdf");

if (!ruleName || !pdfPath) {
    console.error("❌ Uso:");
    console.error("node admin/test-rule.js --rule RULE_NAME --pdf ./archivo.pdf");
    process.exit(1);
}

// ================================
// LOAD RULES
// ================================
const RULES_PATH = path.resolve("admin/rules/rules.json");

if (!fs.existsSync(RULES_PATH)) {
    console.error("❌ No existe admin/rules/rules.json");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));

const rule = data.rules.find(r => r.name === ruleName);

if (!rule) {
    console.error(`❌ La regla "${ruleName}" no existe`);
    process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
    console.error(`❌ El PDF no existe: ${pdfPath}`);
    process.exit(1);
}

console.log(`⚙️ Usando regla: ${ruleName}`);
console.log(`📎 PDF: ${pdfPath}`);
console.log("──────────────────────────────");

// ================================
// RUN ANALYSIS
// ================================
const result = await analyzePdfWithRules(pdfPath, rule.ruleset);

console.log(result);
