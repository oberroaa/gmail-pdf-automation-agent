import { useState, useEffect } from "react";
import { type Report, type ReportItem } from "../services/reportsApi";
import { type Item, getItems } from "../services/itemsApi";
import { ArrowLeft, Save, Trash2, CheckSquare, Square, RefreshCw, Loader2, Printer } from "lucide-react";
import { apiFetch } from "../services/apiFetch";

interface MovementItem extends ReportItem {
    p: boolean; // Producción
    e: boolean; // Entregado
    t: boolean; // Transferido
    location: string;
    subQty: string;
    subLength: string;
    subTotal: string;
    isManual?: boolean;
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

    const [newItemPN, setNewItemPN] = useState("");
    const [newItemQty, setNewItemQty] = useState("");


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
                const res = await apiFetch(`/movements/${report._id}`);
                const moveData = await res.json();

                if (moveData.found) {
                    // Redondear QTY hacia arriba al cargar
                    const roundedItems = moveData.data.items.map((it: MovementItem) => ({
                        ...it,
                        qty: Math.ceil(it.qty)
                    }));
                    setItems(roundedItems);
                    setHeader(moveData.data.header);
                } else {
                    // Si no hay guardados, creamos la lista inicial con Qty > 5
                    const filtered = report.itemsFound
                        .filter(item => item.qty > 5)
                        .map(item => ({
                            ...item,
                            qty: Math.ceil(item.qty), // Redondear QTY hacia arriba
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
            // 1. Guardamos la respuesta del servidor en 'res'
            const res = await apiFetch(`/movements`, {
                method: "POST",
                body: JSON.stringify({ reportId: report._id, items, header })
            });

            // 2. ¡IMPORTANTE! Si la respuesta NO es OK, lanzamos un error
            if (!res.ok) {
                throw new Error("Error en el servidor");
            }

            // 3. Solo si todo salió bien, mostramos el mensaje de éxito
            alert("✅ Movimientos guardados correctamente");
        } catch (err) {
            // 4. Si algo falló (arriba o en la red), venimos aquí
            alert("❌ Error al guardar: " + (err instanceof Error ? err.message : "Desconocido"));
        } finally {
            setSaving(false);
        }
    };


    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Reporte: ${report.fileName}`;
        window.print();
        document.title = originalTitle;
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

    const updateItemField = (idx: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[idx] as any)[field] = value;

        // Cálculo automático del Total de Sustitución (Multiplicación: Cantidad * Largo)
        if (field === 'subQty' || field === 'subLength') {
            const qty = parseFloat(newItems[idx].subQty || "0");
            const length = parseFloat(newItems[idx].subLength || "0");
            if (qty > 0 && length > 0) {
                newItems[idx].subTotal = (qty * length).toString();
            } else {
                newItems[idx].subTotal = "";
            }
        }

        setItems(newItems);
    };

    const removeItem = (idx: number) => {
        if (confirm("¿Quitar este item de la lista de hoy?")) {
            setItems(items.filter((_, i) => i !== idx));
        }
    };

    const addManualItem = () => {
        if (!newItemPN || !newItemQty) {
            alert("⚠️ Por favor ingresa el Part Number y la Cantidad");
            return;
        }

        // Buscamos si el material existe en nuestra lista para traer descripción y UOM
        const mat = materials.find(m => m.partNumber.toUpperCase() === newItemPN.toUpperCase());

        const newItem: MovementItem = {
            partNumber: newItemPN.toUpperCase(),
            description: mat?.description || "Añadido manualmente",
            qty: Math.ceil(Number(newItemQty)),
            uom: mat?.uom || "EA",
            p: false, e: false, t: false,
            location: "",
            subQty: "", subLength: "", subTotal: "",
            isManual: true
        };

        setItems([newItem, ...items]); // Lo pone al inicio de la tabla
        setNewItemPN(""); // Limpia los campos
        setNewItemQty("");
    };


    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500 w-10 h-10" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* BARRA SUPERIOR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/40 p-6 rounded-3xl border border-white/5 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"><ArrowLeft /></button>
                    <div>
                        <h2 className="text-xl font-bold text-white">Consola de Movimientos</h2>
                        <p className="text-slate-500 text-xs">Reporte: {report.fileName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* ENCABEZADO INTERACTIVO - MÁS COMPACTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-2">
                <div className="glass p-2 px-3 rounded-xl flex flex-col border border-white/5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Área de Trabajo</span>
                    <input type="text" value={header.area} onChange={e => setHeader({ ...header, area: e.target.value })} className="bg-transparent border-b border-white/5 outline-none text-white font-bold p-0.5 text-xs focus:border-indigo-500 transition-colors" placeholder="" />
                </div>
                <div className="glass p-2 px-3 rounded-xl flex flex-col border border-white/5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Team / Escuadrón</span>
                    <input type="text" value={header.team} onChange={e => setHeader({ ...header, team: e.target.value })} className="bg-transparent border-b border-white/5 outline-none text-white font-bold p-0.5 text-xs focus:border-indigo-500 transition-colors" placeholder="" />
                </div>
                <div className="glass p-2 px-3 rounded-xl flex flex-col border border-white/5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Fecha</span>
                    <input type="date" value={header.date} onChange={e => setHeader({ ...header, date: e.target.value })} className="bg-transparent border-b border-white/5 outline-none text-white font-bold p-0.5 text-xs focus:border-indigo-500 transition-colors" />
                </div>
            </div>
            {/* AGREGAR ITEM MANUAL */}
            <div className="flex gap-2 items-center bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 mb-4 animate-in slide-in-from-top duration-700 print:hidden">
                <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase ml-1">Nuevo Part Number</span>
                    <input
                        type="text"
                        placeholder="Ej: JAC800..."
                        value={newItemPN}
                        onChange={e => setNewItemPN(e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col w-24">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase ml-1">Qty</span>
                    <input
                        type="number"
                        placeholder="0"
                        value={newItemQty}
                        onChange={e => setNewItemQty(e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all text-center"
                    />
                </div>
                <button
                    onClick={addManualItem}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95"
                >
                    <CheckSquare size={20} />
                </button>
            </div>

            {/* TABLA DE MOVIMIENTOS */}
            <div className="glass rounded-3xl overflow-hidden overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {/* Fila 1: Títulos principales */}
                        <tr className="bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            <th rowSpan={2} className="p-2 px-3 w-20 border-r border-white/5">Item</th>
                            <th rowSpan={2} className="p-2 text-center w-16 border-r border-white/5">Qty</th>
                            <th rowSpan={2} className="p-2 text-center w-14 border-r border-white/5">Ft</th>
                            <th rowSpan={2} className="p-2 text-center w-14 border-r border-white/5">Total</th>
                            <th colSpan={3} className="p-1 text-center border-r border-white/5">Estado</th>
                            <th rowSpan={2} className="p-2 w-20 text-center border-r border-white/5">Location</th>
                            <th colSpan={3} className="p-1 text-center bg-indigo-500/5 border-r border-white/10">Substitution</th>
                            <th rowSpan={2} className="p-2 text-center w-8 text-[8px] print:hidden">X</th>
                        </tr>
                        {/* Fila 2: Sub-títulos */}
                        <tr className="bg-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5">
                            <th className="p-1 text-center border-r border-white/5 w-8">P</th>
                            <th className="p-1 text-center border-r border-white/5 w-8">E</th>
                            <th className="p-1 text-center border-r border-white/5 w-8">T</th>
                            <th className="p-1 text-center border-r border-white/5 bg-indigo-500/5 w-16">Qty</th>
                            <th className="p-1 text-center border-r border-white/5 bg-indigo-500/5 w-12">Ft</th>
                            <th className="p-1 text-center border-r border-white/10 bg-indigo-500/5 w-16">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((item, idx) => {
                            const mat = materials.find(m => m.partNumber === item.partNumber);
                            const lengthFt = (mat && mat.qtyReq > 0) ? mat.qtyReq : 12;
                            const total = Math.ceil(item.qty / lengthFt);

                            return (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group text-[13px]">
                                    <td className="p-1.5 px-3 border-r border-white/5">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-indigo-300">{item.partNumber}</div>
                                                {item.isManual && (
                                                    <span className="bg-amber-500/20 text-amber-500 text-[8px] px-1.5 py-0.5 rounded-md uppercase font-black border border-amber-500/30">
                                                        Manual
                                                    </span>
                                                )}
                                            </div>
                                            {item.job_ref && (
                                                <span className="text-[10px] text-emerald-500 font-black uppercase leading-none">Ref: {item.job_ref}</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-1.5 text-center font-mono text-white border-r border-white/5">{item.qty}</td>
                                    <td className="p-1.5 text-center text-slate-500 text-[10px] italic border-r border-white/5">{lengthFt}</td>
                                    <td className="p-1.5 text-center font-black text-indigo-400 border-r border-white/5">{total}</td>

                                    {/* ESTADOS P E T (Celdas individuales) */}
                                    <td className="p-1 text-center border-r border-white/5">
                                        <button onClick={() => toggleCheck(idx, 'p')} className={`transition-all ${item.p ? 'text-indigo-400' : 'text-slate-700 hover:text-slate-500'}`}>
                                            {item.p ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </button>
                                    </td>
                                    <td className="p-1 text-center border-r border-white/5">
                                        <button onClick={() => toggleCheck(idx, 'e')} className={`transition-all ${item.e ? 'text-indigo-400' : 'text-slate-700 hover:text-slate-500'}`}>
                                            {item.e ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </button>
                                    </td>
                                    <td className="p-1 text-center border-r border-white/5">
                                        <button onClick={() => toggleCheck(idx, 't')} className={`transition-all ${item.t ? 'text-indigo-400' : 'text-slate-700 hover:text-slate-500'}`}>
                                            {item.t ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </button>
                                    </td>

                                    {/* LOCATION */}
                                    <td className="p-1 px-1 border-r border-white/5">
                                        <input
                                            type="text"
                                            value={item.location}
                                            onChange={e => updateItemField(idx, 'location', e.target.value)}
                                            className="bg-transparent outline-none text-xs text-slate-300 w-full px-1 py-1 focus:bg-white/5 transition-all font-mono text-center"
                                            placeholder=""
                                        />
                                    </td>

                                    {/* SUSTITUCIÓN (Celdas individuales) */}
                                    <td className="p-0 border-r border-white/5 bg-indigo-500/5">
                                        <input
                                            value={item.subQty}
                                            onChange={e => updateItemField(idx, 'subQty', e.target.value)}
                                            className="w-full bg-transparent p-2 text-xs text-center text-white outline-none focus:bg-white/5"
                                            placeholder=""
                                        />
                                    </td>
                                    <td className="p-0 border-r border-white/5 bg-indigo-500/5">
                                        <input
                                            value={item.subLength}
                                            onChange={e => updateItemField(idx, 'subLength', e.target.value)}
                                            className="w-full bg-transparent p-2 text-xs text-center text-white outline-none focus:bg-white/5 font-mono"
                                            maxLength={2}
                                            placeholder=""
                                        />
                                    </td>
                                    <td className="p-0 border-r border-white/10 bg-indigo-500/5">
                                        <input
                                            value={item.subTotal}
                                            readOnly
                                            className="w-full bg-transparent p-2 text-xs text-center text-indigo-300 font-black outline-none cursor-default"
                                            placeholder=""
                                        />
                                    </td>

                                    <td className="p-0 text-center w-8 print:hidden">
                                        <button onClick={() => removeItem(idx)} className="p-1 text-slate-700 hover:text-red-500 transition-colors" title="Eliminar">
                                            <Trash2 size={16} />
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

            {/* LEYENDA DE ESTADOS */}
            <div className="flex gap-6 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 w-fit">
                <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-400 text-xs">P:</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Producción</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-400 text-xs">E:</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Entregado</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-400 text-xs">T:</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Transferido</span>
                </div>
            </div>

            {/* BOTÓN GUARDAR FLOTANTE (Móvil) */}
            <div className="md:hidden fixed bottom-6 right-6 z-50 print:hidden">
                <button
                    onClick={handleSave}
                    className="p-4 bg-indigo-600 rounded-full shadow-2xl text-white active:scale-95 transition-transform"
                >
                    <Save size={24} />
                </button>
            </div>

            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .glass, .bg-slate-800\\/40, .bg-white\\/5, .bg-indigo-500\\/10 {
                        background: transparent !important;
                        border-color: #eee !important;
                        color: black !important;
                        box-shadow: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        color: black !important;
                    }
                    th, td {
                        border: 1px solid #ddd !important;
                        color: black !important;
                        padding: 8px !important;
                    }
                    input {
                        border: none !important;
                        color: black !important;
                        font-weight: bold !important;
                    }
                    .text-white, .text-slate-200, .text-indigo-300, .text-indigo-400, .text-slate-400, .text-slate-500 {
                        color: black !important;
                    }
                    /* Estilos para el encabezado horizontal y pequeño */
                    .grid.print\\:grid-cols-3 {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 10px !important;
                        margin-bottom: 10px !important;
                    }
                    .glass.p-2.px-3 {
                        padding: 4px 8px !important;
                        border-radius: 8px !important;
                    }
                    .glass span {
                        font-size: 7px !important;
                    }
                    .glass input {
                        font-size: 10px !important;
                        height: auto !important;
                        padding: 0 !important;
                    }
                    /* Ocultar elementos marcados */
                    .print\\:hidden {
                        display: none !important;
                    }
                    /* Asegurar que el contenedor principal no tenga márgenes raros */
                    main, .max-w-6xl {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}

