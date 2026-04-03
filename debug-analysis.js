import analyzeCanopyPdf from "./analyze-canopy.js";
import fs from "fs";
import path from "path";

async function testAnalysis() {
    const uploadDir = "./uploads";
    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith(".pdf"));
    
    if (files.length === 0) {
        console.log("No PDFs in uploads/ to test.");
        process.exit(0);
    }

    const latestFile = files.sort((a, b) => {
        return fs.statSync(path.join(uploadDir, b)).mtimeMs - fs.statSync(path.join(uploadDir, a)).mtimeMs;
    })[0];

    console.log(`🔍 Testing with latest PDF: ${latestFile}`);
    try {
        const report = await analyzeCanopyPdf(path.join(uploadDir, latestFile));
        console.log("📝 Full Report Summary:");
        console.log(JSON.stringify(report.summary, null, 2));
    } catch (e) {
        console.error("Analysis failed:", e);
    }
    process.exit(0);
}

testAnalysis();
