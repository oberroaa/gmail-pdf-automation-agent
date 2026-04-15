import React, { useState } from "react";
import { 
    UploadCloud, FileText, CheckCircle2, AlertTriangle, 
    Loader2, X, Wind, Layers, ArrowRight, Languages 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../services/apiFetch";

const translations = {
    es: {
        title: "Analizador de Canopy",
        subtitle: "Procesa PDFs de producción para verificar stock y registrar modelos.",
        uploadTitle: "Subir Documento",
        uploadDesc: "Sube el PDF de producción para analizar los Jobs y verificar stock.",
        selectPDF: "Seleccionar PDF",
        changeFile: "Cambiar Archivo",
        startAnalysis: "Comenzar Análisis",
        processing: "Procesando...",
        waiting: "Esperando análisis...",
        results: "Resultados",
        jobsDetected: "Jobs detectados",
        clearResults: "Limpiar resultados",
        item: "Item",
        notInventoried: "No Inventariado",
        profile: "Perfil",
        assignedJobs: "Job(s) Asignado(s)",
        fabrics: "Telas (Yardas)",
        availableStock: "Stock Disponible",
        units: "unidades",
        requiredInPdf: "Requerido en PDF",
        status: {
            "DISPONIBLE": "DISPONIBLE",
            "PARCIAL": "PARCIAL",
            "AGOTADO": "AGOTADO"
        }
    },
    en: {
        title: "Canopy Analyzer",
        subtitle: "Process production PDFs to verify stock and register models.",
        uploadTitle: "Upload Document",
        uploadDesc: "Upload the production PDF to analyze Jobs and verify stock.",
        selectPDF: "Select PDF",
        changeFile: "Change File",
        startAnalysis: "Start Analysis",
        processing: "Processing...",
        waiting: "Waiting for analysis...",
        results: "Results",
        jobsDetected: "Jobs detected",
        clearResults: "Clear results",
        item: "Item",
        notInventoried: "Not Inventoried",
        profile: "Profile",
        assignedJobs: "Assigned Job(s)",
        fabrics: "Fabrics (Yards)",
        availableStock: "Available Stock",
        units: "units",
        requiredInPdf: "Required in PDF",
        status: {
            "DISPONIBLE": "AVAILABLE",
            "PARCIAL": "PARTIAL",
            "AGOTADO": "OUT OF STOCK"
        }
    }
};

export default function CanopyAnalyzer() {
    const [lang, setLang] = useState<"es" | "en">("es");
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const t = translations[lang];

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
            if (!res.ok) throw new Error(data.error || (lang === 'es' ? "Error analizando el PDF" : "Error analyzing PDF"));
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
                        {t.title}
                    </h2>
                    <p className="text-slate-400 mt-1">{t.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button 
                        onClick={() => setLang("es")}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${lang === 'es' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        ES
                    </button>
                    <button 
                        onClick={() => setLang("en")}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        EN
                    </button>
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
                            
                            <h3 className="text-xl font-bold text-white mb-2">{t.uploadTitle}</h3>
                            <p className="text-slate-400 text-sm mb-8">{t.uploadDesc}</p>

                            <label className="w-full">
                                <div className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl cursor-pointer transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                                    <UploadCloud className="w-6 h-6" />
                                    <span className="font-bold">{pdfFile ? t.changeFile : t.selectPDF}</span>
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
                                                {t.processing}
                                            </>
                                        ) : (
                                            <>
                                                {t.startAnalysis}
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
                                <p className="text-lg font-medium opacity-20">{t.waiting}</p>
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
                                        {t.results}: {result.totalJobs} {t.jobsDetected}
                                    </h4>
                                    <button onClick={() => setResult(null)} className="text-xs text-sky-400 hover:underline">{t.clearResults}</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.summary.map((res: any, idx: number) => (
                                        <div key={idx} className={`glass p-6 rounded-3xl border transition-all hover:scale-[1.02] ${res.isNew ? 'border-amber-500/30' : 'border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">{t.item}</span>
                                                    <span className="text-lg font-black text-white">{res.item}</span>
                                                </div>
                                                {res.isNew ? (
                                                    <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">{t.notInventoried}</span>
                                                ) : (
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 ${
                                                        res.status === "DISPONIBLE" ? 'bg-emerald-500 text-black' : 
                                                        res.status === "PARCIAL" ? 'bg-orange-500 text-white' : 
                                                        'bg-red-500 text-white'
                                                    }`}>
                                                        {res.status !== "DISPONIBLE" && <AlertTriangle className="w-3 h-3" />}
                                                        {(t.status as any)[res.status] || res.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">{t.profile}</span>
                                                <span className="text-sm text-slate-300 font-medium">{res.profile}</span>
                                            </div>

                                            {res.jobs && res.jobs.length > 0 && (
                                                <div className="mb-4">
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">{t.assignedJobs}</span>
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
                                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-2">{t.fabrics}</span>
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
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">{t.availableStock}</span>
                                                    <span className="text-xl font-black text-white">{res.available} <span className="text-xs text-slate-500 font-normal">{t.units}</span></span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter block mb-1">{t.requiredInPdf}</span>
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
