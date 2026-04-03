import analyzeCanopyPdf from "./analyze-canopy.js";
import { getCanopyCollection } from "./db.js";
import fs from "fs";
import path from "path";

function toHex(s) {
    if (!s) return "null";
    return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join(' ');
}

async function deepCheck() {
    const uploadDir = "./uploads";
    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith(".pdf"));
    const latestFile = files.sort((a, b) => fs.statSync(path.join(uploadDir, b)).mtimeMs - fs.statSync(path.join(uploadDir, a)).mtimeMs)[0];
    const pdfPath = path.join(uploadDir, latestFile);
    
    // 1. Get from PDF
    const report = await analyzeCanopyPdf(pdfPath);
    const pdfJob = report.summary[0]; 

    // 2. Get from DB
    const coll = await getCanopyCollection();
    const dbItem = await coll.findOne({ alias: "OM10.0HEX" });

    console.log("--- RESULTS ---");
    console.log("PDF Profile:   ", JSON.stringify(pdfJob.profile));
    console.log("PDF Profile Hex:", toHex(pdfJob.profile));
    console.log("DB Profile:    ", JSON.stringify(dbItem.profile));
    console.log("DB Profile Hex: ", toHex(dbItem.profile));
    console.log("Profile Match ===:", pdfJob.profile === dbItem.profile);
    
    console.log("PDF Item:     ", JSON.stringify(pdfJob.item));
    console.log("DB Alias:    ", JSON.stringify(dbItem.alias));
    console.log("Alias Match (includes):", pdfJob.item.includes(dbItem.alias));

    process.exit(0);
}

deepCheck();
