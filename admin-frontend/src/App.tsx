import { useEffect, useState } from "react";
import RulesList from "./components/RulesList";
import EditRuleModal from "./components/EditRuleModal";
import NewRuleModal from "./components/NewRuleModal";
import { Plus, LayoutDashboard, Brain, ScrollText, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await getRules();
      setRules(data);
      setError("");
    } catch {
      setError("No se pudieron cargar las reglas de MongoDB");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (rule: Rule) => setEditingRule(rule);

  const handleSaveRule = async (updatedRule: Rule) => {
    try {
      await updateRule(updatedRule.name, updatedRule);
      setEditingRule(null);
      await fetchRules();
      showToast(`✏️ Regla "${updatedRule.name}" actualizada`, "info");
    } catch {
      showToast("❌ Error al actualizar la regla", "error");
    }
  };

  const handleDelete = async (rule: Rule) => {
    const originalRules = [...rules];
    setRules(prev => prev.filter(r => r.file !== rule.file));

    try {
      await deleteRule(rule.file);
      showToast(`🗑️ Regla "${rule.name}" eliminada correctamente`, "info");
    } catch {
      showToast("❌ Error eliminando la regla", "error");
      setRules(originalRules);
    }
  };

  const handleCreateRule = (rule: Rule) => {
    setRules(prev => [...prev, rule]);
    showToast(`✅ Regla "${rule.name}" creada`, "success");
  };

  const handleSetDefault = async (rule: Rule) => {
    try {
      await setDefaultRule(rule.name);
      await fetchRules();
      showToast(`⭐ "${rule.name}" es ahora la regla principal`, "success");
    } catch {
      showToast("❌ Error estableciendo default", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* SIDEBAR / HEADER COMBINED */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/60 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Tuuci Agent <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">ADMIN</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">AUTOMATIZACIÓN DE PDF & GMAIL</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewRule(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Nueva Regla
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
        {/* STATS / HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass p-6 rounded-3xl group">
            <div className="flex justify-between items-center mb-4">
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
              <span className="text-2xl font-black text-white">{rules.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-400">Reglas Totales</h3>
            <p className="text-xs text-slate-500 mt-2">Configuradas en MongoDB Atlas</p>
          </div>

          <div className="glass p-6 rounded-3xl group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 text-indigo-500/10">
              <Sparkles className="w-20 h-20" />
            </div>
            <div className="flex justify-between items-center mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-black text-white">IA</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-400">Analisis Proactivo</h3>
            <p className="text-xs text-slate-500 mt-2">Gemini Pro habilitado</p>
          </div>

          <div className="glass p-6 rounded-3xl group">
            <div className="flex justify-between items-center mb-4">
              <ScrollText className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-black text-white">ON</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-400">Estado del Agente</h3>
            <p className="text-xs text-slate-500 mt-2">GitHub Actions Monitorizando</p>
          </div>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <ScrollText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Reglas Disponibles</h2>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Sincronizando con la nube...</p>
            </div>
          )}

          {error && (
            <div className="glass border-red-500/20 bg-red-500/5 p-8 rounded-3xl flex flex-col items-center text-center">
              <div className="p-4 bg-red-500/10 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Error de conexión</h3>
              <p className="text-red-300/80 text-sm max-w-sm mb-6">{error}</p>
              <button
                onClick={fetchRules}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && rules.length === 0 && (
            <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-slate-700">
              <div className="p-4 bg-slate-800/50 rounded-full w-fit mx-auto mb-4">
                <Plus className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-6 font-medium">No se encontraron reglas en la base de datos.</p>
              <button
                onClick={() => setShowNewRule(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
              >
                Crear Mi Primera Regla
              </button>
            </div>
          )}

          {!loading && !error && rules.length > 0 && (
            <RulesList
              rules={rules}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          )}
        </section>
      </main>

      {/* MODALES */}
      <AnimatePresence>
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
            onError={(msg) => showToast(msg, "error")}
          />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl glass border-l-4 
                ${toast.type === "success" ? "border-l-emerald-500" : toast.type === "error" ? "border-l-red-500" : "border-l-indigo-500"}
            `}
          >
            <div className={`p-1.5 rounded-lg 
                ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-500" : toast.type === "error" ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"}
            `}>
              {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : toast.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </div>
            <span className="text-sm font-semibold text-white whitespace-nowrap">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
