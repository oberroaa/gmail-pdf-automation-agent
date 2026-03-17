import { useEffect, useState } from "react";
import { getReports, deleteReport, type Report } from "../services/reportsApi";
import { ClipboardList, Calendar, FileText, ChevronDown, ChevronUp, Loader2, AlertCircle, Trash2, Truck } from "lucide-react";

export default function ReportsHistory({ onMove }: { onMove: (report: Report) => void }) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await getReports(1, 50); // Traemos los últimos 50
            setReports(data.reports);
        } catch (err) {
            console.error("Error cargando reportes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Evitar que se expanda el acordeón
        const confirmDelete = window.confirm("¿Seguro que deseas eliminar este reporte del historial?");
        if (!confirmDelete) return;

        try {
            await deleteReport(id);
            // Actualizamos la UI inmediatamente sin hacer otra petición
            setReports((prev) => prev.filter(r => r._id !== id));
            if (expandedId === id) setExpandedId(null);
        } catch (error) {
            console.error("Error al eliminar el reporte", error);
            alert("No se pudo eliminar el reporte.");
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="glass p-6 rounded-3xl mt-8">
            <div className="flex items-center gap-3 mb-8">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Historial de Análisis</h2>
            </div>

            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-500 w-10 h-10" /></div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20">
                    <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 italic">No hay registros de análisis aún.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden transition-all hover:bg-slate-800/60">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpand(report._id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                                        <FileText className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{report.fileName}</h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(report.date).toLocaleString()}</span>
                                            <span className="text-slate-600">|</span>
                                            <span>{report.totalItems} materiales encontrados</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-emerald-500/20 mr-2 md:mr-0">
                                        Procesado
                                    </span>

                                    {/* BOTÓN ELIMINAR */}
                                    <button
                                        onClick={(e) => handleDelete(report._id, e)}
                                        className="p-1.5 md:p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent mr-2 md:mr-0 z-10"
                                        title="Eliminar Reporte"
                                    >
                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>

                                    {/* BOTÓN MOVER ITEM */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onMove(report); }}
                                        className="p-1.5 md:p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-colors border border-transparent mr-2 z-10"
                                        title="Mover Items"
                                    >
                                        <Truck className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>

                                    {expandedId === report._id ? <ChevronUp className="w-5 h-5 text-slate-500 hidden md:block" /> : <ChevronDown className="w-5 h-5 text-slate-500 hidden md:block" />}
                                </div>
                            </div>

                            {expandedId === report._id && (
                                <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-300">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left min-w-[500px]">
                                            <thead>
                                                <tr className="text-slate-500 font-bold uppercase tracking-widest border-b border-slate-700/50">
                                                    <th className="pb-2 min-w-[120px]">Part Number</th>
                                                    <th className="pb-2 min-w-[200px]">Descripción</th>
                                                    <th className="pb-2 text-center w-20">Qty</th>
                                                    <th className="pb-2 text-center w-20" translate="no">UOM</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-300">
                                                {report.itemsFound.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-slate-700/20 last:border-0 hover:bg-white/5">
                                                        <td className="py-2 font-mono text-indigo-300 whitespace-nowrap">{item.partNumber}</td>
                                                        <td className="py-2 pr-4 text-[10px] leading-tight text-slate-400">{item.description}</td>
                                                        <td className="py-2 text-center font-bold text-white whitespace-nowrap">{item.qty.toFixed(2)}</td>
                                                        <td className="py-2 text-center text-slate-500 font-medium whitespace-nowrap" translate="no">{item.uom}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
