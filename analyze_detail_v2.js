import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

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

        const regex = /\b(DEC80086)\b\s+([\s\S]+?)\s+(\d+(?:\.\d+)?)\s*(FT|EA|MT)\s+[A-Z]\b/gi;
        const matches = [];
        
        let match;
        while ((match = regex.exec(pdfText)) !== null) {
            matches.push({
                partNumber: match[1],
                description: match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
                qty: parseFloat(match[3]),
                uom: match[4]
            });
        }

        if (matches.length === 0) {
            console.log("No se encontraron coincidencias para DEC80086.");
            process.exit(0);
        }

        console.log(`TOTAL ENCONTRADO: ${matches.reduce((acc, m) => acc + m.qty, 0).toFixed(3)} ${matches[0].uom}`);
        console.log("\nDETALLE POR ITEM:");
        matches.forEach((m, i) => {
            console.log(`${i+1}. ${m.qty.toFixed(2)} ${m.uom} - ${m.description}`);
        });
        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err.message);
        process.exit(1);
    }
}

run();
