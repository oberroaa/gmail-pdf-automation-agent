// ================================
// PDF ANALYZER WITH RULES
// ================================
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

        pdfText += content.items
            .map(i => i.str)
            .join(" ")
            .replace(/\s+/g, " ") + "\n";
    }

    // ================================
    // CONFIG DE REGLAS
    // ================================
    const allowedUoms = ruleset.filters?.uom_include || [];
    const allowedPrefixes = ruleset.filters?.material_prefix || [];

    /**
     * Regex más flexible:
     * - materiales alfanuméricos largos (OMAS8X12RECT, BMFF8.5HEX, BDA80083)
     * - cantidad decimal
     * - UOM separada o pegada
     */
    const regex = /\b([A-Z0-9.\-]{5,})\b[\s\S]{0,100}?(\d+(?:\.\d+)?)\s*(FT|EA|MT)\b/gi;

    const rows = [];
    let match;

    while ((match = regex.exec(pdfText)) !== null) {
        const partNumber = match[1];
        const qty = Number(match[2]);
        const uom = match[3];

        // 🔹 Filtro UOM
        if (allowedUoms.length && !allowedUoms.includes(uom)) continue;

        // 🔹 Filtro prefijo material
        if (allowedPrefixes.length) {
            const ok = allowedPrefixes.some(prefix =>
                partNumber.startsWith(prefix)
            );
            if (!ok) continue;
        }

        rows.push({ partNumber, qty, uom });
    }

    // ================================
    // AGRUPAR POR MATERIAL + UOM
    // ================================
    const grouped = {};

    for (const r of rows) {
        const key = `${r.partNumber}__${r.uom}`;

        grouped[key] ??= {
            partNumber: r.partNumber,
            uom: r.uom,
            total: 0
        };

        grouped[key].total += r.qty;
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

    for (const key of Object.keys(grouped)) {
        const r = grouped[key];
        result += `* ${r.partNumber} → ${r.total.toFixed(decimals)} ${r.uom}\n`;
    }

    return result;
}
