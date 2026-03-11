import type { Rule } from "../services/rulesApi";
import { Edit2, Trash2, CheckCircle, Star, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RulesListProps {
    rules: Rule[];
    onEdit?: (rule: Rule) => void;
    onDelete?: (rule: Rule) => void;
    onSetDefault?: (rule: Rule) => void;
}

export default function RulesList({
    rules,
    onEdit,
    onDelete,
    onSetDefault,
}: RulesListProps) {
    const sortedRules = [...rules].sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return 0;
    });

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
                {sortedRules.map((rule, index) => {
                    const isDefault = rule.isDefault;

                    return (
                        <motion.div
                            key={rule.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`group relative rounded-2xl p-6 glass glass-hover border-t border-white/10 overflow-hidden
                                ${isDefault ? "ring-2 ring-indigo-500/50 bg-indigo-500/5 shadow-indigo-500/10" : ""}
                            `}
                        >
                            {/* Accent line for default */}
                            {isDefault && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-slate-800/80 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Settings className={`w-5 h-5 ${isDefault ? "text-indigo-400" : "text-slate-400"}`} />
                                </div>
                                
                                {isDefault && (
                                    <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/30">
                                        <Star className="w-3 h-3 fill-current" />
                                        ACTIVA
                                    </div>
                                )}
                            </div>

                            <h2 className="font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                                {rule.name}
                            </h2>

                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                                {rule.description || "Sin descripción proporcionada."}
                            </p>

                            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => onEdit?.(rule)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all group-hover:shadow-lg"
                                    title="Editar regla"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Editar
                                </button>

                                <button
                                    onClick={() => onSetDefault?.(rule)}
                                    disabled={isDefault}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                                        ${isDefault
                                            ? "bg-indigo-500/10 text-indigo-400 cursor-not-allowed border border-indigo-500/20"
                                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                                        }
                                    `}
                                >
                                    {isDefault ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                                    {isDefault ? "Predeterminada" : "Hacer Principal"}
                                </button>

                                <button
                                    onClick={() => onDelete?.(rule)}
                                    disabled={rule.isDefault}
                                    className={`p-2 rounded-xl transition-all
                                        ${rule.isDefault
                                            ? "text-slate-600 cursor-not-allowed"
                                            : "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        }`}
                                    title="Eliminar regla"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
