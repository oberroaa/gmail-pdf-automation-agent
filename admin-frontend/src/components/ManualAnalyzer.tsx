import { useState, useRef, useEffect } from 'react';
import { getRules, type Rule } from '../services/rulesApi';
import { apiFetch } from '../services/apiFetch';

export default function ManualAnalyzer() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- NUEVOS ESTADOS ---
    const [rules, setRules] = useState<Rule[]>([]);
    const [selectedRule, setSelectedRule] = useState<string>("");

    // Referencia oculta para abrir el selector de archivos
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- CARGAR REGLAS AL INICIAR ---
    useEffect(() => {
        const fetchRules = async () => {
            try {
                const data = await getRules();
                setRules(data);

                // Buscar la regla por defecto y seleccionarla
                const defaultRule = data.find(r => r.isDefault);
                if (defaultRule) {
                    setSelectedRule(defaultRule.name);
                } else if (data.length > 0) {
                    setSelectedRule(data[0].name);
                }
            } catch (err) {
                console.error("Error cargando reglas:", err);
            }
        };
        fetchRules();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null);
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
        // Enviamos el nombre de la regla seleccionada
        formData.append("ruleName", selectedRule);

        try {
            const res = await apiFetch(`/upload-pdf`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.details 
                    ? `${data.error}: ${data.details}` 
                    : (data.error || "Error al procesar el archivo");
                throw new Error(errorMessage);
            }

            setResult(data.result);
        } catch (err: any) {
            setError(err.message || "Error al analizar");
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Cargar PDF Manual</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Sube un PDF y selecciona la regla de análisis que deseas aplicar.
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* --- SELECTOR DE REGLA --- */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Seleccionar Regla de Análisis:
                    </label>
                    <select
                        value={selectedRule}
                        onChange={(e) => setSelectedRule(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        {rules.map(rule => (
                            <option key={rule.name} value={rule.name} className="text-gray-900">
                                {rule.name} {rule.isDefault ? "(Predeterminada)" : ""}
                            </option>
                        ))}
                    </select>

                </div>

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

                {/* Mensajes de Error y Resultado (Igual que antes) */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}
                {result && (
                    <div className="mt-6 border border-green-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-white">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {result}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
