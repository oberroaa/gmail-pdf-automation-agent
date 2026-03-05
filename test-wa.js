import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.WA_PHONE_ID;
const TO = process.env.WHATSAPP_TO.split(",")[0].trim();

async function debugWhatsApp() {
    let log = `🚀 Depuración: ${new Date().toISOString()}\n`;
    log += `📱 Enviando a: ${TO}\n`;
    log += `🆔 Phone ID: ${PHONE_ID}\n`;

    const url = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: TO,
                type: "template",
                template: {
                    name: "hello_world",
                    language: { code: "en_US" }
                }
            })
        });

        const data = await response.json();
        log += "\n--- RESPUESTA DE META ---\n";
        log += JSON.stringify(data, null, 2);
        log += "\n-------------------------\n";

        if (response.ok) {
            log += "✅ Meta aceptó el mensaje.\n";
        } else {
            log += "❌ Error en la API.\n";
        }
    } catch (e) {
        log += `❌ Error de red: ${e.message}\n`;
    }

    fs.writeFileSync("debug-wa.log", log);
    console.log("📝 Resultado guardado en debug-wa.log");
}

debugWhatsApp();
