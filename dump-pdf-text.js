import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/build/pdf.js");

async function dumpPdf() {
    const pdfPath = "d:/MPC/gmail-pdf-tuuci-agent/processed_pdfs/MAX-3-15-26.pdf";
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

        pdfText += content.items
            .map(i => i.str)
            .join(" ")
            .replace(/\s+/g, " ") + "\n";
    }
    fs.writeFileSync("pdf_dump.txt", pdfText);
    console.log("PDF dumped to pdf_dump.txt");
}

dumpPdf().catch(console.error);
