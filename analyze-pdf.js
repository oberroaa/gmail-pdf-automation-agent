// ================================
// PDF ANALYZER WITH RULES & LEARNING
// ================================
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { getItemsCollection, getReportsCollection } from "./db.js";

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

    // Nueva Regex que captura: [1]PartNumber, [2]Descripción, [3]Cantidad, [4]UOM
    const regex = /\b([A-Z0-9.\-]{5,})\b\s*([\s\S]{0,150}?)\s*(\d+(?:\.\d+)?)\s*(FT|EA|MT)\b/gi;

    const rows = [];
    let match;

    while ((match = regex.exec(pdfText)) !== null) {
        const partNumber = match[1];
        // Limpiamos la descripción de saltos de línea y espacios extra
        const description = match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        const qty = Number(match[3]);
        const uom = match[4];

        // 🔹 Filtro UOM
        if (allowedUoms.length && !allowedUoms.includes(uom)) continue;

        // 🔹 Filtro prefijo material
        if (allowedPrefixes.length) {
            const ok = allowedPrefixes.some(prefix => partNumber.startsWith(prefix));
            if (!ok) continue;
        }

        rows.push({ partNumber, description, qty, uom });
    }

    // ================================
    // AGRUPAR POR MATERIAL + UOM
    // ================================
    const grouped = {};

    for (const r of rows) {
        const key = `${r.partNumber}__${r.uom}`;

        grouped[key] ??= {
            partNumber: r.partNumber,
            description: r.description,
            uom: r.uom,
            total: 0
        };

        grouped[key].total += r.qty;
    }

    // Redondear totales a 2 decimales para evitar números como 550.4630000000001
    for (const key of Object.keys(grouped)) {
        grouped[key].total = parseFloat(grouped[key].total.toFixed(2));
    }

    // ================================
    // GUARDADO AUTOMÁTICO / ACTUALIZACIÓN EN DB
    // ================================
    try {
        const itemsColl = await getItemsCollection();

        for (const key of Object.keys(grouped)) {
            const r = grouped[key];

            // Buscamos si el Part Number ya existe
            const existing = await itemsColl.findOne({ partNumber: r.partNumber });

            if (!existing) {
                // ESCENARIO 1: El material es nuevo, lo creamos completo
                console.log(`🆕 Guardando nuevo: ${r.partNumber} (${r.description})`);
                r.active = true; // Por defecto activo
                await itemsColl.insertOne({
                    partNumber: r.partNumber,
                    description: r.description || "Sin descripción",
                    qtyReq: r.total,
                    uom: r.uom,
                    active: true,
                    createdAt: new Date()
                });
            } else {
                // ESCENARIO 2: Ya existe
                const newQty = parseFloat(((existing.qtyReq || 0) + r.total).toFixed(2));
                console.log(`🆙 Sumando Cantidad para: ${r.partNumber} -> ${existing.qtyReq} + ${r.total} = ${newQty}`);

                // Guardamos su estado actual en el objeto grouped para el reporte
                r.active = existing.active !== false;

                await itemsColl.updateOne(
                    { partNumber: r.partNumber },
                    { $set: { qtyReq: newQty, updatedAt: new Date() } }
                );
            }
        }
    } catch (dbError) {
        console.error("❌ Error actualizando la base de datos de items:", dbError);
    }

    // ================================
    // GUARDADO DE REPORTE (Historial)
    // ================================
    try {
        const reportsColl = await getReportsCollection();

        // Filtramos solo los items que están ACTIVOS
        const activeItems = Object.values(grouped).filter(item => item.active !== false);

        if (activeItems.length > 0) {
            // Creamos el objeto del reporte
            const newReport = {
                fileName: pdfPath.split(/[\\/]/).pop(),
                date: new Date(),
                itemsFound: activeItems.map(item => ({
                    partNumber: item.partNumber,
                    description: item.description,
                    qty: item.total,
                    uom: item.uom
                })),
                totalItems: activeItems.length,
                status: "Procesado"
            };

            await reportsColl.insertOne(newReport);
            console.log(`📊 Reporte guardado (solo items activos) para: ${newReport.fileName}`);
        } else {
            console.log(`ℹ️ No se generó reporte para ${pdfPath.split(/[\\/]/).pop()} porque todos los items encontrados están inactivos.`);
        }
    } catch (reportError) {
        console.error("❌ Error guardando el reporte:", reportError);
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
