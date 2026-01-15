import { useState } from "react";

interface Props {
    onClose: () => void;
    onCreate: (name: string, prompt: string) => void;
}

export default function NewRuleModal({ onClose, onCreate }: Props) {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !prompt.trim()) {
            alert("Nombre y prompt son obligatorios");
            return;
        }

        setLoading(true);
        await onCreate(name.trim(), prompt.trim());
        setLoading(false);
    };

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
                    placeholder="Ej: Crear una regla para materiales BDA, WTK y SAT, solo KG y LB con dos decimales…"
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
