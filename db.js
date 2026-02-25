import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
let client;
let db;

/**
 * Conecta a MongoDB y devuelve la base de datos
 */
export async function connectDB() {
    if (db) return db; // Si ya estamos conectados, devolvemos la instancia

    if (!uri) {
        throw new Error("❌ MONGODB_URI no definida en el archivo .env");
    }

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db("tuuci_agent");
        console.log("🔌 Conectado a MongoDB Atlas");
        return db;
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error.message);
        throw error;
    }
}

/**
 * Helper para obtener la colección de reglas
 */
export async function getRulesCollection() {
    const database = await connectDB();
    return database.collection("rules");
}
