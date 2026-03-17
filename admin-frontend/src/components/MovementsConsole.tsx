import { useState, useEffect } from "react";
import { type Report, type ReportItem } from "../services/reportsApi";
import { type Item, getItems } from "../services/itemsApi";
import { ArrowLeft, Save, Trash2, CheckSquare, Square, RefreshCw, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface MovementItem extends ReportItem {
    p: boolean; // Producción
    e: boolean; // Entregado
    t: boolean; // Transferido
    location: string;
    subQty: string;
    subLength: string;
    subTotal: string;
}

interface Props {
    report: Report;
    onBack: () => void;
}

export default function MovementsConsole({ report, onBack }: Props) {
    const [items, setItems] = useState<MovementItem[]>([]);
    const [materials, setMaterials] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Encabezado editable
    const [header, setHeader] = useState({
        area: "",
        team: "",
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                // 1. Cargar materiales para saber los Length FT
                const matData = await getItems(1, 1000);
                setMaterials(matData.items);

                // 2. Intentar cargar movimientos guardados de este reporte
                const res = await fetch(`${API_URL}/movements/${report._id}`);
                const moveData = await res.json();

                if (moveData.found) {
                    setItems(moveData.data.items);
                    setHeader(moveData.data.header);
                } else {
                    // Si no hay guardados, creamos la lista inicial con Qty > 5
                    const filtered = report.itemsFound
                        .filter(item => item.qty > 5)
                        .map(item => ({
                            ...item,
                            p: false, e: false, t: false,
                            location: "",
                            subQty: "", subLength: "", subTotal: ""
                        }));
                    setItems(filtered);
                }
            } catch (err) {
                console.error("Error inicializando consola", err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [report]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`${API_URL}/movements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId: report._id, items, header })
            });
            alert("✅ Movimientos guardados correctamente");
        } catch (err) {
            alert("❌ Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const toggleCheck = (idx: number, field: 'p' | 'e' | 't') => {
        const newItems = [...items];
        const isCurrentlyChecked = newItems[idx][field];
        
        if (!isCurrentlyChecked) {
            // Si vamos a marcar 'p', quitamos 'e' y 't'
            if (field === 'p') {
                newItems[idx].e = false;
                newItems[idx].t = false;
            } 
            // Si vamos a marcar 'e' o 't', quitamos 'p'
            else {
                newItems[idx].p = false;
            }
            newItems[idx][field] = true;
        } else {
            // Si ya estaba marcado, simplemente lo desmarcamos
            newItems[idx][field] = false;
        }
        
        setItems(newItems);
    };

    const updateItemField = (idx: number, field: keyof MovementItem, value: string) => {
        const newItems = [...items];
        (newItems[idx] as any)[field] = value;
        setItems(newItems);
    };

    const removeItem = (idx: number) => {
        if (confirm("¿Quitar este item de la lista de hoy?")) {
            setItems(items.filter((_, i) => i !== idx));
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500 w-10 h-10" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* BARRA SUPERIOR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/40 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"><ArrowLeft /></button>
                    <div>
                        <h2 className="text-xl font-bold text-white">Consola de Movimientos</h2>
                        <p className="text-slate-500 text-xs">Reporte: {report.fileName}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            {/* ENCABEZADO INTERACTIVO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-2xl flex flex-col gap-1 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Área de Trabajo</span>
                    <input type="text" value={header.area} onChange={e => setHeader({ ...header, area: e.target.value })} className="bg-transparent border-b border-white/10 outline-none text-white font-bold p-1 text-sm focus:border-indigo-500 transition-colors" placeholder="Ej: ALMACÉN A" />
                </div>
                <div className="glass p-4 rounded-2xl flex flex-col gap-1 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Escuadrón / Team</span>
                    <input type="text" value={header.team} onChange={e => setHeader({ ...header, team: e.target.value })} className="bg-transparent border-b border-white/10 outline-none text-white font-bold p-1 text-sm focus:border-indigo-500 transition-colors" placeholder="Ej: TEAM ALPHA" />
                </div>
                <div className="glass p-4 rounded-2xl flex flex-col gap-1 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha Movimiento</span>
                    <input type="date" value={header.date} onChange={e => setHeader({ ...header, date: e.target.value })} className="bg-transparent border-b border-white/10 outline-none text-white font-bold p-1 text-sm focus:border-indigo-500 transition-colors" />
                </div>
            </div>

            {/* TABLA DE MOVIMIENTOS */}
            <div className="glass rounded-3xl overflow-hidden overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-2 w-24">Item (Part #)</th>
                            <th className="p-2 text-center w-16">Qty</th>
                            <th className="p-2 text-center w-16">L. Ft</th>
                            <th className="p-2 text-center w-16">Total</th>
                            <th className="p-2 text-center border-x border-white/5 w-32">P | E | T</th>
                            <th className="p-2 w-28">Location</th>
                            <th className="p-2 text-center bg-indigo-500/5 border-x border-white/10 w-64">Substitution</th>
                            <th className="p-2 text-center w-16">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((item, idx) => {
                            const mat = materials.find(m => m.partNumber === item.partNumber);
                            const lengthFt = (mat && mat.qtyReq > 0) ? mat.qtyReq : 12;
                            const total = Math.ceil(item.qty / lengthFt);

                            return (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-2">
                                        <div className="font-bold text-indigo-300 text-sm">{item.partNumber}</div>
                                    </td>

                                    <td className="p-2 text-center font-mono text-white text-sm">{item.qty}</td>
                                    <td className="p-2 text-center text-slate-500 text-xs italic">{lengthFt}</td>
                                    <td className="p-2 text-center font-black text-indigo-400 text-sm">{total}</td>

                                    {/* CHECKS P E T */}
                                    <td className="p-2 border-x border-white/5" translate="no">
                                        <div className="flex justify-center gap-3">
                                            {(['p', 'e', 't'] as const).map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => toggleCheck(idx, f)}
                                                    className={`flex flex-col items-center gap-1 transition-all ${item[f] ? 'text-indigo-400' : 'text-slate-700 hover:text-slate-500'}`}
                                                >
                                                    {item[f] ? <CheckSquare size={18} /> : <Square size={18} />}
                                                    <span className="text-[10px] font-black uppercase">{f}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </td>

                                    {/* LOCATION (Pequeño) */}
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={item.location}
                                            onChange={e => updateItemField(idx, 'location', e.target.value)}
                                            className="bg-slate-900/80 border border-white/10 outline-none text-[10px] text-slate-300 w-24 px-2 py-1.5 rounded focus:border-indigo-500 transition-all font-mono"
                                            placeholder="LOC..."
                                        />
                                    </td>

                                    {/* SUSTITUCIÓN */}
                                    <td className="p-2 bg-indigo-500/5 border-x border-white/10" translate="no">
                                        <div className="flex gap-1.5 justify-center">
                                            <input 
                                                placeholder="Cant" 
                                                autoComplete="off" 
                                                value={item.subQty} 
                                                onChange={e => updateItemField(idx, 'subQty', e.target.value)} 
                                                className="w-20 bg-slate-900/80 border border-white/10 rounded px-1.5 py-2 text-sm text-center text-white outline-none focus:border-indigo-500 placeholder:opacity-0 sm:placeholder:opacity-100" 
                                            />
                                            <input 
                                                placeholder="L." 
                                                autoComplete="off" 
                                                value={item.subLength} 
                                                onChange={e => updateItemField(idx, 'subLength', e.target.value)} 
                                                className="w-10 bg-slate-900/80 border border-white/10 rounded px-2 py-2 text-sm text-center text-white outline-none focus:border-indigo-500 placeholder:opacity-0 sm:placeholder:opacity-100 font-mono" 
                                                maxLength={2}
                                            />
                                            <input 
                                                placeholder="Tot" 
                                                autoComplete="off" 
                                                value={item.subTotal} 
                                                onChange={e => updateItemField(idx, 'subTotal', e.target.value)} 
                                                className="w-24 bg-slate-900/80 border border-indigo-500/30 rounded px-1.5 py-2 text-sm text-center text-indigo-300 font-bold outline-none placeholder:opacity-0 sm:placeholder:opacity-100" 
                                            />
                                        </div>
                                    </td>

                                    <td className="p-2 text-center">
                                        <button onClick={() => removeItem(idx)} className="p-2 text-slate-700 hover:text-red-500 transition-colors" title="Eliminar de la lista">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {items.length === 0 && (
                    <div className="p-20 text-center">
                        <Loader2 className="w-8 h-8 text-slate-800 mx-auto mb-4 animate-spin" />
                        <p className="text-slate-600 italic">No hay items con cantidad {">"} 5 para mostrar hoy.</p>
                    </div>
                )}
            </div>

            {/* BOTÓN GUARDAR FLOTANTE (Móvil) */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleSave}
                    className="p-4 bg-indigo-600 rounded-full shadow-2xl text-white active:scale-95 transition-transform"
                >
                    <Save size={24} />
                </button>
            </div>
        </div>
    );
}

