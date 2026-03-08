import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aseguramos que busque el .env en la raíz del proyecto
dotenv.config({ path: path.join(__dirname, ".env") });

const uri = process.env.MONGODB_URI;
let client;
let db;

/**
 * Conecta a MongoDB y devuelve la base de datos
 */
export async function connectDB() {
    if (db) return db;

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
        console.error("❌ Error conecando a MongoDB:", error.message);
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

/**
 * Helper para obtener la coleccion de email
 */
export async function getEmailsCollection() {
    const database = await connectDB();
    return database.collection("emails");
}

/**
 * Helper para obtener la colección de items
 */
export async function getItemsCollection() {
    const database = await connectDB();
    return database.collection("items");
}

/**
 * Helper para obtener la colección de reportes
 */
export async function getReportsCollection() {
    const database = await connectDB();
    return database.collection("reports");
}
