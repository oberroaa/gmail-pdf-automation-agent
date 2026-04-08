import { useEffect, useState } from "react";
import { getItems, saveItem, deleteItem, updateItem, bulkDeleteItems, type Item } from "../services/itemsApi";
import {
    Boxes, Plus, Trash2, Loader2, CheckCircle2, XCircle,
    Search, AlertCircle, ChevronLeft, ChevronRight, Pencil, Save, X
} from "lucide-react";

export default function ItemsManager() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Estados de Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 25;

    // Estado para búsqueda con retraso (debounce)
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    // Estado para el formulario
    const [formData, setFormData] = useState({
        partNumber: "",
        description: "",
        qtyReq: 0,
        uom: "EA",
        pool: false
    });
    // Estados para edición
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Item>>({});


    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await getItems(currentPage, itemsPerPage, debouncedSearch);
            setItems(data.items);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (err) {
            console.error("Error cargando items", err);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para manejar el retraso de la búsqueda y resetear página
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Efecto para cargar datos cuando cambie la página o la búsqueda final
    useEffect(() => {
        loadItems();
    }, [currentPage, debouncedSearch]);

    // Eliminamos el filtrado local: los items que vienen ya están filtrados por el servidor
    const displayItems = items;

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.partNumber || !formData.description) return;
        try {
            await saveItem(formData);
            setFormData({ partNumber: "", description: "", qtyReq: 0, uom: "EA", pool: false });
            await loadItems();
        } catch (err) {
            alert("Error al guardar el item");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este item?")) return;
        try {
            await deleteItem(id);
            await loadItems();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    const toggleActive = async (item: Item) => {
        try {
            await updateItem(item._id!, { active: !item.active });
            await loadItems();
        } catch (err) {
            alert("Error al actualizar estado");
        }
    };

    // --- LÓGICA DE SELECCIÓN ---
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === displayItems.length && displayItems.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(displayItems.map(i => i._id!));
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`¿Estás seguro de eliminar los ${selectedIds.length} items seleccionados?`)) return;

        try {
            await bulkDeleteItems(selectedIds);
            setSelectedIds([]);
            await loadItems();
        } catch (err) {
            alert("Error en el borrado masivo");
        }
    };

    const startEditing = (item: Item) => {
        setEditingId(item._id!);
        setEditFormData({ ...item });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            await updateItem(editingId, editFormData);
            setEditingId(null);
            await loadItems();
        } catch (err) {
            alert("Error al guardar los cambios");
        }
    };


    return (
        <div className="glass p-6 rounded-3xl mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Boxes className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">Gestión de Inventario</h2>
                </div>

                {/* Botón Borrado Masivo */}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-red-500/20 transition-all animate-in fade-in slide-in-from-right-4"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar ({selectedIds.length}) seleccionados
                    </button>
                )}
            </div>

            {/* Buscador */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Filtrar por Part Number o Descripción..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Formulario de Agregar */}
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                <input
                    type="text"
                    placeholder="Part Number"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                    value={formData.partNumber}
                    onChange={e => setFormData({ ...formData, partNumber: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Qty Req"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                    value={formData.qtyReq}
                    onChange={e => setFormData({ ...formData, qtyReq: Number(e.target.value) })}
                    required
                />
                <input
                    type="text"
                    placeholder="UOM"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                    value={formData.uom}
                    onChange={e => setFormData({ ...formData, uom: e.target.value })}
                    required
                />

                {/* Switch para POOL */}
                <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 hover:bg-slate-800 transition-colors group">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300">POOL:</span>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pool: !formData.pool })}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 ${formData.pool ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${formData.pool ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className={`text-[10px] font-black uppercase ${formData.pool ? 'text-indigo-400' : 'text-slate-500'}`}>
                        {formData.pool ? 'SI' : 'NO'}
                    </span>
                </div>

                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Agregar
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <th className="px-4 py-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                    checked={selectedIds.length === displayItems.length && displayItems.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-2">Part Number</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2 text-center">Qty</th>
                            <th className="px-4 py-2 text-center">UOM</th>
                            <th className="px-4 py-2 text-center italic text-indigo-400">POOL?</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                            <th className="px-4 py-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-500" /></td></tr>
                        ) : displayItems.map(item => (
                            <tr key={item._id} className={`bg-slate-800/40 hover:bg-slate-800/60 transition-colors ${selectedIds.includes(item._id!) ? 'ring-1 ring-indigo-500/50 bg-indigo-500/5' : ''}`}>
                                <td className="px-4 py-3 rounded-l-xl border-y border-l border-slate-700/50">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedIds.includes(item._id!)}
                                        onChange={() => toggleSelect(item._id!)}
                                    />
                                </td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-white font-medium text-sm">
                                    {editingId === item._id ? (
                                        <input
                                            className="bg-slate-700 border border-indigo-500 rounded px-2 py-1 text-white w-full"
                                            value={editFormData.partNumber}
                                            onChange={e => setEditFormData({ ...editFormData, partNumber: e.target.value })}
                                        />
                                    ) : item.partNumber}
                                </td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-slate-300 text-sm max-w-xs truncate">
                                    {editingId === item._id ? (
                                        <input
                                            className="bg-slate-700 border border-indigo-500 rounded px-2 py-1 text-white w-full"
                                            value={editFormData.description}
                                            onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                        />
                                    ) : item.description}
                                </td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-center text-white text-sm font-bold">
                                    {editingId === item._id ? (
                                        <input
                                            type="number"
                                            className="bg-slate-700 border border-indigo-500 rounded px-2 py-1 text-white w-20 text-center"
                                            value={editFormData.qtyReq}
                                            onChange={e => setEditFormData({ ...editFormData, qtyReq: Number(e.target.value) })}
                                        />
                                    ) : (typeof item.qtyReq === 'number' ? item.qtyReq.toFixed(0) : item.qtyReq)}
                                </td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-center text-slate-400 text-xs">
                                    {item.uom}
                                </td>
                                
                                <td className="px-4 py-3 border-y border-slate-700/50 text-center">
                                    {editingId === item._id ? (
                                        <button 
                                            onClick={() => setEditFormData({ ...editFormData, pool: !editFormData.pool })}
                                            className={`relative w-8 h-4 rounded-full transition-colors duration-200 mx-auto ${editFormData.pool ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-2 h-2 bg-white rounded-full transition-transform duration-200 ${editFormData.pool ? 'translate-x-4' : ''}`} />
                                        </button>
                                    ) : (
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${item.pool ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-700/20 text-slate-500 border border-slate-700/30'}`}>
                                            {item.pool ? 'POOL' : '-'}
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-3 border-y border-slate-700/50 text-center">
                                    <button onClick={() => toggleActive(item)}>
                                        {item.active ?
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> :
                                            <XCircle className="w-5 h-5 text-slate-600 mx-auto" />
                                        }
                                    </button>
                                </td>
                                <td className="px-4 py-3 rounded-r-xl border-y border-r border-slate-700/50 text-right space-x-2">
                                    {editingId === item._id ? (
                                        <>
                                            <button onClick={handleSaveEdit} className="text-emerald-400 hover:text-emerald-300 p-1" title="Guardar">
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button onClick={cancelEdit} className="text-slate-400 hover:text-white p-1" title="Cancelar">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEditing(item)} className="text-slate-500 hover:text-indigo-400 p-1" title="Editar">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item._id!)} className="text-slate-500 hover:text-red-400 p-1" title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && displayItems.length === 0 && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm italic">No se encontraron items.</p>
                    </div>
                )}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4 px-2">
                    <p className="text-xs text-slate-500 font-medium">
                        Mostrando <span className="text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-slate-300">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="text-slate-300">{totalItems}</span> items
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Solo mostrar si es la primera, última, o está cerca de la actual
                                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="text-slate-600 px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
