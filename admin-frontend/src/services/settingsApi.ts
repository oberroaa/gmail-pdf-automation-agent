import { apiFetch } from "./apiFetch";

export interface EmailSetting {
    _id?: string;
    email: string;
    active: boolean;
    createdAt?: string;
}

// Obtener todos los emails
export async function getSettings(): Promise<EmailSetting[]> {
    const res = await apiFetch("/settings");
    if (!res.ok) throw new Error("Error obteniendo configuración");
    return res.json();
}

// Guardar un nuevo email
export async function saveEmail(email: string): Promise<void> {
    const res = await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar");
    }
}

//Eliminar email
export async function deleteEmail(id: string): Promise<void> {
    const res = await apiFetch(`/settings/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar");
}

