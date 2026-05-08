import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/build/pdf.js");

async function searchInPdf() {
    try {
        const pdfPath = "d:/MPC/gmail-pdf-tuuci-agent/processed_pdfs/M1 Frame-5-7-26.pdf";
        const target = "DEC80088";
        
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const pdf = await pdfjsLib.getDocument({
            data,
            disableWorker: true,
            verbosity: 0
        }).promise;

        let found = false;
        let occurrences = 0;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const text = content.items.map(i => i.str).join(" ");
            
            if (text.includes(target)) {
                found = true;
                const index = text.indexOf(target);
                const snippet = text.substring(Math.max(0, index - 100), Math.min(text.length, index + 200));
                console.log(`🔍 Encontrado en página ${pageNum}:`);
                console.log(`Contexto: "...${snippet}..."`);
            }
        }

        if (!found) {
            console.log(`❌ No se encontró "${target}" en el PDF.`);
        } else {
            console.log(`✅ Total de apariciones de "${target}": ${occurrences}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error buscando en el PDF:", error);
        process.exit(1);
    }
}

searchInPdf();
