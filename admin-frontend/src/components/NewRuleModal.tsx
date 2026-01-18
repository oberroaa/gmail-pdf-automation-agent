import { useState } from "react";

interface Props {
    onClose: () => void;
    onCreate: (rule: any) => void;
}

export default function NewRuleModal({ onClose, onCreate }: Props) {

    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [previewRule, setPreviewRule] = useState<any | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !prompt.trim()) {
            alert("Nombre y prompt son obligatorios");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:3001/rules/preview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: prompt.trim()
                })
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

    const handleAcceptAndSave = async () => {
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3001/rules/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim(),
                    prompt: prompt.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error guardando regla");
            }

            // Cerrar todo
            onCreate({
                file: `${name}.json`,
                name,
                description: previewRule.description,
                ruleset: previewRule.ruleset,
                isDefault: false
            });

            setPreviewOpen(false);
            setPreviewRule(null);
            onClose();


        } catch (err: any) {
            alert(err.message || "Error guardando regla");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3001/rules/preview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: prompt.trim()
                })
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
                            disabled={loading}
                            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500"
                        >
                            {loading ? "Regenerando…" : "Regenerar"}
                        </button>

                        <button
                            onClick={handleAcceptAndSave}
                            disabled={loading}
                            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
                        >
                            {loading ? "Guardando…" : "Aceptar y guardar"}
                        </button>
                    </div>


                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 text-white w-full max-w-xl rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-bold mb-2">➕ Crear nueva regla</h2>

                <p className="text-sm text-gray-400 mb-4">
                    Describe la regla en lenguaje natural.
                    La IA generará automáticamente el JSON.
                </p>

                <label className="block text-sm mb-1">Nombre de la regla</label>
                <input
                    className="w-full mb-4 px-3 py-2 rounded bg-slate-800 border border-slate-700"
                    placeholder="Ej: Regla_BDA_WTK_SAT"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label className="block text-sm mb-1">Prompt para la IA</label>
                <textarea
                    className="w-full h-40 px-3 py-2 rounded bg-slate-800 border border-slate-700"
                    placeholder="Ej: Crear una regla para materiales BDA, WTK y SAT, solo FT y EA con dos decimales…"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
                    >
                        {loading ? "Generando…" : "Crear con IA"}
                    </button>
                </div>
            </div>
        </div>
    );
}
