import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.WA_PHONE_ID;

// 👇 convertimos a array y limpiamos el formato (quitamos "whatsapp:" y "+")
const TO_LIST = process.env.WHATSAPP_TO
    .split(",")
    .map(n => n.trim().replace("whatsapp:", "").replace("+", ""));

export default async function sendWhatsApp(message) {
    if (!TOKEN || !PHONE_ID) {
        console.error("❌ Error: WA_TOKEN o WA_PHONE_ID no configurados en .env");
        return;
    }

    const url = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;

    for (const to of TO_LIST) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: to,
                    type: "text",
                    text: {
                        body: message
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`📱 WhatsApp enviado a ${to} (Meta API)`);
            } else {
                console.error(`❌ Error enviando a ${to}:`, data.error ? data.error.message : data);
            }
        } catch (error) {
            console.error(`❌ Fallo en la petición a Meta para ${to}:`, error.message);
        }
    }
}

