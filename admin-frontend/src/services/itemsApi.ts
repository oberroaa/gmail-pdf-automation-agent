const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

// 1. Obtener todos los items
export async function getItems(): Promise<Item[]> {
    const res = await fetch(`${API_URL}/items`);
    if (!res.ok) throw new Error("Error obteniendo items");
    return res.json();
}

// 2. Guardar un nuevo item
export async function saveItem(item: Omit<Item, "_id" | "active" | "createdAt">): Promise<void> {
    const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar el item");
    }
}

// 3. Actualizar un item
export async function updateItem(id: string, item: Partial<Item>): Promise<void> {
    const res = await fetch(`${API_URL}/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Error al actualizar");
}

// 4. Eliminar un item
export async function deleteItem(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/items/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar");
}
