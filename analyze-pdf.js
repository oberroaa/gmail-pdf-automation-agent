import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { validateRule } from "./validators/rule-validator.js";

// ==================================================
// ANALIZADOR PDF → BASADO EN REGLAS
// ==================================================
export default async function analyzePdf(pdfPath, rulePath = "./rules/default-ft.json") {

    // ================================
    // 1️⃣ Cargar regla
    // ================================
    const rule = JSON.parse(fs.readFileSync(rulePath, "utf-8"));
    validateRule(rule);


    const partRegex = new RegExp(rule.fields.find(f => f.key === "part_number").regex, "g");
    const qtyRegex = new RegExp(rule.fields.find(f => f.key === "qty").regex, "g");

    // ================================
    // 2️⃣ Leer PDF
    // ================================
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(i => i.str).join(" ") + "\n";
    }

    // ================================
    // 3️⃣ Extraer datos
    // ================================
    const rows = [];

    let partMatch;
    while ((partMatch = partRegex.exec(text)) !== null) {
        const part = partMatch[0];

        // buscar qty cerca del part
        const slice = text.substring(partMatch.index, partMatch.index + 120);
        const qtyMatch = qtyRegex.exec(slice);

        if (qtyMatch) {
            rows.push({
                part_number: part,
                qty: parseFloat(qtyMatch[1]),
                unit: rule.unit
            });
        }
    }

    // ================================
    // 4️⃣ Agrupar
    // ================================
    const grouped = {};

    for (const r of rows) {
        if (!grouped[r.part_number]) grouped[r.part_number] = 0;
        grouped[r.part_number] += r.qty;
    }

    // ================================
    // 5️⃣ Resultado final
    // ================================
    let result = `RESULTADO FINAL AGRUPADO (${rule.unit})\n\n`;

    for (const part in grouped) {
        result += `* ${part} → ${grouped[part].toFixed(3)} ${rule.unit}\n`;
    }

    return result;
}
