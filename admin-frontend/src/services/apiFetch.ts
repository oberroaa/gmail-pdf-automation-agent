const API_URL = "/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const savedUser = localStorage.getItem('tuuci_user');
    
    // Si el body es FormData, el navegador debe poner el Content-Type con el boundary correcto
    const isFormData = options.body instanceof FormData;

    let headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (savedUser) {
        const { token } = JSON.parse(savedUser);
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        localStorage.removeItem('tuuci_user');
        window.location.href = '/';
        throw new Error("Sesión expirada");
    }

    return res;
}
