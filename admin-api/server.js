// admin-api/server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRuleFromPrompt } from '../admin/services/ai-rule-service.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RULES_PATH = path.resolve(__dirname, '../admin/rules/rules.json');


const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta de prueba (health check)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'gmail-pdf-tuuci-admin-api'
    });
});

// Listar reglas
app.get('/rules', async (req, res) => {
    try {
        const raw = await fs.readFile(RULES_PATH, 'utf-8');
        const data = JSON.parse(raw);

        if (!Array.isArray(data.rules)) {
            return res.status(500).json({
                error: 'Invalid rules.json structure'
            });
        }

        res.json({
            default: data.default,
            count: data.rules.length,
            rules: data.rules
        });

    } catch (error) {
        console.error('Error reading rules.json:', error);
        res.status(500).json({
            error: 'Failed to load rules'
        });
    }
});



// Crear regla usando IA
app.post('/rules/ai', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                error: 'Prompt is required'
            });
        }

        // 1️⃣ Generar regla usando IA
        const newRule = await generateRuleFromPrompt(prompt);

        // 2️⃣ Leer rules.json
        const raw = await fs.readFile(RULES_PATH, 'utf-8');
        const data = JSON.parse(raw);

        // 3️⃣ Validar estructura REAL
        if (!Array.isArray(data.rules)) {
            return res.status(500).json({
                error: 'Invalid rules.json structure'
            });
        }


        // 4️⃣ Agregar nueva regla
        data.rules.push(newRule);

        // 5️⃣ Guardar archivo
        await fs.writeFile(
            RULES_PATH,
            JSON.stringify(data, null, 2),
            'utf-8'
        );

        res.status(201).json({
            message: 'Rule created successfully',
            rule: newRule
        });

    } catch (error) {
        console.error('Error creating rule via AI:', error);
        res.status(500).json({
            error: 'Failed to create rule'
        });
    }
});

// Marcar una regla como default
app.post('/rules/:name/default', async (req, res) => {
    try {
        const ruleName = decodeURIComponent(req.params.name);

        const raw = await fs.readFile(RULES_PATH, 'utf-8');
        const data = JSON.parse(raw);

        if (!Array.isArray(data.rules)) {
            return res.status(500).json({
                error: 'Invalid rules.json structure'
            });
        }

        const exists = data.rules.some(r => r.name === ruleName);

        if (!exists) {
            return res.status(404).json({
                error: 'Rule not found'
            });
        }

        data.default = ruleName;

        await fs.writeFile(
            RULES_PATH,
            JSON.stringify(data, null, 2),
            'utf-8'
        );

        res.json({
            message: 'Default rule updated',
            default: ruleName
        });

    } catch (error) {
        console.error('Error setting default rule:', error);
        res.status(500).json({
            error: 'Failed to set default rule'
        });
    }
});


// Arranque del servidor
app.listen(PORT, () => {
    console.log(`🛠️ Admin API running on port ${PORT}`);
});
