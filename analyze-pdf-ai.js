import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function analyzePdfWithAI(pdfPath, prompt) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("❌ GEMINI_API_KEY no está definida en el entorno");
    }

    // ================================
    // 1️⃣ Leer PDF
    // ================================
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    let pdfText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map(i => i.str);
        pdfText += strings.join(" ") + "\n";
    }

    // ================================
    // 2️⃣ Inicializar Gemini
    // ================================
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
    });

    // ================================
    // 3️⃣ Prompt FINAL
    // ================================
    const finalPrompt = `
${prompt}

--- PDF CONTENT ---
${pdfText}

Devuelve SOLO un JSON válido.
`;

    const result = await model.generateContent(finalPrompt);
    const response = result.response.text();

    return response;
}
