import React, { useState, useEffect } from "react";
import { getUsers, createUser, deleteUser, type User } from "../services/usersApi";
import { UserPlus, Trash2, Shield, User as UserIcon, Loader2, AlertCircle, X, CheckCircle } from "lucide-react";
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
        role: "OPERATOR"
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
            setFormData({ name: "", email: "", password: "", role: "OPERATOR" });
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
                                        <div className="grid grid-cols-3 gap-3">
                                            {['ADMIN', 'MANAGER', 'OPERATOR'].map((r) => (
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
        </div>
    );
}
