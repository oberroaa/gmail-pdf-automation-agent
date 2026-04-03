import React, { useEffect, useState } from "react";
import { getCanopies, saveCanopy, updateCanopy, deleteCanopy, deleteCanopies, type Canopy } from "../services/canopyApi";
import {
    Wind, Plus, Trash2, Loader2, Search, AlertCircle,
    ChevronLeft, ChevronRight, Pencil, Save, X, Layers
} from "lucide-react";

export default function CanopyManager() {
    const [canopies, setCanopies] = useState<Canopy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0); // 👈 Ya se usará abajo
    const itemsPerPage = 15;

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    // Formulario
    const [formData, setFormData] = useState({ item: "", alias: "", profile: "", telas: "", telas2: "", total: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Canopy>>({ item: "", alias: "", profile: "", telas: [], telas2: [], total: 0 });

    // Selección masiva
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getCanopies(currentPage, itemsPerPage, debouncedSearch);
            setCanopies(data.canopies);
            setTotalPages(data.totalPages);
            setTotalItems(data.total); // 👈 Guardamos el total
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

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveCanopy({
                ...formData,
                telas: formData.telas.split(",").map(t => t.trim()).filter(t => t !== ""),
                telas2: formData.telas2.split(",").map(t => t.trim()).filter(t => t !== "")
            });
            setFormData({ item: "", alias: "", profile: "", telas: "", telas2: "", total: 0 });
            await loadData();
        } catch (err) { alert("Error al guardar"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar?")) return;
        try {
            await deleteCanopy(id);
            await loadData();
        } catch (err) { alert("Error al eliminar"); }
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            await updateCanopy(editingId, editFormData);
            setEditingId(null);
            await loadData();
        } catch (err) { alert("Error al actualizar"); }
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
        <div className="glass p-6 rounded-3xl mt-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Wind className="w-5 h-5 text-sky-400" />
                    <h2 className="text-xl font-bold text-white" translate="no">Inventario Canopy</h2>
                </div>
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-red-500/20"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar seleccionados ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text" placeholder="Buscar por Item, Alias, Perfil o Tela..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-white"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-8 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                <div className="md:col-span-2">
                    <input type="text" placeholder="Item" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" value={formData.item} onChange={e => setFormData({ ...formData, item: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                    <input type="text" placeholder="Alias (PDF)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-sky-400" value={formData.alias} onChange={e => setFormData({ ...formData, alias: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                    <input type="text" placeholder="Perfil" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" value={formData.profile} onChange={e => setFormData({ ...formData, profile: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                    <input type="text" placeholder="Telas" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" value={formData.telas} onChange={e => setFormData({ ...formData, telas: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                    <input type="text" placeholder="Alt. Telas (telas2)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" value={formData.telas2} onChange={e => setFormData({ ...formData, telas2: e.target.value })} />
                </div>
                <div className="md:col-span-1">
                    <input type="number" placeholder="Stock" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm text-center" value={formData.total} onChange={e => setFormData({ ...formData, total: Number(e.target.value) })} required />
                </div>
                <div className="md:col-span-1">
                    <button type="submit" title="Agregar" className="w-full h-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center transition-all"><Plus className="w-5 h-5" /></button>
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                            <th className="px-4 py-2 w-10">
                                <input
                                    type="checkbox"
                                    className="accent-sky-500 rounded"
                                    checked={canopies.length > 0 && selectedIds.length === canopies.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-2">Item / Alias</th>
                            <th className="px-4 py-2">Perfil</th>
                            <th className="px-4 py-2">Telas (Principal e Alt.)</th>
                            <th className="px-4 py-2 text-center w-20">Total</th>
                            <th className="px-4 py-2 text-right w-24">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-sky-500" /></td></tr>
                        ) : canopies.map(c => (
                             <tr key={c._id} className={`bg-slate-800/40 hover:bg-slate-800/60 transition-colors ${selectedIds.includes(c._id!) ? 'ring-1 ring-sky-500/50 bg-sky-500/5' : ''}`}>
                                <td className="px-4 py-3 rounded-l-xl">
                                    <input
                                        type="checkbox"
                                        className="accent-sky-500 rounded"
                                        checked={selectedIds.includes(c._id!)}
                                        onChange={() => toggleSelect(c._id!)}
                                    />
                                </td>
                                <td className="px-4 py-3 text-white">
                                    <div className="flex flex-col">
                                        {editingId === c._id ? (
                                            <div className="space-y-1">
                                                <input className="bg-slate-700 p-1 rounded w-full text-xs" placeholder="Item" value={editFormData.item} onChange={e => setEditFormData({ ...editFormData, item: e.target.value })} />
                                                <input className="bg-slate-700 p-1 rounded w-full text-[10px] text-sky-400" placeholder="Alias" value={editFormData.alias} onChange={e => setEditFormData({ ...editFormData, alias: e.target.value })} />
                                            </div>
                                        ) : (
                                            <>
                                                <span className="font-bold">{c.item}</span>
                                                {c.alias && <span className="text-[10px] text-sky-400 block">{c.alias}</span>}
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-300">
                                    {editingId === c._id ? <input className="bg-slate-700 p-1 rounded w-full" value={editFormData.profile} onChange={e => setEditFormData({ ...editFormData, profile: e.target.value })} /> : c.profile}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-1">
                                            {editingId === c._id ? (
                                                <input className="bg-slate-700 p-1 rounded w-full text-xs" placeholder="Telas 1" value={editFormData.telas?.join(", ")} onChange={e => setEditFormData({ ...editFormData, telas: e.target.value.split(",").map(t => t.trim()) })} />
                                            ) : (
                                                c.telas.map((t, idx) => <span key={idx} className="bg-sky-500/10 text-sky-400 text-[10px] px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1"><Layers className="w-2 h-2" /> {t}</span>)
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 border-t border-white/5 pt-1">
                                            {editingId === c._id ? (
                                                <input className="bg-slate-800 p-1 rounded w-full text-[10px]" placeholder="Telas 2" value={editFormData.telas2?.join(", ")} onChange={e => setEditFormData({ ...editFormData, telas2: e.target.value.split(",").map(t => t.trim()) })} />
                                            ) : (
                                                c.telas2?.map((t, idx) => <span key={idx} className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1"><Layers className="w-2 h-2" /> {t}</span>)
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center text-white font-bold">
                                    {editingId === c._id ? <input type="number" className="bg-slate-700 border border-sky-500 p-1 rounded w-16 text-center" value={editFormData.total} onChange={e => setEditFormData({ ...editFormData, total: Number(e.target.value) })} /> : c.total}
                                </td>
                                <td className="px-4 py-3 rounded-r-xl text-right space-x-2">
                                    {editingId === c._id ? (
                                        <><button onClick={handleSaveEdit} className="text-emerald-400 p-1"><Save className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingId(null)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button></>
                                    ) : (
                                        <><button onClick={() => { setEditingId(c._id!); setEditFormData({ ...c }); }} className="text-slate-500 hover:text-sky-400 p-1"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(c._id!)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button></>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && canopies.length === 0 && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm italic">No se encontraron registros.</p>
                    </div>
                )}
            </div>

            {/* Paginación y Uso de totalItems */}
            {!loading && totalPages > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4 px-2">
                    <p className="text-xs text-slate-500 font-medium">
                        Mostrando <span className="text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-slate-300">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="text-slate-300">{totalItems}</span> canopies
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-slate-800 rounded-xl disabled:opacity-30"><ChevronLeft /></button>
                            <span className="text-slate-400 text-sm">Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-slate-800 rounded-xl disabled:opacity-30"><ChevronRight /></button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
