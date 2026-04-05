import { apiFetch } from "./apiFetch";

export interface Canopy {
    _id?: string;
    item: string;
    alias: string;
    profile: string;
    telas: string[]; // Arreglo de strings
    telas2: string[]; // Arreglo secundario de telas
    total: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedCanopyResponse {
    canopies: Canopy[];
    total: number;
    page: number;
    totalPages: number;
}

// 1. Obtener todos los canopies (con paginación y búsqueda)
export async function getCanopies(page: number = 1, limit: number = 10, search: string = ""): Promise<PaginatedCanopyResponse> {
    const res = await apiFetch(`/canopy?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error("Error obteniendo canopies");
    return res.json();
}

// 2. Guardar un nuevo canopy
export async function saveCanopy(canopy: Omit<Canopy, "_id" | "createdAt">): Promise<void> {
    const res = await apiFetch("/canopy", {
        method: "POST",
        body: JSON.stringify(canopy),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar el canopy");
    }
}

// 3. Actualizar un canopy
export async function updateCanopy(id: string, canopy: Partial<Canopy>): Promise<void> {
    const res = await apiFetch(`/canopy/${id}`, {
        method: "PUT",
        body: JSON.stringify(canopy),
    });
    if (!res.ok) throw new Error("Error al actualizar");
}

// 4. Eliminar un canopy
export async function deleteCanopy(id: string): Promise<void> {
    const res = await apiFetch(`/canopy/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar");
}

// 5. Eliminar múltiples canopies
export async function deleteCanopies(ids: string[]): Promise<void> {
    const res = await apiFetch("/canopy/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error("Error al eliminar múltiples canopies");
}
