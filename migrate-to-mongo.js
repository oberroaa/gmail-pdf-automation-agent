import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const RULES_DIR = path.join(process.cwd(), "rules");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrate() {
    try {
        console.log("🚀 Iniciando migración a MongoDB...");
        await client.connect();
        const db = client.db("tuuci_agent");
        const collection = db.collection("rules");

        const files = await fs.readdir(RULES_DIR);
        const jsonFiles = files.filter(f => f.endsWith(".json"));

        for (const file of jsonFiles) {
            const filePath = path.join(RULES_DIR, file);
            const content = await fs.readFile(filePath, "utf-8");
            const rule = JSON.parse(content);

            // Usamos el nombre del archivo (sin .json) como identificador único o el campo 'name'
            const ruleName = rule.name || file.replace(".json", "");

            console.log(`📤 Subiendo regla: ${ruleName}...`);

            await collection.updateOne(
                { name: ruleName },
                { $set: { ...rule, updatedAt: new Date() } },
                { upsert: true }
            );
        }

        console.log("✅ Migración completada exitosamente.");
    } catch (error) {
        console.error("❌ Error en la migración:", error.message);
    } finally {
        await client.close();
    }
}

migrate();
