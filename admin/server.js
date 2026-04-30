// admin/server.js
// Servidor ADMIN con MongoDB Atlas (CRUD completo)
import "../setup-pdf.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { getRulesCollection, getEmailsCollection, getItemsCollection, getReportsCollection, getMovementsCollection, getCanopyCollection, getCanopyHistoryCollection, getSafetyProtocolCollection, getUsersCollection } from "../db.js";
import { generateRuleJSON } from "./ai/gemini.js";
import sendWhatsApp from "../whatsapp.js";
import multer from "multer";
import analyzePdfWithRules from "../analyze-pdf.js";
import fs from "fs";
import analyzeCanopyPdf from "../analyze-canopy.js";
//Para autenticación
import bcrypt from 'bcryptjs';
import { generateToken, protect, authorize } from './auth.js';


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
// Configuración para guardar archivos subidos temporalmente (Vercel requiere /tmp)
const uploadDir = process.env.VERCEL ? "/tmp" : path.join(rootDir, "uploads/");
const upload = multer({ dest: uploadDir });

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
// AUTH: LOGIN & SETUP
// ================================

// 1. LOGIN
router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const collection = await getUsersCollection();
        const user = await collection.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user),
            });
        } else {
            res.status(401).json({ error: "Email o contraseña incorrectos" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. RUTA TEMPORAL PARA CREAR EL PRIMER ADMIN (Úsala una vez y luego la borramos)
// Consola-> Invoke-RestMethod -Uri "http://localhost:3001/api/auth/setup-admin" -Method Post
router.post("/auth/setup-admin", async (req, res) => {
    try {
        const collection = await getUsersCollection();
        const adminExists = await collection.findOne({ role: 'ADMIN' });

        if (adminExists) return res.status(400).json({ error: "Ya existe un administrador" });

        const hashedPassword = await bcrypt.hash("admin123", 10);
        await collection.insertOne({
            name: "Admin Principal",
            email: "admin@tuuci.com",
            password: hashedPassword,
            role: "ADMIN",
            createdAt: new Date()
        });

        res.json({ success: true, message: "Administrador creado: admin@tuuci.com / admin123" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// GESTIÓN DE USUARIOS (ADMIN ONLY)
// ================================

// 1. Listar usuarios
router.get("/users", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const collection = await getUsersCollection();
        const users = await collection.find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// 2. Crear usuario
router.post("/users", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        const collection = await getUsersCollection();
        const existing = await collection.findOne({ email });
        if (existing) return res.status(400).json({ error: "El email ya está registrado" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: role.toUpperCase(),
            createdAt: new Date()
        };

        await collection.insertOne(newUser);
        res.json({ success: true, message: "Usuario creado correctamente" });
    } catch (err) {
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

// 3. Eliminar usuario
router.delete("/users/:id", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { ObjectId } = await import("mongodb");
        const collection = await getUsersCollection();

        // No permitir que el admin se borre a sí mismo si fuera el caso (opcional pero recomendado)
        if (req.user.id === id) {
            return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
        }

        await collection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true, message: "Usuario eliminado" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});



// ================================
// LISTAR REGLAS (MongoDB)
// ================================
router.get("/rules", protect, async (req, res) => {
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
router.put("/rules/:name", protect, async (req, res) => {
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
router.delete("/rules/:file", protect, authorize('ADMIN'), async (req, res) => {
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
router.post("/rules/:name/default", protect, authorize('ADMIN'), async (req, res) => {
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
router.post("/rules/save", protect, authorize('ADMIN'), async (req, res) => {
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
router.post('/rules/preview', protect, async (req, res) => {
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
router.get("/settings", protect, async (req, res) => {
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
router.post("/settings", protect, authorize('ADMIN'), async (req, res) => {
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
router.delete("/settings/:id", protect, authorize('ADMIN'), async (req, res) => {
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
router.post("/test-whatsapp", protect, authorize('ADMIN'), async (req, res) => {
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
router.get("/items", protect, async (req, res) => {
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
router.post("/items", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { partNumber, description, qtyReq, uom } = req.body;

        // Aquí es donde definimos la estructura que pediste:
        const newItem = {
            partNumber: String(partNumber),
            description: String(description),
            qtyReq: Math.round(Number(qtyReq) || 0), // 👈 Convierte a entero
            uom: String(uom),
            pool: Boolean(req.body.pool || false), // 👈 Nueva variable
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
router.delete("/items/:id", protect, authorize('ADMIN'), async (req, res) => {
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
router.put("/items/:id", protect, authorize('ADMIN'), async (req, res) => {
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
        if (req.body.pool !== undefined) updateData.pool = Boolean(req.body.pool); // 👈 Nueva variable

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
router.post("/items/bulk-delete", protect, authorize('ADMIN'), async (req, res) => {
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
// GESTIÓN DE CANOPY (Nomenclador)
// ================================

// 1. Obtener todos los canopies (con Paginación y Búsqueda)
router.get("/canopy", protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const collection = await getCanopyCollection();
        const query = search
            ? {
                $or: [
                    { item: { $regex: search, $options: "i" } },
                    { alias: { $regex: search, $options: "i" } },
                    { profile: { $regex: search, $options: "i" } },
                    { telas: { $regex: search, $options: "i" } },
                    { telas2: { $regex: search, $options: "i" } },
                    { scissor: { $regex: search, $options: "i" } }
                ]
            }
            : {};

        const total = await collection.countDocuments(query);
        const canopies = await collection.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json({ canopies, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        console.error("[ADMIN][GET CANOPY]", err);
        res.status(500).json({ error: "Error al obtener canopies" });
    }
});

// 2. Guardar un nuevo canopy
router.post("/canopy", protect, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const { item, alias, profile, telas, telas2, total } = req.body;
        const newCanopy = {
            item: String(item),
            alias: String(alias || ""),
            profile: String(profile),
            telas: Array.isArray(telas) ? telas : [], // Es un arreglo de strings
            telas2: Array.isArray(telas2) ? telas2 : [], // Segundo arreglo de telas
            scissor: String(req.body.scissor || ""),
            total: Math.round(Number(total) || 0),
            createdAt: new Date()
        };

        const collection = await getCanopyCollection();
        await collection.insertOne(newCanopy);
        res.json({ success: true, canopy: newCanopy });
    } catch (err) {
        console.error("[ADMIN][SAVE CANOPY]", err);
        res.status(500).json({ error: "Error al guardar el canopy" });
    }
});

// 3. Editar un canopy
router.put("/canopy/:id", protect, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const { id } = req.params;
        const { item, alias, profile, telas, telas2, total } = req.body;
        const { ObjectId } = await import("mongodb");

        const updateData = { updatedAt: new Date() };
        if (item !== undefined) updateData.item = String(item);
        if (alias !== undefined) updateData.alias = String(alias);
        if (profile !== undefined) updateData.profile = String(profile);
        if (telas !== undefined) updateData.telas = Array.isArray(telas) ? telas : [];
        if (telas2 !== undefined) updateData.telas2 = Array.isArray(telas2) ? telas2 : [];
        if (req.body.scissor !== undefined) updateData.scissor = String(req.body.scissor);
        if (total !== undefined) updateData.total = Math.round(Number(total) || 0);

        const collection = await getCanopyCollection();
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][UPDATE CANOPY]", err);
        res.status(500).json({ error: "Error al actualizar" });
    }
});

// 4. Eliminar múltiples canopies (Debe ir ANTES de /:id para evitar conflictos)
router.delete("/canopy/bulk", protect, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ error: "IDs deben ser un array" });

        const { ObjectId } = await import("mongodb");
        const collection = await getCanopyCollection();

        const objectIds = ids.map(id => new ObjectId(id));
        await collection.deleteMany({ _id: { $in: objectIds } });

        res.json({ success: true, count: ids.length });
    } catch (err) {
        console.error("[ADMIN][BULK DELETE CANOPY]", err);
        res.status(500).json({ error: "Error al eliminar múltiples" });
    }
});

// 4.1. Eliminar un canopy
router.delete("/canopy/:id", protect, authorize('ADMIN', 'SUPERVISOR'), async (req, res) => {
    try {
        const { id } = req.params;
        const { ObjectId } = await import("mongodb");
        const collection = await getCanopyCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][DELETE CANOPY]", err);
        res.status(500).json({ error: "Error al eliminar" });
    }
});

// 4.2. Obtener Historial de Análisis de Canopy
router.get("/canopy-history", protect, authorize('ADMIN', 'SUPERVISOR', 'CONSULTOR'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const collection = await getCanopyHistoryCollection();
        
        const query = search ? {
            $or: [
                { jobId: { $regex: search, $options: "i" } },
                { item: { $regex: search, $options: "i" } },
                { profile: { $regex: search, $options: "i" } },
                { pdfSource: { $regex: search, $options: "i" } }
            ]
        } : {};

        const total = await collection.countDocuments(query);
        
        // Sumar las cantidades (qty) de los que están DISPONIBLE
        const availableStats = await collection.aggregate([
            { $match: { ...query, status: { $regex: /^DISPONIBLE$/i } } },
            { $group: { _id: null, totalQty: { $sum: "$qty" } } }
        ]).toArray();
        
        const totalAvailable = availableStats.length > 0 ? availableStats[0].totalQty : 0;

        const history = await collection.find(query)
            .sort({ status: 1, analyzedAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json({
            history,
            total,
            totalAvailable,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error("[ADMIN][GET CANOPY HISTORY]", err);
        res.status(500).json({ error: "Error al obtener el historial de Canopy" });
    }
});

// 4.3. Eliminar un registro del historial de Canopy
router.delete("/canopy-history/:id", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { ObjectId } = await import("mongodb");
        const collection = await getCanopyHistoryCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (err) {
        console.error("[ADMIN][DELETE CANOPY HISTORY]", err);
        res.status(500).json({ error: "Error al eliminar el registro" });
    }
});

// 4.4. Eliminar múltiples registros del historial de Canopy (Bulk Delete)
router.post("/canopy-history/bulk-delete", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ error: "IDs deben ser un array" });

        const { ObjectId } = await import("mongodb");
        const collection = await getCanopyHistoryCollection();

        const objectIds = ids.map(id => new ObjectId(id));
        await collection.deleteMany({ _id: { $in: objectIds } });

        res.json({ success: true, count: ids.length });
    } catch (err) {
        console.error("[ADMIN][BULK DELETE CANOPY HISTORY]", err);
        res.status(500).json({ error: "Error al eliminar múltiples registros" });
    }
});

// 5. Analizar PDF de Canopy (Nuevo Motor Independiente)
router.post("/upload-canopy", protect, async (req, res) => {
    // Usamos multer para procesar la subida (Vercel requiere /tmp)
    const uploadSingle = multer({ dest: uploadDir }).single("pdf");

    uploadSingle(req, res, async (err) => {
        if (err) return res.status(500).json({ error: "Error subiendo archivo" });
        if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });

        try {
            console.log(`📑 [CANOPY] Analizando PDF: ${req.file.originalname}`);
            const report = await analyzeCanopyPdf(req.file.path);

            // Eliminar el archivo temporal
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.json(report);
        } catch (analiseErr) {
            console.error("[ADMIN][UPLOAD CANOPY]", analiseErr);
            res.status(500).json({ error: "Error analizando el PDF de Canopy" });
        }
    });
});

// ================================
// SUBIR Y ANALIZAR PDF (MANUAL)
// ================================
router.post("/upload-pdf", protect, upload.single("pdfFile"), async (req, res) => {
    console.log(`[ADMIN] Solicitud de subida recibida: ${req.file?.originalname || "Sin nombre"}`);
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Por favor, selecciona un archivo PDF." });
        }

        // --- CAMBIO AQUÍ: Obtener el nombre de la regla del body ---
        const { ruleName } = req.body;
        const rulesCollection = await getRulesCollection();

        let selectedRule;

        // Si el usuario seleccionó una regla específica, la buscamos
        if (ruleName) {
            selectedRule = await rulesCollection.findOne({ name: ruleName });
        }

        // Si no se envió regla o no se encontró, usamos la default
        if (!selectedRule) {
            selectedRule = await rulesCollection.findOne({ isDefault: true });
        }

        if (!selectedRule) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "No se encontró la regla seleccionada ni una regla predeterminada." });
        }

        console.log(`[ADMIN] Analizando PDF con regla: ${selectedRule.name}`);

        // Preparar archivo temporal
        const tempPath = req.file.path;

        // --- CAMBIO AQUÍ: Usamos tempPath directamente para el análisis ---
        const resultText = await analyzePdfWithRules(tempPath, selectedRule.ruleset || selectedRule, req.file.originalname);

        // Limpieza (multer ya borra a veces, pero aseguramos)
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

        res.json({
            success: true,
            message: `Análisis completado con regla "${selectedRule.name}"`,
            result: resultText
        });

    } catch (err) {
        console.error("[ADMIN][UPLOAD PDF]", err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({
            error: "Error al analizar el PDF",
            details: err.message,
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack
        });
    }
});



// ================================
// HISTORIAL DE REPORTES
// ================================

// Obtener todos los reportes (paginados)
router.get("/reports", protect, async (req, res) => {
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

// Eliminar un reporte por ID
router.delete("/reports/:id", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { ObjectId } = await import("mongodb");
        const collection = await getReportsCollection();

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Reporte no encontrado" });
        }
        res.json({ success: true, message: "Reporte eliminado" });
    } catch (err) {
        console.error("[ADMIN][DELETE REPORT]", err);
        res.status(500).json({ error: "Error eliminando el reporte" });
    }
});

// ================================
// GESTIÓN DE MOVIMIENTOS (Opción A)
// ================================

// 1. Obtener los movimientos guardados de un reporte
router.get("/movements/:reportId", protect, async (req, res) => {
    try {
        const { reportId } = req.params;
        const collection = await getMovementsCollection();
        const movement = await collection.findOne({ reportId });

        if (!movement) {
            return res.json({ found: false, data: null });
        }
        res.json({ found: true, data: movement });
    } catch (err) {
        console.error("[ADMIN][GET MOVEMENTS]", err);
        res.status(500).json({ error: "Error al obtener movimientos" });
    }
});

// 2. Guardar o Actualizar movimientos del reporte
router.post("/movements", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { reportId, items, header } = req.body;
        if (!reportId) return res.status(400).json({ error: "reportId es requerido" });

        const collection = await getMovementsCollection();

        // Usamos upsert: si existe lo actualiza, si no lo crea
        await collection.updateOne(
            { reportId },
            {
                $set: {
                    items,
                    header,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        res.json({ success: true, message: "Movimientos guardados correctamente" });
    } catch (err) {
        console.error("[ADMIN][SAVE MOVEMENTS]", err);
        res.status(500).json({ error: "Error al guardar movimientos" });
    }
});


// ================================
// PROTOCOLO DE SEGURIDAD (Manejo de Grúa)
// ================================

// 1. Obtener protocolo
router.get("/safety-protocol", protect, async (req, res) => {
    try {
        const collection = await getSafetyProtocolCollection();
        const protocol = await collection.findOne({});
        res.json(protocol || null);
    } catch (err) {
        console.error("[ADMIN][GET SAFETY]", err);
        res.status(500).json({ error: "Error al obtener el protocolo de seguridad" });
    }
});

// 2. Actualizar o Crear protocolo (Solo ADMIN)
router.put("/safety-protocol", protect, authorize('ADMIN'), async (req, res) => {
    try {
        const newProtocol = req.body;
        const collection = await getSafetyProtocolCollection();
        const { _id, ...dataToSave } = newProtocol;

        await collection.replaceOne(
            {}, 
            { ...dataToSave, updatedAt: new Date() },
            { upsert: true }
        );

        res.json({ success: true, message: "Protocolo actualizado correctamente" });
    } catch (err) {
        console.error("[ADMIN][UPDATE SAFETY]", err);
        res.status(500).json({ error: "Error al actualizar el protocolo de seguridad" });
    }
});

// ================================
// MOUNT ROUTER
// ================================
// Importante: lo montamos en '/' y en '/api' para que funcione en local y en Vercel
app.use("/api", router);
app.use("/", router);

// Error 404 handler para cualquier otra cosa - SIEMPRE AL FINAL
app.use((req, res) => {
    console.log(`[ADMIN-DB] 404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "Ruta no encontrada" });
});

export default app;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log("----------------------------------------");
        console.log("🟢 ADMIN SERVER (MONGODB) STARTED");
        console.log(`📡 http://localhost:${PORT}`);
        console.log("----------------------------------------");
    });
}
