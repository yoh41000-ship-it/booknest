
// Единственное место, где вызывается fetch

const BASE_URL = 'https://openlibrary.org';

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * Базовый GET-запрос к API.
 * @param {string} path - например '/search.json'
 * @param {Object} params - объект параметров
 * @param {AbortSignal} signal
 * @returns {Promise<Object>}
 */
export async function apiGet(path, params = {}, signal) {
    const url = new URL(path, BASE_URL);
    url.search = new URLSearchParams(params).toString();

    let response;
    try {
        response = await fetch(url.toString(), { signal });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new ApiError('Нет подключения к сети', 0);
    }

    if (!response.ok) {
        const message = response.status >= 500
            ? 'Сервер временно недоступен'
            : 'Запрос отклонён';
        throw new ApiError(message, response.status);
    }

    return response.json();
}