import React, { useEffect, useState } from "react";
import { getCanopies, saveCanopy, updateCanopy, deleteCanopy, type Canopy } from "../services/canopyApi";
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
    const [formData, setFormData] = useState({ item: "", profile: "", telas: "", total: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Canopy>>({ item: "", profile: "", telas: [], total: 0 });

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
                telas: formData.telas.split(",").map(t => t.trim()).filter(t => t !== "")
            });
            setFormData({ item: "", profile: "", telas: "", total: 0 });
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

    return (
        <div className="glass p-6 rounded-3xl mt-8">
            <div className="flex items-center gap-3 mb-8">
                <Wind className="w-5 h-5 text-sky-400" />
                <h2 className="text-xl font-bold text-white">Nomenclador Canopy</h2>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text" placeholder="Buscar..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-white"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 mb-8 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                <input type="text" placeholder="Item" className="flex-[2] bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" value={formData.item} onChange={e => setFormData({ ...formData, item: e.target.value })} required />
                <input type="text" placeholder="Perfil" className="flex-[2] bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" value={formData.profile} onChange={e => setFormData({ ...formData, profile: e.target.value })} required />
                <input type="text" placeholder="Telas (A, B...)" className="flex-[2] bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" value={formData.telas} onChange={e => setFormData({ ...formData, telas: e.target.value })} />
                <input type="number" placeholder="Total" className="w-full md:w-20 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm text-center" value={formData.total} onChange={e => setFormData({ ...formData, total: Number(e.target.value) })} required />
                <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"><Plus className="w-4 h-4" /> Agregar</button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                            <th className="px-4 py-2 w-1/4">Item</th>
                            <th className="px-4 py-2 w-1/4">Perfil</th>
                            <th className="px-4 py-2">Telas</th>
                            <th className="px-4 py-2 text-center w-20">Total</th>
                            <th className="px-4 py-2 text-right w-24">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-sky-500" /></td></tr>
                        ) : canopies.map(c => (
                            <tr key={c._id} className="bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                                <td className="px-4 py-3 rounded-l-xl text-white">
                                    {editingId === c._id ? <input className="bg-slate-700 p-1 rounded w-full" value={editFormData.item} onChange={e => setEditFormData({ ...editFormData, item: e.target.value })} /> : c.item}
                                </td>
                                <td className="px-4 py-3 text-slate-300">
                                    {editingId === c._id ? <input className="bg-slate-700 p-1 rounded w-full" value={editFormData.profile} onChange={e => setEditFormData({ ...editFormData, profile: e.target.value })} /> : c.profile}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {editingId === c._id ? <input className="bg-slate-700 p-1 rounded w-full text-xs" value={editFormData.telas?.join(", ")} onChange={e => setEditFormData({ ...editFormData, telas: e.target.value.split(",").map(t => t.trim()) })} /> :
                                            c.telas.map((t, idx) => <span key={idx} className="bg-sky-500/10 text-sky-400 text-[10px] px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1"><Layers className="w-2 h-2" /> {t}</span>)}
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
