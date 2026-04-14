// analyze-canopy.js
// MOTOR DE ANÁLISIS DE PRECISIÓN PARA CANOPY PDF
// ===============================================

import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/build/pdf.js");

import "./setup-pdf.js";
import { getCanopyCollection } from "./db.js";

// Configuración de Worker
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.js");
} catch (e) {
    console.log("⚠️ No se pudo resolver la ruta del worker.");
}

/**
 * Reconstruye el texto de una página basándose en coordenadas
 */
async function getPageData(page) {
    const textContent = await page.getTextContent();
    const items = textContent.items.map(item => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height
    }));

    // Reconstrucción de líneas para otros campos
    const linesMap = {};
    items.forEach(item => {
        const yKey = Math.round(item.y / 2) * 2;
        if (!linesMap[yKey]) linesMap[yKey] = [];
        linesMap[yKey].push(item);
    });
    const sortedY = Object.keys(linesMap).sort((a, b) => b - a);
    const lines = sortedY.map(y => {
        return linesMap[y].sort((a, b) => a.x - b.x).map(i => i.str).join(" ").replace(/\s+/g, " ");
    });

    return { items, lines };
}

export default async function analyzeCanopyPdf(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data, disableWorker: true, verbosity: 0 }).promise;

    const jobsFound = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const { items, lines } = await getPageData(page);
        
        let jobId = null;
        let item = null;
        let profile = null;
        let inMaterialTable = false;
        const telas = [];
        let qtyToBuild = 1;

        // 1. Extraer Headers y Materiales en un solo paso
        for (const line of lines) {
            if (line.includes("Job:") && !jobId) {
                const match = line.match(/Job:\s*([A-Z0-9.-]+)/i);
                if (match) jobId = match[1];
            }
            if (line.includes("Item:") && !item) {
                const match = line.match(/Item:\s*([A-Z0-9.-]+)/i);
                if (match) item = match[1];
            }
            if (line.includes("Qty To Build:")) {
                const match = line.match(/Qty To Build:\s*(\d+(?:\.\d+)?)/i);
                if (match) qtyToBuild = Math.round(parseFloat(match[1]));
            }
            if (line.includes("Job Material Listing")) {
                inMaterialTable = true;
                continue;
            }
            if (inMaterialTable) {
                const mMatch = line.match(/^\s*([A-Z0-9.\-]{5,})\b\s+([\s\S]+?)\s+(\d+(?:\.\d+)?)\s*(YD|FT|EA|MT)\b/i);
                if (mMatch && mMatch[4].toUpperCase() === "YD" && !mMatch[1].startsWith("JOB")) {
                    telas.push(mMatch[1]);
                }
            }
            if (line.includes("Page ") && line.includes(" of ")) inMaterialTable = false;
        }

        // 2. Extraer Configuration Details con Lógica de Grilla Exacta (Multi-línea)
        const profileLabel = items.find(i => i.str.includes("Canopy Profile"));
        if (profileLabel) {
            const labelX = profileLabel.x;
            const labelY = profileLabel.y;
            
            // 1. Encontrar el límite Y inferior (la primera etiqueta de la siguiente fila)
            // Las etiquetas en esta tabla están alineadas a la izquierda estrictamente
            // Col 1 empieza en X~90-120. Col 3 empieza en X~340-360.
            const nextLabels = items.filter(it => 
                ((it.x >= 80 && it.x <= 150) || (it.x >= 330 && it.x <= 390)) && 
                it.y < labelY - 5
            );
            
            // El piso de la celda es la Y más alta de las etiquetas que están debajo de la actual
            const bottomBoundaryY = nextLabels.length > 0 ? Math.max(...nextLabels.map(it => it.y)) : labelY - 35;

            // 2. Filtrar items que estén en el rango de nuestra celda correspondiente
            const valueItems = items.filter(it => 
                it.x > labelX + 50 &&           // A la derecha de la etiqueta
                it.x < labelX + 220 &&          // Límite más estricto para no pisar la siguiente columna
                it.y <= labelY + 2 &&           // Misma línea o inferior
                it.y > bottomBoundaryY          // PERO estrictamente por encima de la siguiente fila
            );

            // 3. Ordenar (arriba a abajo, izquierda a derecha) y concatenar
            const sortedItems = valueItems.sort((a,b) => (b.y === a.y) ? a.x - b.x : b.y - a.y);
            profile = sortedItems.map(i => i.str).join(" ").replace(/\s+/g, " ").trim();
        }

        if (jobId && item && profile) {
            jobsFound.push({
                jobId,
                item,
                profile,
                telas: [...new Set(telas)].sort(),
                qtyToBuild
            });
        }
    }

    // --- AGRUPACIÓN Y CRUCE CON DB ---
    const consolidated = {};
    for (const job of jobsFound) {
        const configKey = `${job.item}|${job.profile}|${job.telas.join(",")}`;
        if (!consolidated[configKey]) {
            consolidated[configKey] = { item: job.item, profile: job.profile, telas: job.telas, required: 0, jobs: [] };
        }
        consolidated[configKey].required += job.qtyToBuild;
        consolidated[configKey].jobs.push(job.jobId);
    }

    const results = [];
    try {
        const canopyColl = await getCanopyCollection();
        const allDbCanopies = await canopyColl.find({}).toArray();

        for (const key in consolidated) {
            const config = consolidated[key];
            const existing = allDbCanopies.find(db => {
                const aliasMatch = db.alias && config.item.includes(db.alias);
                const profileMatch = config.profile === db.profile;
                const pdfTelas = config.telas;
                
                const matchTelas = (dbTelasArray) => {
                    if (!dbTelasArray || pdfTelas.length !== dbTelasArray.length) return false;
                    const sortedDb = [...dbTelasArray].sort();
                    return pdfTelas.every((t, i) => t === sortedDb[i]);
                };

                const telasMatch = matchTelas(db.telas) || matchTelas(db.telas2);
                return aliasMatch && profileMatch && telasMatch;
            });

            if (existing) {
                let status = "DISPONIBLE";
                if (existing.total === 0) status = "SIN STOCK";
                else if (existing.total < config.required) status = "PARCIAL";

                results.push({ ...config, dbId: existing._id, available: existing.total || 0, status, isNew: false });
            } else {
                results.push({ ...config, dbId: null, available: 0, status: "NO INVENTARIADO", isNew: true });
            }
        }
    } catch (e) { console.error("Error DB Canopy:", e); }

    const statusPriority = { "DISPONIBLE": 1, "PARCIAL": 2, "SIN STOCK": 3, "NO INVENTARIADO": 4 };
    results.sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));

    return { timestamp: new Date(), totalJobs: jobsFound.length, summary: results };
}
