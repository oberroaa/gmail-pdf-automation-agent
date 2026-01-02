// ================================
// TEST IA RULE GENERATOR
// ================================
import dotenv from "dotenv";
dotenv.config();

import { generateRuleFromPrompt } from "./services/ai-rule-service.js";



// ================================
// CONFIG TEST PROMPT
// ================================
const TEST_PROMPT = `
Quiero una regla para materiales BDA, WTK y SAT.
Solo debe contar cantidades en FT.
El resultado debe mostrarse con 3 decimales.
`;

// ================================
// MAIN TEST
// ================================
async function runTest() {
    try {
        console.log("🔑 GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "OK" : "NO CONFIGURADA");
        console.log("🧠 Enviando prompt a la IA...\n");

        const rule = await generateRuleFromPrompt(TEST_PROMPT);

        console.log("✅ REGLA GENERADA POR LA IA:\n");
        console.log(JSON.stringify(rule, null, 2));
    } catch (err) {
        console.error("❌ ERROR:", err.message);
    }
}

await runTest();
