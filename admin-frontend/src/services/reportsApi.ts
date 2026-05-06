import { apiFetch } from "./apiFetch";

export interface ReportItem {
    partNumber: string;
    description: string;
    qty: number;
    uom: string;
    job_ref?: string;
}

export interface Report {
    _id: string;
    fileName: string;
    date: string;
    itemsFound: ReportItem[];
    totalItems: number;
    status: string;
}

export interface ReportsResponse {
    reports: Report[];
    total: number;
    page: number;
    totalPages: number;
}

// Obtener el historial de reportes
export async function getReports(page: number = 1, limit: number = 10): Promise<ReportsResponse> {
    const res = await apiFetch(`/reports?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Error obteniendo reportes");
    return res.json();
}

// Eliminar un reporte
export async function deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch(`/reports/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando el reporte");
    return res.json();
}
