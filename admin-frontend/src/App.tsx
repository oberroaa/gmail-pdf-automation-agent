import { useEffect, useState } from "react";
import RulesList from "./components/RulesList";
import {
  getRules,
  deleteRule,
  setDefaultRule,
  updateRule,
  type Rule,
} from "./services/rulesApi";
import EditRuleModal from "./components/EditRuleModal";

export default function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [editingRule, setEditingRule] = useState<Rule | null>(null);

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

  // =========================
  // TOAST
  // =========================
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
    try {
      await updateRule(updatedRule.name, updatedRule);
      setEditingRule(null);
      await fetchRules();
      showToast(`✏️ Regla "${updatedRule.name}" actualizada`);
    } catch {
      showToast("❌ Error guardando regla");
    }
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

      {/* ===== MODAL EDITAR ===== */}
      {editingRule && (
        <EditRuleModal
          rule={editingRule}
          onClose={() => setEditingRule(null)}
          onSave={handleSaveRule}
        />
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
