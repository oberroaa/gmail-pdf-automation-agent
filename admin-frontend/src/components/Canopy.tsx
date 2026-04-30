import React, { useEffect, useState } from "react";
import { getCanopies, saveCanopy, updateCanopy, deleteCanopy, deleteCanopies, type Canopy } from "../services/canopyApi";
import {
    Wind, Plus, Trash2, Loader2, Search,
    ChevronLeft, ChevronRight, Pencil, Save, X, Layers,
    Info, Settings, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CanopyManager() {
    const [canopies, setCanopies] = useState<Canopy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 15;

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Canopy>>({ 
        item: "", alias: "", profile: "", scissor: "", telas: [], telas2: [], total: 0 
    });

    // Selección masiva
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getCanopies(currentPage, itemsPerPage, debouncedSearch);
            setCanopies(data.canopies);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (err) {
            console.error("Error cargando canopies", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        loadData();
    }, [currentPage, debouncedSearch]);

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ item: "", alias: "", profile: "", scissor: "", telas: [], telas2: [], total: 0 });
        setShowModal(true);
    };

    const openEditModal = (canopy: Canopy) => {
        setEditingId(canopy._id!);
        setFormData({ ...canopy });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCanopy(editingId, formData);
            } else {
                await saveCanopy(formData as any);
            }
            setShowModal(false);
            await loadData();
        } catch (err) { alert("Error al procesar"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este registro?")) return;
        try {
            await deleteCanopy(id);
            await loadData();
        } catch (err) { alert("Error al eliminar"); }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`¿Eliminar ${selectedIds.length} registros seleccionados?`)) return;
        try {
            await deleteCanopies(selectedIds);
            setSelectedIds([]);
            await loadData();
        } catch (err) { alert("Error al eliminar múltiples"); }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === canopies.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(canopies.map(c => c._id!));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                        <Wind className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Inventario Canopy</h2>
                        <p className="text-slate-400 text-sm">Control centralizado de stock y configuraciones.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-3 rounded-2xl font-bold text-xs transition-all border border-red-500/20 shadow-xl shadow-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" /> Borrar ({selectedIds.length})
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl shadow-sky-600/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> NUEVO CANOPY
                    </button>
                </div>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text" 
                    placeholder="Buscar por Item, Alias, Perfil, Scissor o Tela..."
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-sm"
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-5 w-10">
                                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-sky-400 transition-colors">
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.length === canopies.length && canopies.length > 0 ? 'bg-sky-500 border-sky-500' : 'border-slate-700'}`}>
                                            {selectedIds.length === canopies.length && canopies.length > 0 && <Plus className="w-3 h-3 text-white rotate-45" />}
                                        </div>
                                    </button>
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item / Alias</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Perfil</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuración</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stock</th>
                                <th className="px-6 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-sky-500 w-10 h-10" /></td></tr>
                            ) : canopies.map(c => (
                                <tr key={c._id} className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.includes(c._id!) ? 'bg-sky-500/5' : ''}`}>
                                    <td className="px-8 py-6">
                                        <button onClick={() => toggleSelect(c._id!)} className="transition-colors">
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(c._id!) ? 'bg-sky-500 border-sky-500' : 'border-slate-800'}`}>
                                                {selectedIds.includes(c._id!) && <Plus className="w-3 h-3 text-white rotate-45" />}
                                            </div>
                                        </button>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white group-hover:text-sky-400 transition-colors leading-tight">{c.item}</span>
                                            {c.alias && <span className="text-[10px] text-sky-500/60 font-bold uppercase tracking-wider mt-0.5">{c.alias}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-xs font-bold text-slate-400">{c.profile}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-2">
                                            {c.scissor && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500/80 uppercase">
                                                    <Settings className="w-3 h-3" />
                                                    {c.scissor}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-1">
                                                {c.telas.map((t, idx) => (
                                                    <span key={idx} className="bg-white/5 text-[9px] font-bold px-2 py-0.5 rounded border border-white/5 text-slate-400 flex items-center gap-1">
                                                        <Layers className="w-2.5 h-2.5 opacity-50" /> {t}
                                                    </span>
                                                ))}
                                                {c.telas2?.map((t, idx) => (
                                                    <span key={idx} className="bg-sky-500/5 text-[9px] font-bold px-2 py-0.5 rounded border border-sky-500/10 text-sky-400/70 flex items-center gap-1">
                                                        <Layers className="w-2.5 h-2.5 opacity-50" /> {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                            <span className="text-sm font-black text-sky-400">{c.total}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => openEditModal(c)} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(c._id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="bg-white/5 px-8 py-6 flex items-center justify-between border-t border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Página {currentPage} de {totalPages} · <span className="text-slate-400">{totalItems} Total</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white disabled:opacity-20 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white disabled:opacity-20 transition-all"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* MODAL PARA AGREGAR / EDITAR */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                                        {editingId ? <Pencil className="text-sky-400" /> : <Plus className="text-sky-400" />}
                                        {editingId ? 'Editar Canopy' : 'Nuevo Canopy'}
                                    </h3>
                                    <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X /></button>
                                </div>

                                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    {/* Sección 1: Identificación */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-sky-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Info className="w-3 h-3" /> Información General
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1">ITEM ID</span>
                                                <input type="text" placeholder="Ej: VNC-OM8.5SQ" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-sky-500/30 transition-all outline-none" value={formData.item} onChange={e => setFormData({ ...formData, item: e.target.value })} required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1">ALIAS (PDF MATCH)</span>
                                                <input type="text" placeholder="Ej: OM8.5SQ" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-sky-400 font-bold focus:ring-2 focus:ring-sky-500/30 transition-all outline-none" value={formData.alias} onChange={e => setFormData({ ...formData, alias: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-500 ml-1">CANOPY PROFILE</span>
                                            <input type="text" placeholder="Ej: Market Cut Folded" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-sky-500/30 transition-all outline-none" value={formData.profile} onChange={e => setFormData({ ...formData, profile: e.target.value })} required />
                                        </div>
                                    </div>

                                    {/* Sección 2: Configuración */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Settings className="w-3 h-3" /> Configuración Técnica
                                        </label>
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-500 ml-1">SCISSOR ASSEMBLY (Opcional)</span>
                                            <input type="text" placeholder="Ej: Double Scissor" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500/30 transition-all outline-none" value={formData.scissor} onChange={e => setFormData({ ...formData, scissor: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1">TELAS PRINCIPALES (Separa por coma)</span>
                                                <textarea rows={2} placeholder="Ej: 1009003, 1009004" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-sky-500/30 transition-all outline-none resize-none" value={Array.isArray(formData.telas) ? formData.telas.join(", ") : ""} onChange={e => setFormData({ ...formData, telas: e.target.value.split(",").map(t => t.trim()).filter(t => t !== "") })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1">TELAS ALTERNATIVAS</span>
                                                <textarea rows={2} placeholder="Ej: SB6042-D" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-sky-500/30 transition-all outline-none resize-none" value={Array.isArray(formData.telas2) ? formData.telas2.join(", ") : ""} onChange={e => setFormData({ ...formData, telas2: e.target.value.split(",").map(t => t.trim()).filter(t => t !== "") })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección 3: Stock */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Package className="w-3 h-3" /> Control de Inventario
                                        </label>
                                        <div className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                                            <div className="flex-1 space-y-1">
                                                <span className="text-sm font-bold text-white block">Stock Disponible</span>
                                                <span className="text-xs text-slate-500">Cantidad total de unidades listas para producción.</span>
                                            </div>
                                            <input type="number" className="w-24 bg-slate-800 border-2 border-sky-500/30 rounded-2xl px-4 py-4 text-center text-xl font-black text-white outline-none focus:border-sky-500 transition-all" value={formData.total} onChange={e => setFormData({ ...formData, total: Number(e.target.value) })} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Cancelar</button>
                                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl shadow-sky-600/20 transition-all flex items-center gap-2">
                                        <Save className="w-4 h-4" /> {editingId ? 'GUARDAR CAMBIOS' : 'CREAR CANOPY'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
