import { useEffect, useState } from "react";
import RulesList from "./components/RulesList";
import EditRuleModal from "./components/EditRuleModal";
import NewRuleModal from "./components/NewRuleModal";
import { Plus, LayoutDashboard, Brain, ScrollText, AlertTriangle, Loader2, Box, Menu, X, ClipboardList, HardHat, Wind, Search, LogOut, Shield, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmailSettings from "./components/EmailSettings";
import ItemsManager from "./components/ItemsManager";
import ReportsHistory from "./components/ReportsHistory";
import MovementsConsole from "./components/MovementsConsole"; // Importamos la nueva consola
import {
  getRules,
  deleteRule,
  setDefaultRule,
  updateRule,
  type Rule,
} from "./services/rulesApi";
import { type Report } from "./services/reportsApi"; // Importamos el tipo Report
import ManualAnalyzer from './components/ManualAnalyzer';
import CraneSafety from "./components/CraneSafety";
import CanopyManager from "./components/Canopy";
import CanopyAnalyzer from "./components/CanopyAnalyzer";
import UsersManager from "./components/UsersManager";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";

export default function App() {
  const { user, login: _login, logout, loading: authLoading } = useAuth();

  // --- HOOKS (Siempre al principio) ---
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "items" | "reports" | "manual-pdf" | "crane-safety" | "canopy" | "canopy-analyzer" | "users">("rules");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedReportForMove, setSelectedReportForMove] = useState<Report | null>(null);
  const [isMaterialHandlerOpen, setIsMaterialHandlerOpen] = useState(true);
  const [isCanopyOpen, setIsCanopyOpen] = useState(true);

  // --- FUNCIONES ---
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
    if (user) {
      fetchRules();
      // Si el usuario es CONSULTOR o SUPERVISOR, lo mandamos a Manejo de Grúa por defecto
      if ((user.role === 'CONSULTOR' || user.role === 'SUPERVISOR') && activeTab === 'rules') {
        setActiveTab('crane-safety');
      }
    }
  }, [user]);

  const navigateTo = (tab: "rules" | "items" | "reports" | "manual-pdf" | "crane-safety" | "canopy" | "canopy-analyzer" | "users") => {
    setActiveTab(tab);
    setIsMenuOpen(false);
    setSelectedReportForMove(null); // Limpiamos selección al cambiar de pestaña
  };

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

  // --- RENDERING GATES (Después de los hooks) ---
  if (authLoading) return <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center font-black text-white tracking-widest">CARGANDO...</div>;
  if (!user) return <Login />;

  return (
    <div className="min-h-screen flex bg-[#0a0c10] text-slate-200 overflow-hidden font-sans relative">

      {/* BOTÓN MENÚ MÓVIL */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-3 bg-indigo-600 rounded-xl shadow-lg text-white hover:bg-indigo-500 transition-colors print:hidden"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* OVERLAY PARA MÓVIL */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#0f1117] flex flex-col p-6 gap-8 transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Tuuci Agent</h1>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Admin Panel</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setIsMaterialHandlerOpen(!isMaterialHandlerOpen)}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 rounded-xl transition-all group"
          >
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Material Handler</span>
            <ChevronDown className={`w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isMaterialHandlerOpen ? '' : '-rotate-90'}`} />
          </button>

          <AnimatePresence>
            {isMaterialHandlerOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                <button
                  onClick={() => navigateTo("crane-safety")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'crane-safety' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  <HardHat className="w-5 h-5" />
                  Manejo de Grúa
                </button>

                {user?.role !== 'CONSULTOR' && user?.role !== 'SUPERVISOR' && (
                  <>
                    <button
                      onClick={() => navigateTo("rules")}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Reglas & IA
                    </button>

                    <button
                      onClick={() => navigateTo("items")}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'items' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                      <Box className="w-5 h-5" />
                      Materiales
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigateTo("reports")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  <ClipboardList className="w-5 h-5" />
                  Historial
                </button>

                <button
                  onClick={() => navigateTo("manual-pdf")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'manual-pdf' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Procesar PDF
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-px bg-white/5 my-2" />

          <button 
            onClick={() => setIsCanopyOpen(!isCanopyOpen)}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 rounded-xl transition-all group"
          >
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Canopy</span>
            <ChevronDown className={`w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isCanopyOpen ? '' : '-rotate-90'}`} />
          </button>

          <AnimatePresence>
            {isCanopyOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                {user?.role !== 'CONSULTOR' && (
                  <button
                    onClick={() => navigateTo("canopy")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'canopy' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
                    translate="no"
                  >
                    <Wind className="w-5 h-5" />
                    Stock Actual
                  </button>
                )}
                <button
                  onClick={() => navigateTo("canopy-analyzer")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'canopy-analyzer' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-slate-400'}`}
                  translate="no"
                >
                  <Search className="w-5 h-5" />
                  Analizar PDF
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {user?.role === 'ADMIN' && (
            <>
              <div className="h-px bg-white/5 my-2" />
              <button
                onClick={() => navigateTo("users")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/30' : 'hover:bg-white/5 text-slate-400'}`}
              >
                <Shield className="w-5 h-5" />
                Gestionar Usuarios
              </button>
            </>
          )}

        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 px-2 space-y-4">
          {user && (
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-xs font-black text-indigo-400">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{user.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (confirm("¿Cerrar sesión?")) logout();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all font-semibold text-sm group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Cerrar Sesión
          </button>

          <div className="flex items-center gap-2 text-emerald-500 px-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Servicio Online</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0c10] to-[#11141d] relative">
        <div className="max-w-6xl mx-auto p-4 md:p-8 pt-16 md:pt-10">

          <AnimatePresence mode="wait">
            {activeTab === "rules" ? (
              <motion.div key="rules" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white">Configuración IA</h2>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">Gestiona las reglas de extracción y destinatarios.</p>
                  </div>
                  <button onClick={() => setShowNewRule(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5 w-full md:w-auto justify-center">
                    <Plus className="w-4 h-4" />
                    Nueva Regla
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <div className="glass p-6 rounded-3xl text-center">
                    <LayoutDashboard className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                    <span className="text-2xl font-black text-white block">{rules.length}</span>
                    <h3 className="text-sm font-semibold text-slate-400">Reglas Totales</h3>
                  </div>
                  <div className="glass p-6 rounded-3xl text-center">
                    <Brain className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <span className="text-2xl font-black text-white block">IA</span>
                    <h3 className="text-sm font-semibold text-slate-400">Analisis Proactivo</h3>
                  </div>
                  <div className="glass p-6 rounded-3xl text-center">
                    <ScrollText className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                    <span className="text-2xl font-black text-white block">ON</span>
                    <h3 className="text-sm font-semibold text-slate-400">Agente Monitor</h3>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 opacity-50">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium tracking-wide">Sincronizando...</p>
                  </div>
                ) : error ? (
                  <div className="glass border-red-500/20 bg-red-500/5 p-8 rounded-3xl flex flex-col items-center text-center">
                    <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="text-white font-bold mb-2 text-lg">Error de conexión</h3>
                    <button onClick={fetchRules} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all mt-4">Reintentar</button>
                  </div>
                ) : (
                  <>
                    <RulesList rules={rules} onEdit={handleEdit} onDelete={handleDelete} onSetDefault={handleSetDefault} />
                    <div className="mt-8">
                      <EmailSettings />
                    </div>
                  </>
                )}
              </motion.div>

            ) : activeTab === "items" ? (
              <motion.div key="items" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-black text-white">Inventario</h2>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">Items configurados para identificación automática.</p>
                </div>
                <ItemsManager />
              </motion.div>

            ) : activeTab === "reports" ? (
              <motion.div key="reports" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-black text-white">Historial de Reportes</h2>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">Consulta los resultados de los análisis diarios.</p>
                </div>
                {/* LÓGICA DE NAVEGACIÓN ENTRE HISTORIAL Y CONSOLA */}
                {selectedReportForMove ? (
                  <MovementsConsole
                    report={selectedReportForMove}
                    onBack={() => setSelectedReportForMove(null)}
                  />
                ) : (
                  <ReportsHistory onMove={(report) => setSelectedReportForMove(report)} />
                )}
              </motion.div>

            ) : activeTab === "manual-pdf" ? (
              <motion.div key="manual-pdf" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-black text-white">Analizador Manual de PDF</h2>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">Sube un PDF para análisis inmediato.</p>
                </div>
                <ManualAnalyzer />
              </motion.div>
            ) : activeTab === "crane-safety" ? (
              <motion.div key="crane-safety" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <CraneSafety />
              </motion.div>
            ) : activeTab === "canopy" ? (
              <motion.div key="canopy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <CanopyManager />
              </motion.div>
            ) : activeTab === "canopy-analyzer" ? (
              <motion.div key="canopy-analyzer" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <CanopyAnalyzer />
              </motion.div>
            ) : activeTab === "users" ? (
              <motion.div key="users" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <UsersManager />
              </motion.div>
            ) : null}

          </AnimatePresence>

        </div>
      </main>

      {/* MODALES & NOTIFICACIONES */}
      <AnimatePresence>
        {editingRule && (
          <EditRuleModal rule={editingRule} onClose={() => setEditingRule(null)} onSave={handleSaveRule} />
        )}
        {showNewRule && (
          <NewRuleModal onClose={() => setShowNewRule(false)} onCreate={handleCreateRule} onError={(msg) => showToast(msg, "error")} />
        )}
        {toast && (
          <motion.div initial={{ opacity: 0, scale: 0.9, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: 20 }} className={`fixed bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl glass border-l-4 ${toast.type === "success" ? "border-l-emerald-500" : toast.type === "error" ? "border-l-red-500" : "border-l-indigo-500"}`}>
            <div className={`p-1.5 rounded-lg ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-500" : toast.type === "error" ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"}`}>
              {toast.type === "success" ? <CheckCircleIcon className="w-4 h-4" /> : toast.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </div>
            <span className="text-xs md:text-sm font-semibold text-white">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
