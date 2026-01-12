import type { Rule } from "../services/rulesApi";

interface RulesListProps {
    rules: Rule[];
    onEdit: (rule: Rule) => void;
    onDelete: (rule: Rule) => void;
    onSetDefault: (rule: Rule) => void;
}

export default function RulesList({
    rules,
    onEdit,
    onDelete,
    onSetDefault,
}: RulesListProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => (
                <div
                    key={rule.name}
                    className="border border-gray-600 rounded-lg p-4 bg-slate-800 text-white shadow-md"
                >
                    <h2 className="font-bold text-lg mb-1">{rule.name}</h2>
                    <p className="text-gray-300 text-sm mb-4">
                        {rule.description}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(rule)}
                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700"
                        >
                            Editar
                        </button>

                        <button
                            onClick={() => onDelete(rule)}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </button>

                        <button
                            onClick={() => onSetDefault(rule)}
                            className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
                        >
                            Default
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
