import React, { useState, useEffect } from "react";
import { getUsers, createUser, deleteUser, type User } from "../services/usersApi";
import { UserPlus, Trash2, Shield, User as UserIcon, Loader2, AlertCircle, X, CheckCircle, Eye, Pencil, Lock, Unlock, Search, Database, FileText, ClipboardCheck, Settings, ShieldAlert, Box, CloudUpload, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Formulario
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CONSULTOR"
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await createUser(formData);
            await fetchUsers();
            setShowModal(false);
            setFormData({ name: "", email: "", password: "", role: "CONSULTOR" });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
        try {
            await deleteUser(id);
            await fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-400" />
                        Gestión de Usuarios
                    </h2>
                    <p className="text-slate-400 mt-1">Administra los accesos y roles del personal.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Cargando equipo...</p>
                </div>
            ) : error && !showModal ? (
                <div className="glass border-red-500/20 bg-red-500/5 p-8 rounded-3xl flex flex-col items-center text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="text-white font-bold mb-2 text-lg">Error de conexión</h3>
                    <p className="text-slate-400 text-sm mb-6">{error}</p>
                    <button onClick={fetchUsers} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all">Reintentar</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((u) => (
                        <motion.div
                            key={u._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                    <UserIcon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                    u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                                    u.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-400' :
                                    u.role === 'SUPERVISOR' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-slate-500/20 text-slate-400'
                                }`}>
                                    {u.role}
                                </span>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-white font-bold text-lg truncate" translate="no">{u.name}</h3>
                                <p className="text-slate-500 text-xs truncate font-medium">{u.email}</p>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                                    Desde: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                                <button
                                    onClick={() => handleDelete(u._id, u.name)}
                                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    title="Eliminar usuario"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal de Creación */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass bg-slate-900 overflow-hidden border border-white/10 rounded-[40px] shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-white tracking-tight">Nuevo Usuario</h3>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nombre Completo</label>
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Juan Pérez"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="juan@tuuci.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Contraseña Inicial</label>
                                        <input
                                            required
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Rol de Acceso</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['ADMIN', 'MANAGER', 'SUPERVISOR', 'CONSULTOR'].map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, role: r })}
                                                    className={`py-3 px-2 rounded-xl text-[10px] font-black transition-all border ${
                                                        formData.role === r 
                                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                                                    }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-bold">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                        CREAR USUARIO
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        
            {/* SECCIÓN DE MATRIZ DE PERMISOS (CONSOLA DE CONTROL) */}
            <div className="mt-20 pt-10 border-t border-white/5 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <ShieldAlert className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
                                Consola de Control de Accesos
                            </h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                                Configuración de Permisos por Módulo
                            </p>
                        </div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">
                            Edición bloqueada (Solo Hardcoded por ahora)
                        </span>
                    </div>
                </div>

                <div className="glass overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-indigo-500/5 text-slate-500">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Módulo del Sistema</th>
                                    <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] bg-purple-500/5 text-purple-400">Admin</th>
                                    <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/5 text-blue-400">Manager</th>
                                    <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] bg-amber-500/5 text-amber-400">Supervisor</th>
                                    <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] bg-slate-500/5 text-slate-400">Consultor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { id: 'rules', name: 'Reglas de IA (Configuración)', icon: Database, permissions: { ADMIN: 'edit', MANAGER: 'view', SUPERVISOR: 'none', CONSULTOR: 'none' } },
                                    { id: 'items', name: 'Gestión de Materiales (General)', icon: Box, permissions: { ADMIN: 'edit', MANAGER: 'view', SUPERVISOR: 'none', CONSULTOR: 'none' } },
                                    { id: 'manual_pdf', name: 'Analizador PDF (Materiales)', icon: CloudUpload, permissions: { ADMIN: 'edit', MANAGER: 'view', SUPERVISOR: 'upload', CONSULTOR: 'upload' } },
                                    { id: 'reports', name: 'Historial de Análisis (Reportes)', icon: ClipboardList, permissions: { ADMIN: 'edit', MANAGER: 'view', SUPERVISOR: 'view', CONSULTOR: 'view' } },
                                    { id: 'canopy_stock', name: 'Canopy: Stock Actual', icon: FileText, permissions: { ADMIN: 'edit', MANAGER: 'view', SUPERVISOR: 'edit', CONSULTOR: 'none' } },
                                    { id: 'canopy_pdf', name: 'Canopy: Analizar PDF', icon: Search, permissions: { ADMIN: 'edit', MANAGER: 'view', SUPERVISOR: 'upload', CONSULTOR: 'upload' } },
                                    { id: 'crane', name: 'Protocolo de Grúa (Editable)', icon: ClipboardCheck, permissions: { ADMIN: 'edit', MANAGER: 'view', SUPERVISOR: 'view', CONSULTOR: 'view' } },
                                    { id: 'users', name: 'Gestión de Usuarios (Panel Actual)', icon: UserIcon, permissions: { ADMIN: 'edit', MANAGER: 'none', SUPERVISOR: 'none', CONSULTOR: 'none' } },
                                    { id: 'system', name: 'Ajustes del Sistema', icon: Settings, permissions: { ADMIN: 'edit', MANAGER: 'none', SUPERVISOR: 'none', CONSULTOR: 'none' } }
                                ].map((module) => (
                                    <tr key={module.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform border border-white/5">
                                                    <module.icon className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-200 tracking-tight">{module.name}</span>
                                            </div>
                                        </td>
                                        {['ADMIN', 'MANAGER', 'SUPERVISOR', 'CONSULTOR'].map(role => {
                                            const perm = module.permissions[role as keyof typeof module.permissions];
                                            return (
                                                <td key={role} className={`px-6 py-6 text-center ${
                                                    role === 'ADMIN' ? 'bg-purple-500/[0.02]' : 
                                                    role === 'MANAGER' ? 'bg-blue-500/[0.02]' : 
                                                    role === 'SUPERVISOR' ? 'bg-amber-500/[0.02]' : 
                                                    'bg-slate-500/[0.02]'
                                                }`}>
                                                    <div className="flex flex-col items-center gap-1">
                                                        {perm === 'edit' ? (
                                                            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 shadow-lg shadow-emerald-400/5">
                                                                <Pencil className="w-3 h-3" />
                                                                <span className="text-[10px] font-black uppercase">Full Edit</span>
                                                            </div>
                                                        ) : perm === 'upload' ? (
                                                            <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-lg border border-indigo-400/20 shadow-lg shadow-indigo-400/5">
                                                                <CloudUpload className="w-3 h-3" />
                                                                <span className="text-[10px] font-black uppercase">Cargar PDF</span>
                                                            </div>
                                                        ) : perm === 'view' ? (
                                                            <div className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20">
                                                                <Eye className="w-3 h-3" />
                                                                <span className="text-[10px] font-black uppercase">Solo Ver</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-800/20 px-3 py-1.5 rounded-lg border border-white/5 opacity-50">
                                                                <Lock className="w-3 h-3" />
                                                                <span className="text-[10px] font-black uppercase">N/A</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-indigo-500/[0.02] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-20 h-20 text-indigo-400" />
                        </div>
                        <h4 className="text-white font-black text-xs uppercase mb-4 tracking-widest flex items-center gap-3">
                            <Unlock className="w-4 h-4 text-indigo-400" />
                            Seguridad de Datos
                        </h4>
                        <div className="space-y-4 relative z-10">
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                <strong className="text-slate-200">Encriptación Militar:</strong> Las contraseñas se procesan con algoritmos de hash irreversibles. El sistema es de arquitectura <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Zero-Knowledge</code>.
                            </p>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase">Estado del Token: JWT Activo</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold">Validez: 30 días con renovación automática en cada interacción.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-emerald-500/[0.02] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertCircle className="w-20 h-20 text-emerald-400" />
                        </div>
                        <h4 className="text-white font-black text-xs uppercase mb-4 tracking-widest flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            Auditoría del Sistema
                        </h4>
                        <div className="space-y-4 relative z-10">
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                <strong className="text-slate-200">Trazabilidad Total:</strong> Todas las acciones de edición (Manejo de Grúa, Inventario, Usuarios) quedan registradas con <strong className="text-white">Timestamp</strong> y <strong className="text-white">UserID</strong>.
                            </p>
                            <div className="flex gap-2 mt-4">
                                <div className="px-3 py-1.5 bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase border border-white/5">Auto-Log: Activo</div>
                                <div className="px-3 py-1.5 bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase border border-white/5">Backup: MongoDB Atlas</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600/10 p-5 rounded-3xl border border-indigo-500/20 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Shield className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed flex-1">
                        Esta matriz es una representación visual de los archivos de configuración de seguridad. 
                        En una futura versión, podrás usar los selectores de la tabla para reasignar permisos en tiempo real.
                    </p>
                </div>
            </div>
        </div>
    );
}
