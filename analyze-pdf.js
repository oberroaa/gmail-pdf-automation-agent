// ================================
// PDF ANALYZER WITH RULES & LEARNING
// ================================
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/build/pdf.js");

import "./setup-pdf.js";
import { getItemsCollection, getReportsCollection } from "./db.js";

// Configuración para entornos Serverless (Vercel) con Versión 3.x
// Le decimos a Node exactamente donde está el archivo del worker en el disco duro
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.js");
} catch (e) {
    console.log("⚠️ No se pudo resolver la ruta del worker, se usará el modo por defecto.");
}
console.log("📑 PDF.js v3 inicializado (Modo Ruta Local)");

/**
 * Analiza un PDF según las reglas provistas y devuelve texto humano
 * @param {string} pdfPath
 * @param {object} ruleset
 * @param {string} displayName (Opcional, para el reporte)
 */
export default async function analyzePdfWithRules(pdfPath, ruleset, displayName = null) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({
        data,
        disableWorker: true, // 👈 Versión 3 lo respeta en CJS
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

    // ================================
    // CONFIG DE REGLAS
    // ================================
    const allowedUoms = ruleset.filters?.uom_include || [];
    const allowedPrefixes = ruleset.filters?.material_prefix || [];

    const itemRegex = /\b([A-Z0-9.\-]{5,})\b\s+([\s\S]+?)\s+(\d+(?:\.\d+)?)\s*(FT|EA|MT)\s+[A-Z]\b/gi;

    const rows = [];
    let match;
    while ((match = itemRegex.exec(pdfText)) !== null) {
        const partNumber = match[1];
        const description = match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        const qty = parseFloat(match[3]);
        const uom = match[4];

        // 🔹 Filtros
        if (allowedUoms.length && !allowedUoms.includes(uom)) continue;
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
                // ESCENARIO 1: El material es nuevo, extraemos el balance (FT) de la descripción
                let extractedFt = 0;
                const ftMatch = (r.description || "").match(/(\d+)\s*FT/i);
                if (ftMatch) {
                    extractedFt = parseInt(ftMatch[1]);
                    console.log(`🆕 Registrando nuevo material: ${r.partNumber} con balance extraído: ${extractedFt} FT`);
                } else {
                    console.log(`🆕 Registrando nuevo material: ${r.partNumber} sin FT detectado (Balance: 0)`);
                }

                await itemsColl.insertOne({
                    partNumber: r.partNumber,
                    description: r.description || "Sin descripción",
                    qtyReq: extractedFt,
                    uom: r.uom,
                    active: true,
                    createdAt: new Date()
                });
                r.active = true;
            } else {
                // ESCENARIO 2: Ya existe
                console.log(`ℹ️ El material ${r.partNumber} ya existe. No se modifica el inventario.`);

                // Mantenemos el estado activo del registro existente para el reporte
                r.active = existing.active !== false;

                // Solo actualizamos la fecha de "última vez visto" o descripción si quieres,
                // pero NO actualizamos qtyReq (el inventario)
                await itemsColl.updateOne(
                    { partNumber: r.partNumber },
                    { $set: { updatedAt: new Date() } }
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

        // Filtramos solo los items que están ACTIVOS y ordenamos por cantidad DESC
        const activeItems = Object.values(grouped)
            .filter(item => item.active !== false)
            .sort((a, b) => b.total - a.total);

        if (activeItems.length > 0) {
            // Creamos el objeto del reporte
            const newReport = {
                fileName: displayName || pdfPath.split(/[\\/]/).pop(),
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
    let result = "RESULTADO FINAL AGRUPADO (Ordenado por Cantidad DESC):\n\n";

    if (!Object.keys(grouped).length) {
        result += "⚠️ No se encontraron datos con las reglas actuales.\n";
        return result;
    }

    const decimals = ruleset.format?.decimals ?? 3;

    // Convertimos a array y ordenamos por total DESC
    const sortedResult = Object.values(grouped).sort((a, b) => b.total - a.total);

    for (const r of sortedResult) {
        result += `* ${r.partNumber} → ${r.total.toFixed(decimals)} ${r.uom}\n`;
    }

    return result;
}
