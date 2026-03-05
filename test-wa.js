// test-wa.js
import sendWhatsApp from "./whatsapp.js";
import dotenv from "dotenv";
dotenv.config();

const testMessage = "🚀 ¡Hola! Esta es una prueba del Agente Tuuci. Si recibes esto, la conexión con WhatsApp funciona correctamente. ✅";

console.log("⏳ Enviando mensaje de prueba personalizado a WhatsApp...");

sendWhatsApp(testMessage)
    .then(() => {
        console.log("\n-------------------------------------------");
        console.log("🏁 Proceso de envío finalizado con éxito.");
        console.log("Mensaje enviado: ", testMessage);
        console.log("-------------------------------------------");
    })
    .catch(err => {
        console.error("❌ Error enviando el mensaje:", err);
    });
