// admin-frontend/src/components/ManualAnalyzer.tsx
import { useState, useRef } from 'react';

const API_DOCS_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default function ManualAnalyzer() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Referencia oculta para abrir el selector de archivos
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null); // Limpiar resultado anterior si lo hay
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("pdfFile", file);

        try {
            const res = await fetch(`${API_DOCS_URL}/upload-pdf`, {
                method: "POST",
                body: formData, // No enviamos 'Content-Type', el navegador lo pone automático con el boundary para archivos
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al procesar el archivo");
            }

            setResult(data.result);
            // El backend ya guardó el reporte y actualizó el inventario =D
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Limpiar input
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Cargar PDF Manual</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Sube un PDF. Será analizado con la regla "Predeterminada" y actualizará el inventario e historial inmediatamente.
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* Caja de subida */}
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                    />

                    <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer flex flex-col items-center"
                    >
                        <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-lg font-medium text-gray-700">
                            {file ? file.name : "Seleccionar archivo PDF"}
                        </span>
                        {!file && (
                            <span className="text-sm text-gray-500 mt-1">
                                Haz clic aquí para buscar el archivo en tu equipo
                            </span>
                        )}
                    </label>
                </div>

                {/* Botón de Analizar */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                            ${!file || loading
                                ? "bg-gray-400 cursor-not-allowed shadow-none"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5"
                            }`}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {loading ? "Analizando IA..." : "Analizar Documento"}
                    </button>
                </div>

                {/* Mensajes de Error */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resultado del Análisis */}
                {result && (
                    <div className="mt-6 border border-green-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-green-50 px-4 py-3 border-b border-green-200 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-semibold text-green-800">Resultado de Extracción</h3>
                        </div>
                        <div className="p-4 bg-white">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {result}
                            </pre>
                            <p className="text-xs text-center text-gray-500 mt-4">
                                * Los resultados ya han sido guardados en el historial y el inventario fue actualizado.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
