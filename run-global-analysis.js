import analyzeCanopyPdf from "./analyze-canopy.js";
import fs from "fs";
import path from "path";

async function runGlobalAnalysis() {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
        console.log("No existe la carpeta uploads/");
        process.exit(0);
    }

    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith(".pdf"));
    console.log(`🔎 Analizando ${files.length} archivos PDF...\n`);

    let totalMatches = 0;

    for (const file of files) {
        try {
            const filePath = path.join(uploadDir, file);
            const report = await analyzeCanopyPdf(filePath);
            
            const matches = report.summary.filter(s => !s.isNew);
            
            if (matches.length > 0) {
                console.log(`📄 ARCHIVO: ${file}`);
                matches.forEach(m => {
                    console.log(`   ✅ COINCIDENCIA ENCONTRADA:`);
                    console.log(`      - Item en PDF:  ${m.item}`);
                    console.log(`      - Perfil:       ${m.profile}`);
                    console.log(`      - Telas en PDF: [${m.telas.join(", ")}]`);
                    console.log(`      - Estado:       ${m.status} (Disponible: ${m.available})`);
                    console.log(`      -----------------------------------`);
                });
                totalMatches += matches.length;
            }
        } catch (err) {
            console.error(`❌ Error analizando ${file}:`, err.message);
        }
    }

    if (totalMatches === 0) {
        console.log("No se encontraron coincidencias con la base de datos en ninguno de los archivos.");
    } else {
        console.log(`\n🎉 Análisis completado. Se encontraron ${totalMatches} coincidencias en total.`);
    }
    process.exit(0);
}

runGlobalAnalysis();
