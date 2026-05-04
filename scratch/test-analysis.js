
import analyzeCanopyPdf from "../analyze-canopy.js";

async function test() {
    const pdfPath = "d:/MPC/gmail-pdf-tuuci-agent/proceseed_canopy/Max-4-28-26.pdf";
    const result = await analyzeCanopyPdf(pdfPath);
    
    // Buscar el Job específico
    const targetJobId = "JOB0263748-0001";
    console.log(`\n--- BUSCANDO ${targetJobId} ---`);
    
    // Nota: El resultado tiene 'summary' que contiene los consolidados.
    // Pero queremos ver los 'jobsFound' internos si es posible, o el resumen que le toque.
    
    const matchedSummary = result.summary.find(s => s.jobs.includes(targetJobId));
    
    if (matchedSummary) {
        console.log("Configuración detectada para este Job:");
        console.log(JSON.stringify(matchedSummary, null, 2));
    } else {
        console.log("No se encontró el Job en el análisis.");
    }
}

test().catch(console.error);
