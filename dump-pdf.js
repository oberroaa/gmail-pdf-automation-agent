import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/build/pdf.js");

async function dumpPdf() {
    const data = new Uint8Array(fs.readFileSync("./uploads/31af10d7138c5722d56e4f1ab580437f-archivo.pdf"));
    const pdf = await pdfjsLib.getDocument({ data, disableWorker: true, verbosity: 0 }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(it => it.str).join(" ");
        console.log(`--- PAGE ${i} ---`);
        console.log(text);
    }
}

dumpPdf();
