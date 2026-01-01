import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function generateRulesFromPrompt(userPrompt) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
    });

    const systemPrompt = `
You generate ONLY JSON rules for a PDF extraction engine.

Rules:
- Return ONLY valid JSON
- NO markdown
- NO explanations
- NO comments
- NO PDF analysis

Schema:
{
  "name": string,
  "description": string,
  "extract": { "part_number": boolean, "quantity": boolean, "uom": boolean },
  "filters": { "uom_include": string[], "uom_exclude": string[] },
  "group_by": string[],
  "sum": string[],
  "format": { "decimals": number, "output": "HUMAN_TEXT" }
}

Default behavior:
- Extract part_number, quantity, uom
- Include FT only
- Group by part_number
- Sum quantity
`;

    const prompt = userPrompt
        ? `${systemPrompt}\n\nUser instructions:\n${userPrompt}`
        : systemPrompt;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
        return JSON.parse(text);
    } catch (err) {
        throw new Error("IA returned invalid JSON rules");
    }
}
