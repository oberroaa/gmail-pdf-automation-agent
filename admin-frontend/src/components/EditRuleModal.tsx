import { useState } from "react";
import type { Rule } from "../services/rulesApi";
import { motion } from "framer-motion";
import { X, Save, FileJson, AlertCircle, Info, Hash } from "lucide-react";

interface Props {
    rule: Rule;
    onClose: () => void;
    onSave: (updatedRule: Rule) => void;
}

export default function EditRuleModal({ rule, onClose, onSave }: Props) {
    const [description, setDescription] = useState(rule.description || "");
    const [rulesetStr, setRulesetStr] = useState(JSON.stringify(rule.ruleset, null, 2));
    const [error, setError] = useState("");

    const handleSave = () => {
        try {
            const parsed = JSON.parse(rulesetStr);
            onSave({
                ...rule,
                description,
                ruleset: parsed,
            });
        } catch {
            setError("El formato JSON de la regla no es válido.");
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
                                <FileJson className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">
                                    Editar Regla: <span className="text-indigo-400">{rule.name}</span>
                                </h2>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">ACTUALIZACIÓN MANUAL EN MONGODB</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">
                                <Info className="w-3.5 h-3.5" />
                                Descripción de la Regla
                            </label>
                            <textarea
                                className="w-full h-24 bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-600 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Escribe una breve descripción del propósito de esta regla..."
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">
                                <Hash className="w-3.5 h-3.5" />
                                Configuración JSON (Ruleset)
                            </label>
                            <div className="relative group">
                                <textarea
                                    spellCheck={false}
                                    className="w-full h-64 bg-slate-950/80 border border-white/5 rounded-2xl px-5 py-6 text-indigo-300 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all leading-relaxed custom-scrollbar"
                                    value={rulesetStr}
                                    onChange={(e) => setRulesetStr(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-400 font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                            >
                                <Save className="w-4 h-4" />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
