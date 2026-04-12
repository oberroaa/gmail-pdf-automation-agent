import React, { useState } from "react";
import { 
    UploadCloud, FileText, CheckCircle2, AlertTriangle, 
    Loader2, X, Wind, Layers, ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../services/apiFetch";

export default function CanopyAnalyzer() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
            setResult(null);
        }
    };

    const runAnalysis = async () => {
        if (!pdfFile) return;
        setAnalyzing(true);
        setResult(null);

        const formData = new FormData();
        formData.append("pdf", pdfFile);

        try {
            const res = await apiFetch(`/upload-canopy`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error analizando el PDF");
            setResult(data);
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3" translate="no">
                        <Wind className="w-8 h-8 text-sky-400" />
                        Analizador de Canopy
                    </h2>
                    <p className="text-slate-400 mt-1">Procesa PDFs de producción para verificar stock y registrar modelos.</p>
                </div>
            </div>

            {/* Zona de Carga */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <FileText className="w-10 h-10 text-indigo-400" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">Subir Documento</h3>
                            <p className="text-slate-400 text-sm mb-8">Sube el PDF de producción para analizar los Jobs y verificar stock.</p>

                            <label className="w-full">
                                <div className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl cursor-pointer transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                                    <UploadCloud className="w-6 h-6" />
                                    <span className="font-bold">{pdfFile ? "Cambiar Archivo" : "Seleccionar PDF"}</span>
                                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                                </div>
                            </label>

                            {pdfFile && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mb-6">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                                            <FileText className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <span className="text-xs text-slate-300 truncate flex-1 text-left">{pdfFile.name}</span>
                                        <button onClick={() => setPdfFile(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                                    </div>

                                    <button
                                        onClick={runAnalysis}
                                        disabled={analyzing}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/20"
                                    >
                                        {analyzing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                Comenzar Análisis
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Área de Resultados */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 p-12 text-center"
                            >
                                <Wind className="w-16 h-16 mb-4 opacity-10" />
                                <p className="text-lg font-medium opacity-20">Esperando análisis...</p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                                        Resultados: {result.totalJobs} Jobs detectados
                                    </h4>
                                    <button onClick={() => setResult(null)} className="text-xs text-sky-400 hover:underline">Limpiar resultados</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.summary.map((res: any, idx: number) => (
                                        <div key={idx} className={`glass p-6 rounded-3xl border transition-all hover:scale-[1.02] ${res.isNew ? 'border-amber-500/30' : 'border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">Item</span>
                                                    <span className="text-lg font-black text-white">{res.item}</span>
                                                </div>
                                                {res.isNew ? (
                                                    <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">No Inventariado</span>
                                                ) : (
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 ${
                                                        res.status === "DISPONIBLE" ? 'bg-emerald-500 text-black' : 
                                                        res.status === "PARCIAL" ? 'bg-orange-500 text-white' : 
                                                        'bg-red-500 text-white'
                                                    }`}>
                                                        {res.status !== "DISPONIBLE" && <AlertTriangle className="w-3 h-3" />}
                                                        {res.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">Perfil</span>
                                                <span className="text-sm text-slate-300 font-medium">{res.profile}</span>
                                            </div>

                                            {res.jobs && res.jobs.length > 0 && (
                                                <div className="mb-4">
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">Job(s) Asignado(s)</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {res.jobs.map((job: string, i: number) => (
                                                            <span key={i} className="bg-indigo-500/10 text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-lg border border-indigo-500/20">
                                                                {job}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-6">
                                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-2">Telas (Yardas)</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {res.telas.map((t: string, i: number) => (
                                                        <span key={i} className="bg-white/5 text-sky-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                                                            <Layers className="w-3 h-3 opacity-50" /> {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                                <div>
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">Stock Disponible</span>
                                                    <span className="text-xl font-black text-white">{res.available} <span className="text-xs text-slate-500 font-normal">unidades</span></span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">Requerido en PDF</span>
                                                    <span className="text-xl font-black text-indigo-400">{res.required}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
