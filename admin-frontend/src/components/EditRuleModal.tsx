import { useState } from "react";
import type { Rule } from "../services/rulesApi";

interface Props {
    rule: Rule;
    onClose: () => void;
    onSave: (data: Rule) => Promise<void>;
}

export default function EditRuleModal({ rule, onClose, onSave }: Props) {
    const [description, setDescription] = useState(rule.description || "");
    const [rulesetText, setRulesetText] = useState(
        JSON.stringify(rule.ruleset, null, 2)
    );
    const [error, setError] = useState("");

    const handleSave = async () => {
        try {
            const parsedRuleset = JSON.parse(rulesetText);

            await onSave({
                ...rule,
                description,
                ruleset: parsedRuleset,
            });

            onClose();
        } catch (err) {
            setError("❌ JSON inválido en ruleset");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-3xl shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">
                    Editar regla: {rule.name}
                </h2>

                {error && <p className="text-red-400 mb-3">{error}</p>}

                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Descripción</label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">
                        Ruleset (JSON)
                    </label>
                    <textarea
                        rows={12}
                        value={rulesetText}
                        onChange={(e) => setRulesetText(e.target.value)}
                        className="w-full p-2 font-mono text-sm rounded bg-slate-800 text-white border border-slate-700"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
}