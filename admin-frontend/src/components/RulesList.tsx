import type { Rule } from "../services/rulesApi";

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
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => {
                const isDefault = rule.isDefault;

                return (
                    <div
                        key={rule.name}
                        className={`relative rounded-lg p-4 shadow transition
              ${isDefault
                                ? "border-2 border-green-500 bg-green-900/20"
                                : "border border-slate-700 bg-slate-800"
                            }
            `}
                    >
                        {/* BADGE DEFAULT */}
                        {isDefault && (
                            <span className="absolute -top-3 -right-3 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow">
                                DEFAULT ⭐
                            </span>
                        )}

                        <h2 className="font-bold text-lg text-white mb-1">
                            {rule.name}
                        </h2>

                        <p className="text-gray-300 text-sm mb-4">
                            {rule.description}
                        </p>

                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => onEdit?.(rule)}
                                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                                Editar
                            </button>

                            <button
                                onClick={() => onDelete?.(rule)}
                                disabled={rule.isDefault}
                                className={`px-3 py-1 rounded 
    ${rule.isDefault
                                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                                        : "bg-red-600 hover:bg-red-500"
                                    }`}
                            >
                                🗑️ Eliminar
                            </button>


                            <button
                                disabled={isDefault}
                                onClick={() => onSetDefault?.(rule)}
                                className={`px-3 py-1 rounded text-sm font-semibold
                  ${isDefault
                                        ? "bg-green-700 text-white cursor-not-allowed opacity-70"
                                        : "bg-green-500 hover:bg-green-600 text-black"
                                    }
                `}
                            >
                                {isDefault ? "Activo" : "Hacer default"}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
