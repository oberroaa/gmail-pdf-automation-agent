import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/build/pdf.js");

// IMPORTANTE: Ruta exacta al worker .mjs (como está en el proyecto)
pdfjsLib.GlobalWorkerOptions.workerSrc = "./node_modules/pdfjs-dist/build/pdf.worker.mjs";

async function run() {
    try {
        const pdfPath = "d:\\MPC\\gmail-pdf-tuuci-agent\\processed_pdfs\\MAX Frames-4-8-26.pdf";
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const pdf = await pdfjsLib.getDocument({ 
            data, 
            disableWorker: true,
            verbosity: 0 
        }).promise;

        let pdfText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            pdfText += content.items.map(i => i.str).join(" ") + "\n";
        }

        const regex = /\b([A-Z0-9.\-]{5,})\b\s+([\s\S]+?)\s+(\d+(?:\.\d+)?)\s*(FT|EA|MT)\s+[A-Z]\b/gi;
        const targetItem = "DEC80086";
        const matches = [];
        
        let match;
        while ((match = regex.exec(pdfText)) !== null) {
            if (match[1].toUpperCase() === targetItem) {
                matches.push({
                    partNumber: match[1],
                    description: match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
                    qty: parseFloat(match[3]),
                    uom: match[4]
                });
            }
        }

        console.log(`\n🔍 BUSCANDO: ${targetItem}`);
        console.log(`📄 ARCHIVO: ${pdfPath}\n`);

        if (matches.length === 0) {
            console.log("❌ No se encontraron coincidencias para este item.");
            // Ver qué hay en el texto cerca de esa palabra por si la regex falla
            const index = pdfText.indexOf(targetItem);
            if (index !== -1) {
                console.log("Contexto encontrado:", pdfText.substring(index, index + 100));
            }
        } else {
            console.log(`✅ Se encontraron ${matches.length} ocurrencias:\n`);
            let total = 0;
            matches.forEach((m, i) => {
                console.log(`[${i + 1}]  ${m.qty.toFixed(2)} ${m.uom} | ${m.description}`);
                total += m.qty;
            });
            console.log(`\n============================`);
            console.log(`🔢 TOTAL SUMADO: ${total.toFixed(3)} ${matches[0].uom}`);
            console.log(`============================\n`);
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR:", err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

run();
