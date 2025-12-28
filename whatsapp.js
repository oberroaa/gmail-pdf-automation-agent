import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
    process.env.ACCOUNT_SID,
    process.env.AUTH_TOKEN
);

const FROM = process.env.WHATSAPP_FROM;

// 👇 convertimos a array
const TO_LIST = process.env.WHATSAPP_TO
    .split(",")
    .map(n => n.trim());

export default async function sendWhatsApp(message) {
    for (const to of TO_LIST) {
        await client.messages.create({
            from: FROM,
            to,
            body: message
        });

        console.log(`📱 WhatsApp enviado a ${to}`);
    }
}
