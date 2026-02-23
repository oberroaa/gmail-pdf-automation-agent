// ================================
// TUUCI Gmail PDF Automation Agent
// ================================
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

import sendWhatsApp from "./whatsapp.js";
import analyzePdfWithRules from "./analyze-pdf.js";
import { getAllRules } from "./rules-manager.js";

dotenv.config({ quiet: true });

// ================================
// CONFIG
// ================================
const TARGET_FROM = "oberroa@tuuci.com";
const LABEL_PROCESSED = "PROCESSED";
const OUTPUT_DIR = process.env.PDF_OUTPUT_DIR || "./processed_pdfs";

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ================================
// AUTH GMAIL
// ================================
const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

auth.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

const gmail = google.gmail({ version: "v1", auth });

// ================================
// HELPERS
// ================================
async function getOrCreateLabel(labelName) {
    const res = await gmail.users.labels.list({ userId: "me" });
    const existing = res.data.labels.find(l => l.name === labelName);
    if (existing) return existing.id;

    const created = await gmail.users.labels.create({
        userId: "me",
        requestBody: {
            name: labelName,
            labelListVisibility: "labelShow",
            messageListVisibility: "show"
        }
    });

    return created.data.id;
}

function extractPlainText(payload) {
    let bodyText = "";

    function decode(data) {
        return Buffer.from(data, "base64").toString("utf8");
    }

    function walk(part) {
        if (part.mimeType === "text/plain" && part.body?.data) {
            bodyText += "\n" + decode(part.body.data);
        }

        if (part.mimeType === "text/html" && part.body?.data) {
            const html = decode(part.body.data);
            const text = html
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<\/?[^>]+>/g, " ")
                .replace(/\s+/g, " ");
            bodyText += "\n" + text;
        }

        if (Array.isArray(part.parts)) {
            part.parts.forEach(walk);
        }
    }

    walk(payload);
    return bodyText.trim();
}

function detectRuleFromBody(bodyText, ruleNames) {
    if (!bodyText) return null;

    const body = bodyText.toLowerCase();

    for (const ruleName of ruleNames) {
        const name = ruleName.toLowerCase();

        const patterns = [
            name,
            `regla ${name}`,
            `regla: ${name}`,
            `usar ${name}`,
            `use ${name}`,
            `rule ${name}`
        ];

        if (patterns.some(p => body.includes(p))) {
            return ruleName;
        }
    }

    return null;
}

// ================================
// MAIN PROCESS
// ================================
async function processEmails() {
    console.log("🔁 Verificando correos nuevos...");

    try {
        const labelId = await getOrCreateLabel(LABEL_PROCESSED);

        const res = await gmail.users.messages.list({
            userId: "me",
            q: `from:${TARGET_FROM} has:attachment filename:pdf -label:${LABEL_PROCESSED}`,
            maxResults: 5
        });

        const messages = res.data.messages || [];

        if (!messages.length) {
            console.log("📭 No hay correos nuevos para procesar");
            await sendWhatsApp("📭 Agent Check: No se encontraron correos nuevos de '" + TARGET_FROM + "' con PDFs para procesar.");
            return;
        }

        const allRules = getAllRules();
        const ruleNames = Object.keys(allRules);

        for (const msg of messages) {
            try {
                console.log(`📨 Procesando mensaje ${msg.id}`);

                const msgData = await gmail.users.messages.get({
                    userId: "me",
                    id: msg.id
                });

                const payload = msgData.data.payload;
                const bodyText = extractPlainText(payload);

                const requestedRule = detectRuleFromBody(bodyText, ruleNames);

                const ruleObj =
                    (requestedRule && allRules[requestedRule]) ||
                    allRules.default;

                if (!ruleObj || !ruleObj.ruleset) {
                    console.error("❌ No se pudo resolver una regla válida");
                    await sendWhatsApp(`❌ Error en Msg ${msg.id}: No se pudo resolver una regla de análisis válida.`);
                    continue;
                }

                console.log(`⚙️ Usando regla: ${ruleObj.name}`);

                const parts = payload.parts || [];
                let pdfFoundInMsg = false;

                for (const part of parts) {
                    if (!part.filename?.endsWith(".pdf")) continue;
                    pdfFoundInMsg = true;

                    const attachment = await gmail.users.messages.attachments.get({
                        userId: "me",
                        messageId: msg.id,
                        id: part.body.attachmentId
                    });

                    const buffer = Buffer.from(
                        attachment.data.data.replace(/-/g, "+").replace(/_/g, "/"),
                        "base64"
                    );

                    const safeName = part.filename.replace(/[^\w.-]/g, "_");
                    const filePath = path.join(OUTPUT_DIR, `${msg.id}_${safeName}`);

                    fs.writeFileSync(filePath, buffer);
                    console.log(`📎 PDF guardado: ${filePath}`);

                    console.log("🧠 Analizando PDF...");
                    const resultText = await analyzePdfWithRules(
                        filePath,
                        ruleObj.ruleset
                    );

                    console.log("📊 Resultado final:\n", resultText);

                    await sendWhatsApp(`✅ Resultado de ${part.filename}:\n\n${resultText}`);

                    await gmail.users.messages.send({
                        userId: "me",
                        requestBody: {
                            raw: Buffer.from(
                                `To: ${TARGET_FROM}\r\n` +
                                `Subject: Resultado análisis PDF - ${part.filename}\r\n\r\n` +
                                resultText
                            ).toString("base64")
                        }
                    });

                    console.log("📧 Resultado enviado por email");
                }

                if (!pdfFoundInMsg) {
                    await sendWhatsApp(`⚠️ Mensaje ${msg.id} detectado pero no se encontró el archivo PDF adjunto.`);
                }

                await gmail.users.messages.modify({
                    userId: "me",
                    id: msg.id,
                    requestBody: { addLabelIds: [labelId] }
                });

                console.log("🏷️ Correo marcado como PROCESSED");

            } catch (msgError) {
                console.error(`❌ Error procesando el mensaje ${msg.id}:`, msgError);
                await sendWhatsApp(`❌ Error crítico procesando mensaje ${msg.id}: ${msgError.message}`);
            }
        }

        console.log("✅ Ciclo terminado\n");

    } catch (globalError) {
        console.error("❌ Error global en el proceso:", globalError);
        await sendWhatsApp(`❌ Error global en el Agente: ${globalError.message}`);
    }
}

function isWorkingHours() {
    const now = new Date();
    const hour = now.getHours(); // 0–23

    return hour >= 7 && hour < 15;
}


// ================================
// START
// ================================
console.log("🤖 TUUCI AGENT INICIADO");
if (isWorkingHours()) {
    await processEmails();
} else {
    const msg = "🕒 Agent Check: Fuera de horario laboral (7 AM - 3 PM), el proceso no se ejecutó.";
    console.log(msg);
    // Opcional: Descomenta la línea de abajo si quieres que te avise por WhatsApp incluso si está fuera de horario
    // await sendWhatsApp(msg);
}




