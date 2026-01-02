import express from "express";
import fs from "fs";
import analyzePdfWithRules from "../../analyze-pdf.js";
import { resolveRule, getAllRules } from "../../rules-manager.js";

export default function rulesRouter(upload) {
    const router = express.Router();

    // ================================
    // LISTAR REGLAS
    // ================================
    router.get("/", (req, res) => {
        const rules = getAllRules();
        res.json(Object.values(rules));
    });

    // ================================
    // PROBAR REGLA CON PDF
    // ================================
    router.post(
        "/test",
        upload.single("pdf"),
        async (req, res) => {
            try {
                const ruleName = req.body.rule;
                const pdfPath = req.file?.path;

                if (!pdfPath) {
                    return res.status(400).json({ error: "PDF requerido" });
                }

                const { name, ruleset } = resolveRule(ruleName);
                const result = await analyzePdfWithRules(pdfPath, ruleset);

                fs.unlinkSync(pdfPath); // limpiar

                res.json({
                    rule: name,
                    result
                });
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        }
    );

    return router;
}
