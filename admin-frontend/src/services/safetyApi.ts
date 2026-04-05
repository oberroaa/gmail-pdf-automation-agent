import { apiFetch } from "./apiFetch";

/**
 * Obtiene el protocolo de seguridad desde la DB
 */
export async function getSafetyProtocol() {
    const res = await apiFetch("/safety-protocol");

    if (!res.ok) {
        throw new Error("Error al obtener el protocolo de seguridad");
    }

    return res.json();
}

/**
 * Actualiza el protocolo de seguridad en la DB
 */
export async function updateSafetyProtocol(protocolData: any) {
    const res = await apiFetch("/safety-protocol", {
        method: "PUT",
        body: JSON.stringify(protocolData)
    });

    if (!res.ok) {
        throw new Error("Error al actualizar el protocolo de seguridad");
    }

    return res.json();
}
