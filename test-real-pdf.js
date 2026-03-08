import path from "path";
import analyzePdfWithRules from "./analyze-pdf.js";
import { resolveRule } from "./rules-manager.js";

async function runRealTest() {
    try {
        console.log("🚀 Iniciando Test con PDF Real...");

        // 1. Resolvemos la regla (usará la 'default' que tienes en MongoDB)
        console.log("🔍 Cargando reglas desde MongoDB...");
        const ruleObj = await resolveRule();
        console.log(`⚙️ Usando regla: ${ruleObj.name}`);

        // 2. Ruta al archivo PDF
        const pdfPath = path.join(process.cwd(), "processed_pdfs", "archivo.pdf");

        // 3. Ejecutamos el análisis (esto activará el guardado automático en DB que pusimos antes)
        console.log(`🧠 Analizando: ${pdfPath}`);
        const resultText = await analyzePdfWithRules(pdfPath, ruleObj.ruleset);

        console.log("\n📊 RESULTADO DEL ANÁLISIS:");
        console.log("----------------------------------------");
        console.log(resultText);
        console.log("----------------------------------------");

        console.log("\n✅ Test completado. Revisa tu Panel Admin para ver si se guardaron los items.");
        process.exit(0);

    } catch (err) {
        console.error("❌ ERROR EN EL TEST:", err);
        process.exit(1);
    }
}

runRealTest();
