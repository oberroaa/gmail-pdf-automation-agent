import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Analiza un PDF según las reglas provistas y devuelve texto humano
 * @param {string} pdfPath
 * @param {object} ruleset
 */
export default async function analyzePdfWithRules(pdfPath, ruleset) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let pdfText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        pdfText += content.items.map(i => i.str).join(" ") + "\n";
    }

    // ================================
    // CONFIG DE REGLAS
    // ================================
    const allowedUoms = ruleset.filters?.uom_include || [];
    const allowedPrefixes = ruleset.filters?.material_prefix || [];

    // REGEX BASE (no la tocamos)
    const regex = /\b([A-Z]{2,4}\d{5,})\b[\s\S]{0,80}?(\d+(?:\.\d+)?)\s*(FT|EA|MT)\b/g;

    const rows = [];
    let match;

    while ((match = regex.exec(pdfText)) !== null) {
        const partNumber = match[1];
        const qty = Number(match[2]);
        const uom = match[3];

        // 🔹 FILTRO UOM
        if (allowedUoms.length && !allowedUoms.includes(uom)) continue;

        // 🔹 FILTRO MATERIAL PREFIX (AQUÍ ESTABA EL FALLO)
        if (allowedPrefixes.length) {
            const ok = allowedPrefixes.some(prefix =>
                partNumber.startsWith(prefix)
            );
            if (!ok) continue;
        }

        rows.push({ partNumber, qty, uom });
    }

    // ================================
    // AGRUPAR
    // ================================
    const grouped = {};
    for (const r of rows) {
        grouped[r.partNumber] ??= 0;
        grouped[r.partNumber] += r.qty;
    }

    // ================================
    // OUTPUT HUMANO
    // ================================
    let result = "RESULTADO FINAL AGRUPADO:\n\n";

    if (!Object.keys(grouped).length) {
        result += "⚠️ No se encontraron datos con las reglas actuales.\n";
        return result;
    }

    const decimals = ruleset.format?.decimals ?? 3;
    const uomText = allowedUoms.join(", ");

    for (const part in grouped) {
        result += `* ${part} → ${grouped[part].toFixed(decimals)} ${uomText}\n`;
    }

    return result;
}
