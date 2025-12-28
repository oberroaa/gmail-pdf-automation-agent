// ================================
// TUUCI Gmail PDF Agent
// ================================
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";
import analyzePdf from "./analyze-pdf.js";
import sendWhatsApp from "./whatsapp.js";

dotenv.config();

// ================================
// CONFIG
// ================================
const TARGET_FROM = "oberroa@tuuci.com";
const LABEL_PROCESSED = "PROCESSED9";
const OUTPUT_DIR = process.env.PDF_OUTPUT_DIR || "./processed_pdfs";
//const INTERVAL = 60 * 60 * 1000; // ⏱️ 1 hora

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ================================
// AUTH
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

// ================================
// MAIN LOGIC
// ================================
async function processEmails() {
    console.log("🔁 Verificando correos nuevos...");

    const labelId = await getOrCreateLabel(LABEL_PROCESSED);

    const res = await gmail.users.messages.list({
        userId: "me",
        q: `from:${TARGET_FROM} has:attachment filename:pdf -label:${LABEL_PROCESSED}`,
        maxResults: 5
    });

    const messages = res.data.messages || [];

    if (!messages.length) {
        console.log("📭 No hay correos nuevos para procesar");
        return;
    }

    for (const msg of messages) {
        console.log(`📨 Procesando mensaje ${msg.id}`);

        const msgData = await gmail.users.messages.get({
            userId: "me",
            id: msg.id
        });

        const parts = msgData.data.payload.parts || [];
        let finalResult = "";

        for (const part of parts) {
            if (!part.filename || !part.filename.toLowerCase().endsWith(".pdf")) continue;

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
            const result = await analyzePdf(filePath);

            finalResult += `\n📄 ${safeName}\n${result}\n`;
        }

        if (!finalResult.trim()) {
            console.log("⚠️ No se encontró contenido válido en el PDF");
            continue;
        }

        console.log("📊 Resultado final:", finalResult);

        // ================================
        // SEND WHATSAPP
        // ================================
        await sendWhatsApp(`📄 Resultado análisis PDF\n${finalResult}`);
        console.log("📱 WhatsApp enviado correctamente");

        // ================================
        // SEND EMAIL
        // ================================
        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: Buffer.from(
                    `To: ${TARGET_FROM}\r\n` +
                    `Subject: Resultado análisis PDF\r\n\r\n` +
                    finalResult
                ).toString("base64")
            }
        });

        console.log("📧 Resultado enviado por email");

        // ================================
        // MARK AS PROCESSED
        // ================================
        await gmail.users.messages.modify({
            userId: "me",
            id: msg.id,
            requestBody: { addLabelIds: [labelId] }
        });

        console.log("🏷️ Correo marcado como PROCESSED");
    }

    console.log("✅ Ciclo terminado\n");
}

// ================================
// START AGENT
// ================================
console.log("🤖 TUUCI AGENT INICIADO");

// Ejecutar al arrancar
await processEmails();

// Ejecutar cada 1 hora, lo comentarie pk uso PM2
//setInterval(processEmails, INTERVAL);
