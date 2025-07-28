const API_BASE_URL = 'http://localhost:8000/api';

const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) {
        throw new Error('Unable to refresh token');
    }
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
};


const fetchWithAuth = async (url, options = {}, retry = true) => {
    let response = await fetch(url, options);
    if (response.status === 401) {
        // Try to refresh token if expired
        try {
            await refreshToken();
            const newOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            };
            if (retry) {
                response = await fetch(url, newOptions);
            }
        } catch (e) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw new Error('Session expired. Please log in again.');
        }
    }
    return response;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message);
    }
    if (response.status === 204 || (response.headers.get('content-length') === '0')) {
        return null;
    }
    return response.json();
};

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
});

export const apiService = {
    // --- Auth ---
    login: (email, password) => fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(handleResponse),
    register: (name, email, password) => fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, savingTarget: 0 }) }).then(handleResponse),
    googleLogin: (credential) => fetch(`${API_BASE_URL}/auth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential }) }).then(handleResponse),

    // --- Transactions ---
    getTransactions: async (filters) => {
        const params = new URLSearchParams(filters);
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions?${params.toString()}`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },
    addTransaction: async (data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
        return handleResponse(response);
    },
    updateTransaction: async (id, data) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
        return handleResponse(response);
    },
    deleteTransaction: async (id) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        return handleResponse(response);
    },
    getDashboardSummary: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await fetchWithAuth(`${API_BASE_URL}/transactions/dashboard/summary?${params.toString()}`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    // --- Reports ---
    generateMonthlyReport: async ({ month, year }) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/reports/monthly`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ month, year }),
        });
        return handleResponse(response);
    },
};
