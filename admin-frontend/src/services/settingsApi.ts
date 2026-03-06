const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface EmailSetting {
    _id?: string;
    email: string;
    active: boolean;
    createdAt?: string;
}

// Obtener todos los emails
export async function getSettings(): Promise<EmailSetting[]> {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) throw new Error("Error obteniendo configuración");
    return res.json();
}

// Guardar un nuevo email
export async function saveEmail(email: string): Promise<void> {
    const res = await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar");
    }
}

//Eliminar email
export async function deleteEmail(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/settings/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar");
}

