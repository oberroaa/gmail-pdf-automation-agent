export interface Rule {
    file: string;
    name: string;
    description: string;
    ruleset: any;
    isDefault: boolean;
}

const API_URL = "http://localhost:3001";

export async function getRules(): Promise<Rule[]> {
    const res = await fetch(`${API_URL}/rules`);

    if (!res.ok) {
        throw new Error("Error cargando reglas");
    }

    const data = await res.json();

    // 🔍 DEBUG CLARO
    console.log("🎯 Datos de reglas desde backend:", data);

    // 👇 EL BACKEND YA DEVUELVE UN ARRAY
    return data;
}
