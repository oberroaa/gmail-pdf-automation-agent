import { useEffect, useState } from "react";
import RulesList from "./components/RulesList";
import { getRules, type Rule } from "./services/rulesApi";

export default function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await getRules();
        console.log("🎯 Reglas cargadas en App:", data);
        setRules(data);
      } catch (err) {
        setError("Error cargando reglas");
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  // --- HANDLERS (por ahora solo logs) ---
  const handleEdit = (rule: Rule) => {
    console.log("✏️ Editar:", rule);
  };

  const handleDelete = (rule: Rule) => {
    console.log("🗑️ Eliminar:", rule);
  };

  const handleSetDefault = (rule: Rule) => {
    console.log("⭐ Set default:", rule);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Reglas disponibles
      </h1>

      {loading && <p className="text-gray-300">Cargando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && rules.length === 0 && (
        <p className="text-gray-400">No hay reglas disponibles</p>
      )}

      {!loading && rules.length > 0 && (
        <RulesList
          rules={rules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      )}
    </div>
  );
}
