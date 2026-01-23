import { useEffect, useState } from "react";
import RulesList from "./components/RulesList";
import EditRuleModal from "./components/EditRuleModal";
import NewRuleModal from "./components/NewRuleModal";

import {
  getRules,
  deleteRule,
  setDefaultRule,
  updateRule,
  type Rule,
} from "./services/rulesApi";

export default function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);

  // =========================
  // FETCH
  // =========================
  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await getRules();
      setRules(data);
      setError("");
    } catch {
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
    setEditingRule(rule);
  };

  const handleSaveRule = async (updatedRule: Rule) => {
    await updateRule(updatedRule.name, updatedRule);
    setEditingRule(null);
    await fetchRules();
    showToast(`✏️ Regla "${updatedRule.name}" actualizada`);
  };

  const handleDelete = async (rule: Rule) => {
    setRules(prev => prev.filter(r => r.file !== rule.file));

    try {
      await deleteRule(rule.file);
      showToast(`🗑️ Regla "${rule.name}" eliminada correctamente`);
    } catch {
      showToast("❌ Error eliminando la regla");
      await fetchRules();
    }
  };


  const handleCreateRule = (rule: Rule) => {
    setRules(prev => [...prev, rule]);
    showToast(`✅ Regla "${rule.name}" creada correctamente`);
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
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Reglas disponibles
        </h1>

        <button
          onClick={() => setShowNewRule(true)}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Nueva regla
        </button>
      </div>

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

      {/* MODALES */}
      {editingRule && (
        <EditRuleModal
          rule={editingRule}
          onClose={() => setEditingRule(null)}
          onSave={handleSaveRule}
        />
      )}

      {showNewRule && (
        <NewRuleModal
          onClose={() => setShowNewRule(false)}
          onCreate={handleCreateRule}
          onError={(msg) => showToast(`❌ ${msg}`)}
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
