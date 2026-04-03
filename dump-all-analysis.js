import analyzeCanopyPdf from "./analyze-canopy.js";
import fs from "fs";
import path from "path";

async function dumpAll() {
    const files = fs.readdirSync("./uploads").filter(f => f.endsWith(".pdf"));
    for (const file of files) {
        console.log(`--- ARCHIVO: ${file} ---`);
        const report = await analyzeCanopyPdf(path.join("./uploads", file));
        report.summary.forEach(s => {
            console.log(`[${s.status}] Item: "${s.item}", Profile: "${s.profile}", Telas: [${s.telas.join(", ")}]`);
        });
    }
    process.exit(0);
}
dumpAll();
