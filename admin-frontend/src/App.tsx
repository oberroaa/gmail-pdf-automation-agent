import { useEffect, useState } from "react";
import RulesList from "./components/RulesList";
import {
  getRules,
  deleteRule,
  setDefaultRule,
  type Rule,
} from "./services/rulesApi";

export default function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // =========================
  // FETCH
  // =========================
  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await getRules();
      setRules(data);
      setError("");
    } catch (err) {
      setError("Error cargando reglas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // =========================
  // HANDLERS
  // =========================
  const handleEdit = (rule: Rule) => {
    console.log("✏️ Editar:", rule);
  };

  const handleDelete = async (rule: Rule) => {
    const ok = confirm(`¿Eliminar la regla "${rule.name}"?`);
    if (!ok) return;

    try {
      await deleteRule(rule.name);
      await fetchRules();
      showToast(`🗑️ Regla "${rule.name}" eliminada`);
    } catch {
      showToast("❌ Error eliminando regla");
    }
  };

  const handleSetDefault = async (rule: Rule) => {
    try {
      await setDefaultRule(rule.name);
      await fetchRules();
      showToast(`⭐ "${rule.name}" es ahora la regla por defecto`);
    } catch {
      showToast("❌ Error estableciendo default");
    }
  };

  // =========================
  // RENDER
  // =========================
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

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
