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
async function getPageLines(page) {
    const textContent = await page.getTextContent();
    const items = textContent.items.map(item => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height
    }));

    // Agrupar por coordenada Y (con una tolerancia de 2 unidades)
    const linesMap = {};
    items.forEach(item => {
        const yKey = Math.round(item.y / 2) * 2; // Tolerancia de 2px
        if (!linesMap[yKey]) linesMap[yKey] = [];
        linesMap[yKey].push(item);
    });

    // Ordenar líneas de arriba hacia abajo y elementos de izquierda a derecha
    const sortedY = Object.keys(linesMap).sort((a, b) => b - a);
    return sortedY.map(y => {
        return linesMap[y].sort((a, b) => a.x - b.x).map(i => i.str).join(" ").replace(/\s+/g, " ");
    });
}

export default async function analyzeCanopyPdf(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data, disableWorker: true, verbosity: 0 }).promise;

    const jobsFound = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const lines = await getPageLines(page);
        
        let jobId = null;
        let item = null;
        let profile = null;
        let inMaterialTable = false;
        const telas = [];
        let qtyToBuild = 1;

        for (const line of lines) {
            // 1. Extraer Job ID
            if (line.includes("Job:") && !jobId) {
                const match = line.match(/Job:\s*([A-Z0-9.-]+)/i);
                if (match) jobId = match[1];
            }

            // 2. Extraer Item
            if (line.includes("Item:") && !item) {
                const match = line.match(/Item:\s*([A-Z0-9.-]+)/i);
                if (match) item = match[1];
            }

            // 3. Extraer Cantidad (Qty To Build)
            if (line.includes("Qty To Build:")) {
                const match = line.match(/Qty To Build:\s*(\d+(?:\.\d+)?)/i);
                if (match) qtyToBuild = Math.round(parseFloat(match[1]));
            }

            // 4. Extraer Profile (Lógica de precisión extrema por etiquetas)
            if (line.includes("Canopy Profile")) {
                const afterLabel = line.split("Canopy Profile")[1] || "";
                
                // Lista de otras etiquetas que podrían estar en la misma línea (mismo Y)
                const otherAttributes = [
                    "Mast Height", "Finial", "Lifting System", "Frame Finish", 
                    "Mast Size", "Single Wind Vent", "Top Vent Fabric", "Vent",
                    "Attribute", "Value", "Parasol"
                ];

                let cleanProfile = afterLabel.trim();
                
                // Si encontramos OTRA etiqueta en la misma línea, cortamos ahí
                for (const attr of otherAttributes) {
                    if (cleanProfile.includes(attr)) {
                        cleanProfile = cleanProfile.split(attr)[0].trim();
                    }
                }

                // Limpieza final de caracteres residuales
                profile = cleanProfile.replace(/^[:\s\-]+/, "").trim();
            }

            // 5. Iniciar tabla de materiales
            if (line.includes("Job Material Listing")) {
                inMaterialTable = true;
                continue;
            }

            // 6. Procesar materiales si estamos en la tabla
            if (inMaterialTable) {
                // Regex robusto similar a analyze-pdf.js
                // Captura: [PartNumber] [Descripción...] [Cantidad] [UOM]
                const mMatch = line.match(/^\s*([A-Z0-9.\-]{5,})\b\s+([\s\S]+?)\s+(\d+(?:\.\d+)?)\s*(YD|FT|EA|MT)\b/i);
                if (mMatch) {
                    const pNum = mMatch[1];
                    const uom = mMatch[4].toUpperCase();

                    // VALIDACIÓN: 
                    // - UOM debe ser YD
                    // - No debe empezar por JOB (evitar confusiones con el Job ID)
                    if (uom === "YD" && !pNum.startsWith("JOB")) {
                        telas.push(pNum);
                    }
                }
            }
            
            // Si llegamos al final de la página o inicio de otra sección, paramos la tabla
            if (line.includes("Page ") && line.includes(" of ")) inMaterialTable = false;
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

    // --- AGRUPACIÓN Y CRUCE CON DB (Igual que antes pero con data limpia) ---
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
        // Cargamos todo el nomenclador en memoria para buscar por alias eficientemente
        const allDbCanopies = await canopyColl.find({}).toArray();

        for (const key in consolidated) {
            const config = consolidated[key];
            
            console.log(`[DEBUG] Buscando match para: ITEM: "${config.item}", PROFILE: "${config.profile}", TELAS: [${config.telas.join(", ")}]`);

            // BUSCADA AVANZADA:
            const existing = allDbCanopies.find(db => {
                // 1. Match por Alias (el alias debe estar contenido en el Item del PDF)
                const aliasMatch = db.alias && config.item.includes(db.alias);
                
                // Logging de depuración para ver por qué falla
                if (config.item.includes("OM10") || (db.alias && db.alias.includes("OM10"))) {
                    console.log(`[DEBUG-MATCH] Comparando PDF("${config.item}") con DB(Alias:"${db.alias}")`);
                    console.log(` - AliasMatch: ${aliasMatch}`);
                    console.log(` - ProfileMatch: ${config.profile === db.profile} ("${config.profile}" vs "${db.profile}")`);
                }

                // 2. Match por Perfil (Exacto)
                const profileMatch = config.profile === db.profile;

                // 3. Match por Telas (Principal o Alternativo)
                const pdfTelas = config.telas; // Ya vienen ordenadas del PDF
                
                const matchTelas = (dbTelasArray) => {
                    if (!dbTelasArray || pdfTelas.length !== dbTelasArray.length) return false;
                    const sortedDb = [...dbTelasArray].sort();
                    return pdfTelas.every((t, i) => t === sortedDb[i]);
                };

                const telasMatch = matchTelas(db.telas) || matchTelas(db.telas2);

                if (aliasMatch && profileMatch && telasMatch) {
                   console.log(`[DEBUG] ✅ MATCH ENCONTRADO en DB: ID=${db._id}, ALIAS="${db.alias}"`);
                   return true;
                }

                return false;
            });

            if (existing) {
                let status = "COMPLETO";
                if (existing.total === 0) {
                    status = "SIN STOCK";
                } else if (existing.total < config.required) {
                    status = "PARCIAL";
                }

                results.push({
                    ...config,
                    dbId: existing._id,
                    available: existing.total || 0,
                    status: status,
                    isNew: false
                });
            } else {
                // No guardamos en BD, solo reportamos como no inventariado para el reporte
                results.push({ 
                    ...config, 
                    dbId: null, 
                    available: 0, 
                    status: "NO INVENTARIADO", 
                    isNew: true 
                });
            }
        }
    } catch (e) {
        console.error("Error DB Canopy:", e);
    }

    // --- ORDENAMIENTO: COMPLETO > PARCIAL > SIN STOCK > NO INVENTARIADO ---
    const statusPriority = { "COMPLETO": 1, "PARCIAL": 2, "SIN STOCK": 3, "NO INVENTARIADO": 4 };
    results.sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));

    return { timestamp: new Date(), totalJobs: jobsFound.length, summary: results };
}
