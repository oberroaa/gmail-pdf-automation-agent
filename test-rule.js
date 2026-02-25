import fs from "fs";
import path from "path";
import analyzePdfWithRules from "./analyze-pdf.js";
import { resolveRule } from "./rules-manager.js";

// ================================
// PARSE ARGS 
//node test - rule.js--rule nombreRegla--pdf ruta / al / pdf
// ================================
const args = process.argv.slice(2);

function getArg(name) {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
}

const ruleName = getArg("rule");
const pdfPath = getArg("pdf");

// ================================
// VALIDACIONES
// ================================
if (!pdfPath) {
    console.error("❌ Debes pasar --pdf ruta/al/archivo.pdf");
    process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
    console.error("❌ El archivo PDF no existe:", pdfPath);
    process.exit(1);
}

// ================================
// TEST
// ================================
(async () => {
    try {
        const { name, ruleset } = await resolveRule(ruleName);

        console.log(`⚙️ Usando regla: ${name}`);
        console.log("📎 PDF:", pdfPath);
        console.log("──────────────────────────────");

        const result = await analyzePdfWithRules(pdfPath, ruleset);

        console.log(result);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
})();
