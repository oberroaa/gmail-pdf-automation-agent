import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Analiza un PDF según las reglas provistas y devuelve texto humano
 * @param {string} pdfPath - Ruta del PDF
 * @param {object} rules - Objeto de reglas, debe contener ruleset compatible
 */
export default async function analyzePdfWithRules(pdfPath, rules) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let pdfText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        pdfText += content.items.map(i => i.str).join(" ") + "\n";
        // === VALIDAR PREFIJOS DE MATERIAL (BDA / WTK / SAT) ===
        const prefixes = rules.ruleset?.filters?.material_prefix || [];




    }

    // === USAMOS TU REGEX ORIGINAL ===
    const rows = [];
    const regex = /\b([A-Z]{2,4}\d{5,})\b[\s\S]{0,80}?(\d+(?:\.\d+)?)\s*(FT|EA|MT)\b/g;

    let match;
    const allowedUoms = rules.filters?.uom_include || [];
    const allowedPrefixes = rules.filters?.material_prefix || [];

    while ((match = regex.exec(pdfText)) !== null) {
        const partNumber = match[1];
        const qty = Number(match[2]);
        const uom = match[3];

        // 1️⃣ Filtrar por UOM
        if (allowedUoms.length > 0 && !allowedUoms.includes(uom)) continue;

        // 2️⃣ Filtrar por prefijo de material
        if (
            allowedPrefixes.length > 0 &&
            !allowedPrefixes.some(prefix => partNumber.startsWith(prefix))
        ) {
            continue;
        }

        rows.push({
            part_number: partNumber,
            qty,
            uom
        });
    }


    // === AGRUPAR POR PART_NUMBER ===
    const grouped = {};
    for (const r of rows) {
        grouped[r.part_number] ||= 0;
        grouped[r.part_number] += r.qty;
    }

    // === SALIDA HUMANA ===
    let result = "RESULTADO FINAL AGRUPADO:\n\n";

    if (Object.keys(grouped).length === 0) {
        result += "⚠️ No se encontraron datos con las reglas actuales.\n";
        return result;
    }

    // === Formatear la salida ===
    const decimals = rules.format?.decimals ?? 3;
    const uomList = allowedUoms.length > 0 ? allowedUoms.join(", ") : "";

    for (const part in grouped) {
        result += `* ${part} → ${grouped[part].toFixed(decimals)} ${uomList}\n`;
    }

    return result;
}
