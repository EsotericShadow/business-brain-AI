
// A simple fetch-based API client that communicates with your backend

const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('authToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response: Response) => {
    if (response.status === 204) { // No Content
        return { ok: response.ok, status: response.status, data: null };
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error("API response was not JSON:", responseText);
        // Create an error with the non-JSON response body
        const error = new Error(`Expected JSON but received a different format. Status: ${response.status}.`);
        return Promise.reject(error);
    }

    const data = await response.json();

    if (!response.ok) {
        console.error("API Error:", data);
        // Use the error message from the body, or fall back to status text
        const error = new Error(data.message || response.statusText);
        return Promise.reject(error);
    }
    return { ok: response.ok, status: response.status, data };
};

const post = async (endpoint: string, body: unknown) => {
    // The Vite proxy (or similar) will forward this request to the backend
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
    });
    return handleResponse(response);
};

const get = async (endpoint: string) => {
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(),
    });
    const handled = await handleResponse(response);
    return handled.data; // Extract data before returning
};

export const api = {
    post,
    get,
};
