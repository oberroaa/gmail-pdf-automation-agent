// admin/server.js
// Servidor ADMIN con MongoDB Atlas (CRUD completo)

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { getRulesCollection, getEmailsCollection, getItemsCollection, getReportsCollection } from "../db.js";
import { generateRuleJSON } from "./ai/gemini.js";
import sendWhatsApp from "../whatsapp.js";
import multer from "multer";
import analyzePdfWithRules from "../analyze-pdf.js";
import fs from "fs";

// ================================
// PATHS & ENV
// ================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

dotenv.config({
    path: path.join(rootDir, ".env"),
});

// ================================
// APP & ROUTER
// ================================
const app = express();
const router = express.Router();
const PORT = process.env.ADMIN_PORT || 3001;
// Configuración para guardar archivos subidos temporalmente
const upload = multer({ dest: path.join(rootDir, "uploads/") });

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Middleware para CSP y Seguridad Básica
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:3001 http://localhost:5173;"
    );
    next();
});

// Logger simple
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const ms = Date.now() - start;
        console.log(
            `[ADMIN-DB] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
        );
    });
    next();
});

// ================================
// HEALTH
// ================================
// Ruta raíz global para evitar el 404
app.get("/", (req, res) => {
    res.json({
        message: "Gmail PDF Admin API is running",
        endpoints: ["/api/rules", "/api/health"]
    });
});

router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "gmail-pdf-tuuci-admin-mongodb",
        timestamp: new Date().toISOString(),
    });
});

// ================================
// LISTAR REGLAS (MongoDB)
// ================================
router.get("/rules", async (req, res) => {
    try {
        const collection = await getRulesCollection();
        const rules = await collection.find({}).sort({ isDefault: -1, name: 1 }).toArray();
        console.log(`[ADMIN] Se encontraron ${rules.length} reglas`);

        const frontRules = rules.map(r => ({
            file: `${r.name}.json`,
            name: r.name,
            description: r.description,
            ruleset: r.ruleset ?? null,
            isDefault: r.isDefault === true,
        }));

        res.json(frontRules);
    } catch (err) {
        console.error("[ADMIN][LIST RULES]", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// EDITAR REGLA (MongoDB)
// ================================
router.put("/rules/:name", async (req, res) => {
    try {
        const originalName = req.params.name;
        const incoming = req.body;

        if (incoming.name !== originalName) {
            return res.status(400).json({ error: "No se permite cambiar el nombre de la regla" });
        }

        if (originalName === "default" && incoming.isDefault !== true) {
            return res.status(400).json({ error: "La regla default no puede dejar de ser default" });
        }

        const collection = await getRulesCollection();
        const { _id, ...updateData } = incoming;

        await collection.updateOne(
            { name: originalName },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][EDIT RULE]", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// ELIMINAR REGLA (MongoDB)
// ================================
router.delete("/rules/:file", async (req, res) => {
    const fileName = decodeURIComponent(req.params.file);
    const ruleName = fileName.replace(".json", "");

    if (ruleName === "default") {
        return res.status(400).json({ error: "La regla default no puede eliminarse" });
    }

    try {
        const collection = await getRulesCollection();
        await collection.deleteOne({ name: ruleName });
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][DELETE RULE]", err);
        res.status(500).json({ error: "Error eliminando la regla" });
    }
});

// ================================
// MARCAR DEFAULT (MongoDB)
// ================================
router.post("/rules/:name/default", async (req, res) => {
    try {
        const { name } = req.params;
        const collection = await getRulesCollection();
        await collection.updateMany({}, { $set: { isDefault: false } });
        const result = await collection.updateOne(
            { name: name },
            { $set: { isDefault: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Regla no encontrada" });
        }

        res.json({ success: true, default: name });
    } catch (err) {
        console.error("[ADMIN][SET DEFAULT]", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// GUARDAR REGLA (MongoDB CREATE)
// ================================
router.post("/rules/save", async (req, res) => {
    try {
        const ruleJSON = req.body;
        const name = ruleJSON.name;

        if (!name) return res.status(400).json({ error: "Nombre de regla inválido" });

        const collection = await getRulesCollection();
        const existing = await collection.findOne({ name });
        if (existing) {
            return res.status(409).json({ error: `Ya existe una regla con el nombre "${name}"` });
        }

        await collection.insertOne({
            ...ruleJSON,
            isDefault: ruleJSON.isDefault || false,
            createdAt: new Date()
        });

        return res.status(201).json({
            success: true,
            rule: { ...ruleJSON, file: `${name}.json` }
        });

    } catch (err) {
        console.error("[ADMIN][SAVE RULE]", err);
        return res.status(500).json({ error: "Error guardando regla" });
    }
});

// ================================
// PREVIEW DE REGLA (Gemini IA)
// ================================
router.post('/rules/preview', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

        const generatedRule = await generateRuleJSON("PREVIEW_RULE", prompt);
        res.json({ generatedRule, valid: true, warnings: [] });
    } catch (err) {
        console.error('Error en preview:', err);
        res.status(500).json({ error: 'Error generando preview' });
    }
});


// ================================
// OBTENER CONFIGURACIÓN (Emails)
// ================================
router.get("/settings", async (req, res) => {
    try {
        const collection = await getEmailsCollection();
        //Buscamos todos los correos guardados
        const emails = await collection.find({}).toArray();
        //Devolvemos el correo guardado
        res.json(emails);
    } catch (err) {
        console.error("[ADMIN][GET SETTINGS]", err);
        res.status(500).json({ error: "Error al obtener la lista de correos" });
    }
});

// ================================
// GUARDAR NUEVO EMAIL
// ================================
router.post("/settings", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email requerido' });

        const collection = await getEmailsCollection();


        const existing = await collection.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: `Ya existe un correo con el email "${email}"` });
        }
        // Insertamos el nuevo correo en la base de datos
        await collection.insertOne({
            email: email,
            active: true,
            createdAt: new Date()
        });

        res.json({ success: true, message: "Email guardado correctamente" });
    } catch (err) {
        console.error("[ADMIN][SAVE SETTINGS]", err);
        res.status(500).json({ error: "Error al guardar el correo" });
    }
});

// ================================
// ELIMINAR EMAIL
// ================================
router.delete("/settings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { ObjectId } = await import("mongodb"); // Necesario para buscar por ID

        const collection = await getEmailsCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });

        res.json({ success: true, message: "Email eliminado" });
    } catch (err) {
        console.error("[ADMIN][DELETE EMAIL]", err);
        res.status(500).json({ error: "Error al eliminar el correo" });
    }
});


// ================================
// TEST WHATSAPP
// ================================
router.post("/test-whatsapp", async (req, res) => {
    try {
        const testMsg = "🔔 Prueba manual desde el Panel Admin: Conexión OK.";
        await sendWhatsApp(testMsg);
        res.json({ success: true, message: "Prueba enviada. Revisa tu WhatsApp." });
    } catch (err) {
        console.error("[ADMIN][TEST WA]", err);
        res.status(500).json({ error: "Error enviando prueba de WhatsApp" });
    }
});

// ================================
// GESTIÓN DE ITEMS (Nueva Tabla)
// ================================

// 1. Obtener todos los items (con PAGINACIÓN y BÚSQUEDA)
router.get("/items", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const collection = await getItemsCollection();

        // Creamos un filtro de búsqueda (busca en partNumber o description)
        const query = search
            ? {
                $or: [
                    { partNumber: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ]
            }
            : {};

        // Obtenemos el total de documentos que coinciden con la búsqueda
        const total = await collection.countDocuments(query);

        // Obtenemos los items de la página actual filtrados
        const items = await collection.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json({
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error("[ADMIN][GET ITEMS]", err);
        res.status(500).json({ error: "Error al obtener items" });
    }
});

// 2. Guardar un nuevo item
router.post("/items", async (req, res) => {
    try {
        const { partNumber, description, qtyReq, uom } = req.body;

        // Aquí es donde definimos la estructura que pediste:
        const newItem = {
            partNumber: String(partNumber),
            description: String(description),
            qtyReq: Math.round(Number(qtyReq) || 0), // 👈 Convierte a entero
            uom: String(uom),
            active: true,             // Activo por defecto
            createdAt: new Date()
        };

        const collection = await getItemsCollection();
        await collection.insertOne(newItem);
        res.json({ success: true, item: newItem });
    } catch (err) {
        console.error("[ADMIN][SAVE ITEM]", err);
        res.status(500).json({ error: "Error al guardar el item" });
    }
});

// 3. Eliminar un item
router.delete("/items/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { ObjectId } = await import("mongodb");
        const collection = await getItemsCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][DELETE ITEM]", err);
        res.status(500).json({ error: "Error al eliminar" });
    }
});

// 4. Editar un item existente
router.put("/items/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { partNumber, description, qtyReq, uom, active } = req.body;
        const { ObjectId } = await import("mongodb");

        // 1. Creamos un objeto de actualización vacío pero con la fecha de hoy
        const updateData = { updatedAt: new Date() };

        // 2. Solo agregamos al objeto lo que realmente venga en el "body"
        if (partNumber !== undefined) updateData.partNumber = String(partNumber);
        if (description !== undefined) updateData.description = String(description);
        if (uom !== undefined) updateData.uom = String(uom);
        if (active !== undefined) updateData.active = Boolean(active);

        // 3. Para la cantidad, aseguramos que sea entero solo si se envió una cantidad
        if (qtyReq !== undefined) {
            updateData.qtyReq = Math.round(Number(qtyReq) || 0);
        }


        const collection = await getItemsCollection();
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Item no encontrado" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][UPDATE ITEM]", err);
        res.status(500).json({ error: "Error al actualizar el item" });
    }
});

// 5. Eliminar MÚLTIPLES items
router.post("/items/bulk-delete", async (req, res) => {
    try {
        const { ids } = req.body; // Recibimos array de IDs
        if (!Array.isArray(ids)) return res.status(400).json({ error: "Se requiere un array de IDs" });

        const { ObjectId } = await import("mongodb");
        const collection = await getItemsCollection();

        const objectIds = ids.map(id => new ObjectId(id));
        await collection.deleteMany({ _id: { $in: objectIds } });

        res.json({ success: true, count: ids.length });
    } catch (err) {
        console.error("[ADMIN][BULK DELETE]", err);
        res.status(500).json({ error: "Error en el borrado masivo" });
    }
});

// ================================
// SUBIR Y ANALIZAR PDF (MANUAL)
// ================================
router.post("/upload-pdf", upload.single("pdfFile"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Por favor, selecciona un archivo PDF." });
        }

        // 1. Buscar la regla por defecto en MongoDB
        const rulesCollection = await getRulesCollection();
        const defaultRule = await rulesCollection.findOne({ isDefault: true });

        if (!defaultRule) {
            // Borrar archivo temporal y devolver error
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "No se encontró ninguna regla predeterminada (default) activa." });
        }

        // 2. Analizar el PDF usando la función existente de tu agente
        console.log(`[ADMIN] Analizando PDF manual: ${req.file.originalname}`);

        // Asignamos el nombre original al archivo temporalmente para que el historial lo guarde bien
        const tempPath = req.file.path;
        const tempPathWithName = tempPath + "-" + req.file.originalname;
        fs.renameSync(tempPath, tempPathWithName);

        // Ejecutamos tu analizador (analiza, guarda inventario y guarda reporte automáticamente)
        const resultText = await analyzePdfWithRules(tempPathWithName, defaultRule.ruleset || defaultRule);

        // 3. Limpieza: Eliminar el archivo temporal para no llenar el servidor
        fs.unlinkSync(tempPathWithName);

        // 4. Responder al Frontend que todo salió bien
        res.json({
            success: true,
            message: "Análisis completado exitosamente",
            result: resultText
        });

    } catch (err) {
        console.error("[ADMIN][UPLOAD PDF]", err);
        // Intentar borrar archivo en caso de error si aún existe
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(500).json({ error: "Ocurrió un error al analizar el PDF." });
    }
});


// ================================
// MOUNT ROUTER
// ================================
// Importante: lo montamos en '/' y en '/api' para que funcione en local y en Vercel
app.use("/api", router);
app.use("/", router);

// Error 404 handler para cualquier otra cosa
app.use((req, res) => {
    console.log(`[ADMIN-DB] 404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "Ruta no encontrada" });
});

// ================================
// HISTORIAL DE REPORTES
// ================================

// Obtener todos los reportes (paginados)
router.get("/reports", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const collection = await getReportsCollection();
        const total = await collection.countDocuments();

        const reports = await collection.find({})
            .sort({ date: -1 }) // Los más nuevos primero
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        console.error("[ADMIN][GET REPORTS]", err);
        res.status(500).json({ error: "Error al obtener historial" });
    }
});


// ================================
// EXPORT FOR VERCEL
// ================================
export default app;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log("----------------------------------------");
        console.log("🟢 ADMIN SERVER (MONGODB) STARTED");
        console.log(`📡 http://localhost:${PORT}`);
        console.log("----------------------------------------");
    });
}
