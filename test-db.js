import { getItemsCollection } from "./db.js";

async function testLearning() {
    try {
        console.log("🧪 Iniciando prueba de guardado automático...");
        const itemsColl = await getItemsCollection();

        const testPart = "TEST-PART-123";

        // Simular la lógica que pusimos en analyze-pdf.js
        const existing = await itemsColl.findOne({ partNumber: testPart });

        if (!existing) {
            await itemsColl.insertOne({
                partNumber: testPart,
                description: "Material de Prueba (Borrar luego)",
                qtyReq: 10,
                uom: "EA",
                active: true,
                createdAt: new Date()
            });
            console.log("✅ ¡ÉXITO! El material de prueba ha sido guardado en la base de datos.");
        } else {
            console.log("ℹ️ El material de prueba ya existía.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR en la prueba:", err);
        process.exit(1);
    }
}

testLearning();
