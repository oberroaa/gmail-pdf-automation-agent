import { apiFetch } from "./apiFetch";

export interface Rule {
    file: string;
    name: string;
    description: string;
    ruleset: any;
    isDefault: boolean;
}

export async function getRules(): Promise<Rule[]> {
    const res = await apiFetch("/rules");
    if (!res.ok) throw new Error("Error cargando reglas");
    return res.json();
}

export async function deleteRule(file: string) {
    const res = await apiFetch(
        `/rules/${encodeURIComponent(file)}`,
        { method: "DELETE" }
    );
    if (!res.ok) throw new Error("Error eliminando regla");
}

export async function setDefaultRule(name: string) {
    const res = await apiFetch(`/rules/${name}/default`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Error estableciendo regla por defecto");
    return res.json();
}

export async function updateRule(name: string, data: any) {
    const res = await apiFetch(`/rules/${name}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error actualizando regla");
    return res.json();
}

export async function createRule(ruleData: any) {
    const res = await apiFetch(`/rules/save`, {
        method: "POST",
        body: JSON.stringify(ruleData),
    });
    if (!res.ok) throw new Error("Error creando regla");
    return res.json();
}
