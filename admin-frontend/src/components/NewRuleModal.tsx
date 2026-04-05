import { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Brain, Save, RefreshCw, ChevronRight, FileJson, AlertCircle, Terminal, Settings } from "lucide-react";
import { apiFetch } from "../services/apiFetch";

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

    const handleSubmit = async () => {
        if (!name.trim() || !prompt.trim()) {
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch("/rules/preview", {
                method: "POST",
                body: JSON.stringify({ prompt: prompt.trim() })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error generando preview");
            }

            setPreviewRule(data.generatedRule);
            setPreviewOpen(true);

        } catch (err: any) {
            onError(err.message || "Error conectando con la IA");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptAndSave = async () => {
        setLoading(true);

        try {
            const res = await apiFetch("/rules/save", {
                method: "POST",
                body: JSON.stringify({
                    ...previewRule,
                    name: name.trim(),
                    prompt: prompt.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                onError(data.error || "No se pudo persistir la regla en MongoDB");
                return;
            }

            onCreate(data.rule);
            onClose();

        } catch {
            onError("Error de conexión con el backend");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/rules/preview", {
                method: "POST",
                body: JSON.stringify({ prompt: prompt.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error");
            setPreviewRule(data.generatedRule);
        } catch (err: any) {
            onError("No se pudo regenerar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4 py-8 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden glass"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">
                                    Generador de Reglas <span className="text-indigo-400">IA</span>
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">POTENCIADO POR GEMINI PRO</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {!previewOpen ? (
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">
                                    <Settings className="w-3.5 h-3.5" />
                                    Identificador Único
                                </label>
                                <input
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-600"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ej: Regla VIP - Pedidos Prioritarios"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">
                                    <Brain className="w-3.5 h-3.5" />
                                    Instrucciones para la IA
                                </label>
                                <textarea
                                    className="w-full h-44 bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-600 resize-none leading-relaxed"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe qué datos quieres extraer del PDF. Ejemplo:
'Extrae todos los materiales que empiecen por FT.'"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                <p className="text-[11px] text-indigo-300 leading-relaxed">
                                    Gemini analizará tu texto y generará una estructura JSON optimizada para el motor de procesamiento.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !prompt.trim()}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all enabled:hover:-translate-y-0.5"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                    {loading ? "Pensando..." : "Siguiente"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase">Propuesta Generada</span>
                            </div>

                            <div className="relative group">
                                <div className="absolute top-4 right-4 text-slate-600 group-hover:text-indigo-400 transition-colors">
                                    <FileJson className="w-5 h-5" />
                                </div>
                                <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-6 overflow-hidden max-h-[40vh] overflow-y-auto">
                                    <pre className="text-indigo-300 text-[13px] leading-relaxed font-mono">
                                        {JSON.stringify(previewRule, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-slate-800/30 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 rounded-lg text-slate-500">
                                        <Terminal className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">Revisa la estructura antes de guardar</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={loading}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
                                        title="Regenerar propuesta"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setPreviewOpen(false)}
                                    className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors"
                                >
                                    Atrás
                                </button>
                                <button
                                    onClick={handleAcceptAndSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all enabled:hover:-translate-y-0.5"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {loading ? "Gaurdando..." : "Confirmar y Guardar"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

