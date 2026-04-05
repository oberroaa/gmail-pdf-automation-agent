import { apiFetch } from "./apiFetch";

export interface Item {
    _id?: string;
    partNumber: string;
    description: string;
    qtyReq: number;
    uom: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedResponse {
    items: Item[];
    total: number;
    page: number;
    totalPages: number;
}

// 1. Obtener todos los items (con paginación y búsqueda)
export async function getItems(page: number = 1, limit: number = 10, search: string = ""): Promise<PaginatedResponse> {
    const res = await apiFetch(`/items?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error("Error obteniendo items");
    return res.json();
}

// 2. Guardar un nuevo item
export async function saveItem(item: Omit<Item, "_id" | "active" | "createdAt">): Promise<void> {
    const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify(item),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar el item");
    }
}

// 3. Actualizar un item
export async function updateItem(id: string, item: Partial<Item>): Promise<void> {
    const res = await apiFetch(`/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Error al actualizar");
}

// 4. Eliminar un item
export async function deleteItem(id: string): Promise<void> {
    const res = await apiFetch(`/items/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar");
}

// 5. Eliminar múltiples items
export async function bulkDeleteItems(ids: string[]): Promise<void> {
    const res = await apiFetch(`/items/bulk-delete`, {
        method: "POST",
        body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error("Error en el borrado masivo");
}

