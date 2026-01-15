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


export async function deleteRule(name: string) {
    const res = await fetch(`${API_URL}/rules/${name}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Error eliminando regla");
    }

    return res.json();
}

export async function setDefaultRule(name: string) {
    const res = await fetch(`${API_URL}/rules/${name}/default`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("Error estableciendo regla por defecto");
    }

    return res.json();
}

export async function updateRule(name: string, data: any) {
    const res = await fetch(`${API_URL}/rules/${name}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Error actualizando regla");
    }

    return res.json();
}


export async function createRule(name: string, prompt: string) {
    const res = await fetch("http://localhost:3001/rules/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, prompt }),
    });

    if (!res.ok) {
        throw new Error("Error creando regla");
    }

    return res.json();
}
