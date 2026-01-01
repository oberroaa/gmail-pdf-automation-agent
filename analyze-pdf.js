import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export default async function analyzePdfWithRules(pdfPath, rules) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let pdfText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        pdfText += content.items.map(i => i.str).join(" ") + "\n";
    }

    // === USAMOS TU REGEX ORIGINAL (FT) ===
    const rows = [];
    const regex = /\b([A-Z]{2,4}\d{5,})\b[\s\S]{0,80}?(\d+(?:\.\d+)?)\s*(FT|EA|MT)\b/g;

    let match;
    while ((match = regex.exec(pdfText)) !== null) {
        const uom = match[3];

        if (
            rules.filters?.uom_include &&
            !rules.filters.uom_include.includes(uom)
        ) continue;

        rows.push({
            part_number: match[1],
            qty: Number(match[2]),
            uom
        });
    }

    // === AGRUPAR ===
    const grouped = {};
    for (const r of rows) {
        grouped[r.part_number] ||= 0;
        grouped[r.part_number] += r.qty;
    }

    // === SALIDA HUMANA (NO JSON) ===
    let result = "RESULTADO FINAL AGRUPADO:\n\n";

    if (Object.keys(grouped).length === 0) {
        result += "⚠️ No se encontraron datos con las reglas actuales.\n";
        return result;
    }

    for (const part in grouped) {
        result += `* ${part} → ${grouped[part].toFixed(
            rules.format?.decimals ?? 3
        )} ${rules.filters.uom_include.join(", ")}\n`;
    }

    return result;
}
