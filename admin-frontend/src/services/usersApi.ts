import { apiFetch } from "./apiFetch";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "OPERATOR";
    createdAt?: string;
}

export async function getUsers(): Promise<User[]> {
    const res = await apiFetch("/users");
    if (!res.ok) throw new Error("Error obteniendo usuarios");
    return res.json();
}

export async function createUser(userData: any): Promise<void> {
    const res = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(userData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear usuario");
    }
}

export async function deleteUser(id: string): Promise<void> {
    const res = await apiFetch(`/users/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar");
    }
}
