import { useEffect, useState } from "react";
import { getSettings, saveEmail, deleteEmail, type EmailSetting } from "../services/settingsApi";
import { Mail, Plus, Trash2, Loader2 } from "lucide-react";

export default function EmailSettings() {
    const [emails, setEmails] = useState<EmailSetting[]>([]);
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(true);

    // 1. Cargar emails al abrir la pantalla
    const loadEmails = async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            setEmails(data);
        } catch (err) {
            console.error("Error cargando emails", err);
        } finally {
            setLoading(false);
        }
    };



    //Eliminar email
    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar este email?")) return;
        try {
            await deleteEmail(id);
            await loadEmails(); // Recargar la lista después de borrar
        } catch (err) {
            alert("Error al eliminar");
        }
    };


    useEffect(() => {
        loadEmails();
    }, []);

    // 2. Guardar un nuevo email
    const handleAddEmail = async () => {
        if (!newEmail) return;
        try {
            await saveEmail(newEmail);
            setNewEmail(""); // Limpiar el cuadro de texto
            await loadEmails(); // Recargar la lista
        } catch (err) {
            alert("Error al guardar el email");
        }
    };

    return (
        <div className="glass p-6 rounded-3xl mt-8">
            <div className="flex items-center gap-3 mb-6">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Correos Destinatarios</h2>
            </div>

            {/* Formulario para añadir */}
            <div className="flex gap-2 mb-6">
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ejemplo@tuuci.com"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={handleAddEmail}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all"
                >
                    <Plus className="w-4 h-4" /> Añadir
                </button>
            </div>

            {/* Lista de emails */}
            {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-500" /></div>
            ) : (
                <div className="space-y-2">
                    {emails.map((item) => (
                        <div key={item._id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                            <span className="text-slate-200 text-sm font-medium">{item.email}</span>
                            <button
                                onClick={() => handleDelete(item._id!)} // Llamar a la función de borrar
                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {emails.length === 0 && <p className="text-slate-500 text-sm text-center">No hay correos configurados.</p>}
                </div>
            )}
        </div>
    );
}
