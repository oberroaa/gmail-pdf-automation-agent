import analyzeCanopyPdf from "./analyze-canopy.js";
import fs from "fs";
import path from "path";

function toHex(s) {
    if (!s) return "null";
    return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join(' ');
}

async function testAnalysis() {
    const uploadDir = "./uploads";
    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith(".pdf"));
    const latestFile = files.sort((a, b) => fs.statSync(path.join(uploadDir, b)).mtimeMs - fs.statSync(path.join(uploadDir, a)).mtimeMs)[0];
    
    const report = await analyzeCanopyPdf(path.join(uploadDir, latestFile));
    const job = report.summary[0]; // Take the first one for debug
    console.log("PDF Item:", job.item);
    console.log("PDF Item Hex:", toHex(job.item));
    console.log("PDF Profile:", job.profile);
    console.log("PDF Profile Hex:", toHex(job.profile));
    process.exit(0);
}

testAnalysis();
