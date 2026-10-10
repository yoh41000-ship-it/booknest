
// Запросы к Open Library

import { apiGet } from './client.js';

const PAGE_SIZE = 20;

/**
 * Поиск книг.
 * @param {string} query
 * @param {number} page - начиная с 1
 * @param {AbortSignal} signal
 */
export async function searchBooks(query, page = 1, signal) {
    const data = await apiGet('/search.json', {
        q: query,
        page,
        limit: PAGE_SIZE,
    }, signal);

    return {
        items: data.docs || [],
        total: data.numFound || 0,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil((data.numFound || 0) / PAGE_SIZE),
    };
}

/**
 * Получить книгу по ID (ключ /works/OLxxxW).
 * @param {string} id
 * @param {AbortSignal} signal
 */
export async function getBookById(id, signal) {
    const cleanId = id.startsWith('/') ? id : `/works/${id}`;
    return apiGet(`${cleanId}.json`, {}, signal);
}

/**
 * Обложка книги по cover_i.
 */
export function getCoverUrl(coverId, size = 'M') {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}