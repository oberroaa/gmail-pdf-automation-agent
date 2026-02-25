export interface Rule {
    file: string;
    name: string;
    description: string;
    ruleset: any;
    isDefault: boolean;
}

// En Vercel usamos '/api', en local con Vite proxy también usaremos '/api'
const API_URL = "/api";

export async function getRules(): Promise<Rule[]> {
    const res = await fetch(`${API_URL}/rules`);

    if (!res.ok) {
        throw new Error("Error cargando reglas");
    }

    const data = await res.json();
    console.log("🎯 Datos de reglas desde backend:", data);
    return data;
}

export async function deleteRule(file: string) {
    const res = await fetch(
        `${API_URL}/rules/${encodeURIComponent(file)}`,
        { method: "DELETE" }
    );

    if (!res.ok) {
        throw new Error("Error eliminando regla");
    }
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

export async function createRule(ruleData: any) {
    const res = await fetch(`${API_URL}/rules/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
    });

    if (!res.ok) {
        throw new Error("Error creando regla");
    }

    return res.json();
}
