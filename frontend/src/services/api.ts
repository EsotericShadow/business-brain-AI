
// A simple fetch-based API client that communicates with your backend

const getHeaders = (accept = 'application/json'): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': accept,
    };
    const token = localStorage.getItem('authToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response: Response, responseType: 'json' | 'text') => {
    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error("API Error:", errorData);
        throw new Error(errorData.details || errorData.message || 'An unexpected error occurred.');
    }

    if (responseType === 'text') {
        return response.text();
    }
    return response.json();
};

const post = async (endpoint: string, body: unknown) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
        credentials: 'include',
    });
    return handleResponse(response, 'json');
};

const get = async (endpoint: string, responseType: 'json' | 'text' = 'json') => {
    const acceptHeader = responseType === 'text' ? 'text/html' : 'application/json';
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(acceptHeader),
        credentials: 'include',
    });
    return handleResponse(response, responseType);
};

export const api = {
    post,
    get,
};
