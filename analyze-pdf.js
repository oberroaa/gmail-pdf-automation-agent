import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// ==================================================
// ANALIZADOR PDF → DEVUELVE RESULTADO AGRUPADO
// ==================================================
export default async function analyzePdf(pdfPath) {

    // ================================
    // 1️⃣ Leer PDF
    // ================================
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    let pdfText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map(i => i.str);
        pdfText += strings.join(" ") + "\n";
    }

    // ================================
    // 2️⃣ Parser determinista FT
    // ================================
    const rows = [];
    const regex = /\b([A-Z]{2,4}\d{5,})\b[\s\S]{0,80}?(\d+(?:\.\d+)?)\s*FT\b/g;

    let match;
    while ((match = regex.exec(pdfText)) !== null) {
        rows.push({
            part_number: match[1],
            qty_req: Number(match[2]),
            uom: "FT"
        });
    }

    // ================================
    // 3️⃣ Agrupar y sumar
    // ================================
    const grouped = {};

    for (const r of rows) {
        if (!grouped[r.part_number]) grouped[r.part_number] = 0;
        grouped[r.part_number] += r.qty_req;
    }

    // ================================
    // 4️⃣ Construir salida FINAL
    // ================================
    let result = "RESULTADO FINAL AGRUPADO:\n\n";

    for (const part in grouped) {
        result += `* ${part} → ${grouped[part].toFixed(3)} FT\n`;
    }

    return result;
}
