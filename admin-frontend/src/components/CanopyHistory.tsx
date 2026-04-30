import { useState, useEffect } from "react";
import { 
    History, Search, Calendar, 
    Loader2, CheckCircle2,
    ChevronLeft, ChevronRight, Trash2, CheckSquare, Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../services/apiFetch";

interface HistoryRecord {
    _id: string;
    jobId: string;
    item: string;
    profile: string;
    telas: string[];
    qty: number;
    status: string;
    analyzedAt: string;
    pdfSource: string;
}

export default function CanopyHistory() {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/canopy-history?page=${page}&limit=20&search=${search}`);
            const data = await res.json();
            if (res.ok) {
                setHistory(data.history);
                setTotalPages(data.totalPages);
                setTotal(data.total);
                setTotalAvailable(data.totalAvailable || 0);
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchHistory();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, page]);

    const handleSingleDelete = async (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar este registro del historial?")) return;
        
        try {
            const res = await apiFetch(`/canopy-history/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchHistory();
                setSelectedIds(prev => prev.filter(i => i !== id));
            }
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`¿Seguro que deseas eliminar ${selectedIds.length} registros seleccionados?`)) return;
        
        setIsDeleting(true);
        try {
            const res = await apiFetch(`/canopy-history/bulk-delete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds })
            });
            if (res.ok) {
                setSelectedIds([]);
                fetchHistory();
            }
        } catch (err) {
            alert("Error en borrado masivo");
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === history.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(history.map(h => h._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-indigo-400" />
                        Historial Canopy
                    </h2>
                    <p className="text-slate-400 mt-1">Gestión y eliminación de Jobs analizados.</p>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-xl shadow-red-600/20 transition-all active:scale-95"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Eliminar ({selectedIds.length})
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar Job, Item..."
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 w-full md:w-64 transition-all"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                        <History className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-2xl font-black text-white block leading-none">{total}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Jobs</span>
                    </div>
                </div>

                <div className="glass p-5 rounded-3xl border border-emerald-500/10 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-2xl font-black text-white block leading-none">{totalAvailable}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Encontrados</span>
                    </div>
                </div>
            </div>

            {/* Tabla de Historial */}
            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-6 py-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-indigo-400 transition-colors">
                                        {selectedIds.length === history.length && history.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Job ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item / Perfil</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Telas</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Cant.</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estatus</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha Análisis</th>
                                <th className="px-6 py-4 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Cargando...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20">
                                                <Search className="w-12 h-12 text-slate-500" />
                                                <p className="text-slate-500 font-bold text-sm">No hay registros</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((record) => (
                                        <motion.tr 
                                            key={record._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.includes(record._id) ? 'bg-indigo-500/5' : ''}`}
                                        >
                                            <td className="px-6 py-5">
                                                <button onClick={() => toggleSelect(record._id)} className="transition-colors">
                                                    {selectedIds.includes(record._id) ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5 text-slate-700 hover:text-slate-500" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{record.jobId}</span>
                                                    <span className="text-[9px] text-slate-500 font-bold truncate max-w-[120px]" title={record.pdfSource}>
                                                        {record.pdfSource}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-200">{record.item}</span>
                                                    <span className="text-[10px] text-slate-500 italic">{record.profile}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {record.telas.map((t, i) => (
                                                        <span key={i} className="bg-white/5 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-400 border border-white/5">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-sm font-black text-indigo-400">{record.qty}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase flex items-center w-fit gap-1 ${
                                                    record.status === "DISPONIBLE" ? 'bg-emerald-500/10 text-emerald-500' : 
                                                    record.status === "PARCIAL" ? 'bg-orange-500/10 text-orange-500' : 
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">{formatDate(record.analyzedAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleSingleDelete(record._id)}
                                                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Paginación Mejorada */}
                <div className="bg-white/5 px-8 py-6 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            Página {page} / {totalPages}
                        </span>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {total} Registros Totales
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            disabled={page === 1 || loading}
                            onClick={() => setPage(prev => prev - 1)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Anterior
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const p = i + 1;
                                // Solo mostramos algunas páginas si hay muchas
                                if (totalPages > 5 && Math.abs(p - page) > 1 && p !== 1 && p !== totalPages) {
                                    if (p === 2 || p === totalPages - 1) return <span key={p} className="text-slate-700 px-1">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            disabled={page === totalPages || loading}
                            onClick={() => setPage(prev => prev + 1)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
