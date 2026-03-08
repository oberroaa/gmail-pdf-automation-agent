const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface ReportItem {
    partNumber: string;
    description: string;
    qty: number;
    uom: string;
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
    const res = await fetch(`${API_URL}/reports?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Error obteniendo reportes");
    return res.json();
}
