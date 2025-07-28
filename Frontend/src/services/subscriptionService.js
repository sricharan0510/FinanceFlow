import { fetchWithAuth, handleResponse, getAuthHeaders } from './apiService';

export const subscriptionService = {
    getSubscriptions: async () => {
        const response = await fetchWithAuth('http://localhost:8000/api/subscriptions', { headers: getAuthHeaders() });
        return handleResponse(response);
    },
    getSubscription: async (id) => {
        const response = await fetchWithAuth(`http://localhost:8000/api/subscriptions/${id}`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },
    createSubscription: async (data) => {
        const response = await fetchWithAuth('http://localhost:8000/api/subscriptions', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    updateSubscription: async (id, data) => {
        const response = await fetchWithAuth(`http://localhost:8000/api/subscriptions/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    deleteSubscription: async (id) => {
        const response = await fetchWithAuth(`http://localhost:8000/api/subscriptions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
};
