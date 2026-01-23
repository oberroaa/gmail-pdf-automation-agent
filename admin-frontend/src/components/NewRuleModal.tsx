import { useState } from "react";

interface Props {
    onClose: () => void;
    onCreate: (rule: any) => void;
    onError: (message: string) => void;
}


export default function NewRuleModal({ onClose, onCreate, onError }: Props) {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [previewRule, setPreviewRule] = useState<any | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    // =========================
    // GENERAR PREVIEW
    // =========================
    const handleSubmit = async () => {
        if (!name.trim() || !prompt.trim()) {
            alert("Nombre y prompt son obligatorios");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:3001/rules/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: prompt.trim() })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error generando preview");
            }

            setPreviewRule(data.generatedRule);
            setPreviewOpen(true);

        } catch (err: any) {
            alert(err.message || "Error generando preview");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // ACEPTAR Y GUARDAR
    // =========================
    const handleAcceptAndSave = async () => {
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3001/rules/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    prompt: prompt.trim()
                })
            });

            const data = await res.json();

            // ⛔ ERROR / DUPLICADO
            if (!res.ok) {
                onError(data.error || "No se pudo crear la regla");
                return;
            }

            // ✅ ÉXITO
            onCreate(data.rule);
            onClose();

        } catch {
            onError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };



    // =========================
    // REGENERAR PREVIEW
    // =========================
    const handleRegenerate = async () => {
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3001/rules/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: prompt.trim() })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error regenerando preview");
            }

            setPreviewRule(data.generatedRule);

        } catch (err: any) {
            alert(err.message || "Error regenerando preview");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // PREVIEW MODAL
    // =========================
    if (previewOpen && previewRule) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-slate-900 text-white w-full max-w-3xl rounded-lg shadow-xl p-6">
                    <h2 className="text-xl font-bold mb-4">🧠 Preview JSON generado</h2>

                    <pre className="bg-black text-green-400 text-sm p-4 rounded overflow-auto max-h-[60vh]">
                        {JSON.stringify(previewRule, null, 2)}
                    </pre>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => {
                                setPreviewOpen(false);
                                setPreviewRule(null);
                            }}
                            className="px-4 py-2 rounded bg-gray-600"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleRegenerate}
                            className="px-4 py-2 rounded bg-yellow-600"
                        >
                            Regenerar
                        </button>

                        <button
                            onClick={handleAcceptAndSave}
                            disabled={loading}
                            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
                        >
                            {loading ? "Guardando…" : "Aceptar y guardar"}
                        </button>

                    </div>
                </div>
            </div>
        );
    }

    // =========================
    // FORM PRINCIPAL
    // =========================
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 text-white w-full max-w-xl rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-bold mb-2">➕ Crear nueva regla</h2>

                <label className="block text-sm mb-1">Nombre</label>
                <input
                    className="w-full mb-4 px-3 py-2 rounded bg-slate-800"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Regla materiales FT (BDA, WTK, SAT)"

                />

                <label className="block text-sm mb-1">Prompt</label>
                <textarea
                    className="w-full h-40 px-3 py-2 rounded bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Ejemplo de descripción de la regla:
                                Necesito materiales tipo FT, cuyos códigos comiencen con:
                                BDA, WTK, SAT, FBR, MIL, SSP o FBW.`}
                />


                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">
                        Cancelar
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
                    >
                        {loading ? "Generando…" : "Crear con IA"}
                    </button>

                </div>
            </div>
        </div>
    );
}
