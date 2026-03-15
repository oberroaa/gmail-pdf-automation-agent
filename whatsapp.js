import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.WA_PHONE_ID;

const TO_LIST = (process.env.WHATSAPP_TO || "")
    .split(",")
    .filter(n => n.trim().length > 0) // Evita elementos vacíos si no hay nada definido
    .map(n => n.trim().replace("whatsapp:", "").replace("+", ""));

export default async function sendWhatsApp(message) {
    if (!TOKEN || !PHONE_ID) {
        console.error("❌ Error: WA_TOKEN o WA_PHONE_ID no configurados en .env");
        return;
    }

    const url = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`;

    for (const to of TO_LIST) {
        try {
            // 1. Intentamos enviar el mensaje de texto directamente (el resultado del agente)
            const textResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: to,
                    type: "text",
                    text: { body: message }
                })
            });

            const textData = await textResponse.json();

            // NUEVO: Verificamos qué error nos está devolviendo la API de Meta
            if (!textResponse.ok) {
                console.log(`⚠️ Error de Meta al enviar texto a ${to}:`, JSON.stringify(textData.error));
            }

            // 2. Si falla porque la ventana de 24h está cerrada (error 131047, 131026 o similar)
            if (!textResponse.ok && (textData.error?.code === 131047 || textData.error?.code === 131026 || textData.error?.code === 135000)) {
                console.log(`⚠️ Ventana de 24h cerrada para ${to}. Abriendo con template...`);

                // Enviamos template para abrir ventana
                const templateResponse = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: to,
                        type: "template",
                        template: {
                            name: "hello_world",
                            language: { code: "en_US" }
                        }
                    })
                });

                if (templateResponse.ok) {
                    console.log(`✅ Ventana abierta. Reintentando envío del resultado en 2 segundos...`);
                    await new Promise(r => setTimeout(r, 2000));

                    // Reintentamos el texto real
                    const retryResponse = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${TOKEN}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            messaging_product: "whatsapp",
                            recipient_type: "individual",
                            to: to,
                            type: "text",
                            text: { body: message }
                        })
                    });

                    if (retryResponse.ok) {
                        console.log(`📱 Resultado del agente enviado exitosamente tras abrir ventana.`);
                    } else {
                        console.error(`❌ El reintento falló:`, (await retryResponse.json()).error?.message);
                    }
                }
            } else if (textResponse.ok) {
                console.log(`📱 Resultado del agente enviado exitosamente a ${to}`);
            } else {
                console.error(`❌ Meta rechazó el mensaje:`, textData.error?.message || textData);
            }

        } catch (error) {
            console.error(`❌ Error de conexión: ${error.message}`);
        }
    }
}
