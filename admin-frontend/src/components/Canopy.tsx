import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { getCanopies, saveCanopy, updateCanopy, deleteCanopy, deleteCanopies, type Canopy } from "../services/canopyApi";
import {
    Wind, Plus, Trash2, Loader2, Search,
    ChevronLeft, ChevronRight, Pencil, Save, X, Layers,
    Info, Settings, Package, FileSpreadsheet, CheckCircle2, AlertTriangle
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
        item: "", alias: "", profile: "", frameFinish: "", scissor: false, tilt: false, telas: [], telas2: [], total: 0
    });

    // Estados temporales para el texto de las telas
    const [telasText, setTelasText] = useState("");
    const [telas2Text, setTelas2Text] = useState("");
    const [ignoredText, setIgnoredText] = useState("");

    // Selección masiva     
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Excel import
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ updated: string[]; notFound: string[] } | null>(null);

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!fileInputRef.current) return;
        fileInputRef.current.value = "";
        if (!file) return;

        setImporting(true);
        try {
            // 1. Leer el Excel
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // 2. Extraer pares [item, cantidad] saltando encabezado
            const excelItems: { item: string; total: number }[] = [];
            for (let r = 1; r < rows.length; r++) {
                const name = String(rows[r][0] ?? "").trim();
                const qty = Number(rows[r][1] ?? 0);
                if (name) excelItems.push({ item: name, total: qty });
            }

            // 3. Obtener TODO el inventario (sin paginación)
            const allData = await getCanopies(1, 9999, "");
            const allCanopies = allData.canopies;

            // 4. Matchear y actualizar
            const updated: string[] = [];
            const notFound: string[] = [];

            for (const excelRow of excelItems) {
                const match = allCanopies.find(
                    c => c.item.trim().toLowerCase() === excelRow.item.toLowerCase()
                );
                if (match && match._id) {
                    await updateCanopy(match._id, { total: excelRow.total });
                    updated.push(excelRow.item);
                } else {
                    notFound.push(excelRow.item);
                }
            }

            setImportResult({ updated, notFound });
            await loadData();
        } catch (err) {
            console.error(err);
            alert("Error procesando el Excel. Verifica el formato.");
        } finally {
            setImporting(false);
        }
    };

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
        setFormData({ item: "", alias: "", profile: "", frameFinish: "", scissor: false, tilt: false, telas: [], telas2: [], total: 0 });
        setTelasText("");
        setTelas2Text("");
        setIgnoredText("");
        setShowModal(true);
    };

    const openEditModal = (canopy: Canopy) => {
        setEditingId(canopy._id!);
        setFormData({ ...canopy });
        setTelasText(canopy.telas.join(", "));
        setTelas2Text(canopy.telas2?.join(", ") || "");
        setIgnoredText(canopy.ignored?.join(", ") || "");
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Sincronizar textos a arrays antes de enviar
            const finalData = {
                ...formData,
                telas: telasText.split(",").map(t => t.trim()).filter(t => t !== ""),
                telas2: telas2Text.split(",").map(t => t.trim()).filter(t => t !== ""),
                ignored: ignoredText.split(",").map(t => t.trim()).filter(t => t !== "")
            };

            if (editingId) {
                await updateCanopy(editingId, finalData);
            } else {
                await saveCanopy(finalData as any);
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

                    {/* Botón importar Excel */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleExcelImport}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-5 py-3 rounded-2xl font-black text-xs border border-emerald-500/20 shadow-xl shadow-emerald-600/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {importing
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <FileSpreadsheet className="w-4 h-4" />}
                        {importing ? "IMPORTANDO..." : "IMPORTAR EXCEL"}
                    </button>

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
                                            <div className="flex items-center gap-2">
                                                {c.scissor && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500/80 uppercase bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                                        <Settings className="w-3 h-3" />
                                                        DOUBLE SCISSOR
                                                    </div>
                                                )}
                                                {c.tilt && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400/80 uppercase bg-sky-400/5 px-2 py-0.5 rounded border border-sky-400/10">
                                                        <Wind className="w-3 h-3" />
                                                        INCLUDES TILT
                                                    </div>
                                                )}
                                                {c.frameFinish && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400/80 uppercase bg-red-400/5 px-2 py-0.5 rounded border border-red-400/10">
                                                        <X className="w-3 h-3" />
                                                        EXCLUDE: {c.frameFinish}
                                                    </div>
                                                )}
                                                {c.ignored && c.ignored.length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400/80 uppercase bg-rose-400/5 px-2 py-0.5 rounded border border-rose-400/10">
                                                        <X className="w-3 h-3" />
                                                        IGNORE: {c.ignored.join(", ")}
                                                    </div>
                                                )}
                                            </div>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Opciones Especiales</span>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-all">
                                                        <span className="text-sm text-slate-300">Double Scissor Assembly</span>
                                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-700 bg-transparent checked:bg-amber-500 checked:border-amber-500 transition-all" checked={!!formData.scissor} onChange={e => setFormData({ ...formData, scissor: e.target.checked })} />
                                                    </label>
                                                    <label className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-all">
                                                        <span className="text-sm text-slate-300">Includes Tilt</span>
                                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-700 bg-transparent checked:bg-sky-500 checked:border-sky-500 transition-all" checked={!!formData.tilt} onChange={e => setFormData({ ...formData, tilt: e.target.checked })} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Exclusión por Frame Finish</span>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: Vineyard DuraTeak (Si coincide, NO machea)"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-red-400 font-bold focus:ring-2 focus:ring-red-500/30 transition-all outline-none"
                                                    value={formData.frameFinish || ""}
                                                    onChange={e => setFormData({ ...formData, frameFinish: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Prefijos a Ignorar (Separa por coma)</span>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: OM, VNC (Evita match si aparece Prefijo+Alias)"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-amber-400 font-bold focus:ring-2 focus:ring-amber-500/30 transition-all outline-none"
                                                    value={ignoredText}
                                                    onChange={e => setIgnoredText(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1">TELAS PRINCIPALES (Separa por coma)</span>
                                                <textarea rows={2} placeholder="Ej: 1009003, 1009004" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-sky-500/30 transition-all outline-none resize-none" value={telasText} onChange={e => setTelasText(e.target.value)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-500 ml-1">TELAS ALTERNATIVAS</span>
                                                <textarea rows={2} placeholder="Ej: SB6042-D" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-sky-500/30 transition-all outline-none resize-none" value={telas2Text} onChange={e => setTelas2Text(e.target.value)} />
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

            {/* MODAL RESULTADO IMPORTACIÓN EXCEL */}
            <AnimatePresence>
                {importResult && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setImportResult(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <FileSpreadsheet className="text-emerald-400" />
                                    Resultado de Importación
                                </h3>
                                <button onClick={() => setImportResult(null)} className="p-2 text-slate-500 hover:text-white transition-colors"><X /></button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Actualizados */}
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        <span className="font-black text-emerald-400 text-sm">{importResult.updated.length} ITEMS ACTUALIZADOS</span>
                                    </div>
                                    {importResult.updated.length > 0 && (
                                        <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                                            {importResult.updated.map((name, i) => (
                                                <p key={i} className="text-xs text-emerald-300/70 font-mono">{name}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* No encontrados */}
                                {importResult.notFound.length > 0 && (
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                            <span className="font-black text-amber-400 text-sm">{importResult.notFound.length} NO ENCONTRADOS</span>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                                            {importResult.notFound.map((name, i) => (
                                                <p key={i} className="text-xs text-amber-300/70 font-mono">{name}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-8 py-5 bg-white/[0.02] border-t border-white/5 flex justify-end">
                                <button
                                    onClick={() => setImportResult(null)}
                                    className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl shadow-sky-600/20 transition-all"
                                >
                                    CERRAR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
