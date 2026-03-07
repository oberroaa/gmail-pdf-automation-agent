import { useEffect, useState } from "react";
import { getItems, saveItem, deleteItem, updateItem, type Item } from "../services/itemsApi";
import { Boxes, Plus, Trash2, Loader2, CheckCircle2, XCircle, Search } from "lucide-react";

export default function ItemsManager() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Nuevo: para el buscador
    // Estado para el formulario
    const [formData, setFormData] = useState({
        partNumber: "",
        description: "",
        qtyReq: 0,
        uom: "FT"
    });

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await getItems();
            setItems(data);
        } catch (err) {
            console.error("Error cargando items", err);
        } finally {
            setLoading(false);
        }
    };

    // Lógica para filtrar items según lo que escribas en el buscador
    const filteredItems = items.filter(item =>
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );


    useEffect(() => {
        loadItems();
    }, []);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.partNumber || !formData.description) return;
        try {
            await saveItem(formData);
            setFormData({ partNumber: "", description: "", qtyReq: 0, uom: "EA" });
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

    return (
        <div className="glass p-6 rounded-3xl mt-8">
            <div className="flex items-center gap-3 mb-6">
                <Boxes className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Gestión de Items (Materiales)</h2>
            </div>

            {/* Buscador de Items */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por Part Number o Descripción..."
                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-2xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>





            {/* Formulario */}
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
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
                    placeholder="UOM (EA, FT, etc)"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                    value={formData.uom}
                    onChange={e => setFormData({ ...formData, uom: e.target.value })}
                    required
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all py-2">
                    <Plus className="w-4 h-4" /> Agregar
                </button>
            </form>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-2">Part Number</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2 text-center">Qty</th>
                            <th className="px-4 py-2 text-center">UOM</th>
                            <th className="px-4 py-2 text-center">Registrado</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                            <th className="px-4 py-2 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-500" /></td></tr>
                        ) : filteredItems.map(item => (
                            <tr key={item._id} className="bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                                <td className="px-4 py-3 rounded-l-xl border-y border-l border-slate-700/50 text-white font-medium text-sm">{item.partNumber}</td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-slate-300 text-sm">{item.description}</td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-center text-white text-sm">{item.qtyReq}</td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-center text-slate-400 text-xs font-bold">{item.uom}</td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-center text-slate-500 text-[10px]">
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-3 border-y border-slate-700/50 text-center">
                                    <button onClick={() => toggleActive(item)}>
                                        {item.active ?
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> :
                                            <XCircle className="w-5 h-5 text-slate-600 mx-auto" />
                                        }
                                    </button>
                                </td>
                                <td className="px-4 py-3 rounded-r-xl border-y border-r border-slate-700/50 text-right">
                                    <button onClick={() => handleDelete(item._id!)} className="text-slate-500 hover:text-red-400 p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && items.length === 0 && (
                    <p className="text-center text-slate-500 py-10 text-sm italic">No hay items registrados aún.</p>
                )}
            </div>
        </div>
    );
}
