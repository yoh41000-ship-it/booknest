
// Точка входа
import { searchBooks } from './api/books.js';
import { ApiError } from './api/client.js';
import { debounce } from './lib/debounce.js';
import {
    renderBooks,
    renderCount,
    renderPagination,
    renderWishlist,
    renderWishlistCount,
    renderState,
} from './ui/render.js';

// --- ЕДИНСТВЕННЫЙ state ---
const state = {
    query: '',
    page: 1,
    currentRequest: null, 
    data: null,           
    uiState: { name: 'empty', message: '' },
    wishlist: new Set(),        
    wishlistDetails: new Map(), 
};

const STORAGE_WISHLIST = 'booknest.wishlist.v2';

// --- localStorage ---
function loadWishlist() {
    try {
        const raw = localStorage.getItem(STORAGE_WISHLIST);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                parsed.forEach((book) => {
                    if (book && book.key) {
                        state.wishlist.add(book.key);
                        state.wishlistDetails.set(book.key, book);
                    }
                });
            }
        }
    } catch (e) {
        console.warn('wishlist: некорректные данные', e);
    }
}

function saveWishlist() {
    try {
        const list = [...state.wishlistDetails.values()];
        localStorage.setItem(STORAGE_WISHLIST, JSON.stringify(list));
    } catch (e) {
        console.warn('Не удалось сохранить wishlist', e);
    }
}


const elements = {
    catalog: document.querySelector('[data-role="catalog"]'),
    loading: document.querySelector('[data-role="loading"]'),
    empty: document.querySelector('[data-role="empty"]'),
    error: document.querySelector('[data-role="error"]'),
    count: document.querySelector('[data-role="count"]'),
    prevBtn: document.querySelector('[data-role="prev"]'),
    nextBtn: document.querySelector('[data-role="next"]'),
    retryBtn: document.querySelector('[data-role="retry"]'),
    wishlistList: document.querySelector('[data-role="wishlist-list"]'),
    wishlistCount: document.querySelector('[data-role="wishlist-count"]'),
    searchInput: document.querySelector('#search'),
};

function render() {
    renderState(state.uiState, elements);

    if (state.uiState.name === 'success' && state.data) {
        renderBooks(elements.catalog, state.data.items, state.wishlist);
        renderCount(elements.count, state.data);
        renderPagination(elements.prevBtn, elements.nextBtn, state.data);
    } else {
        renderPagination(elements.prevBtn, elements.nextBtn, null);
    }

    renderWishlistCount(elements.wishlistCount, state.wishlist.size);
    renderWishlist(
        elements.wishlistList,
        [...state.wishlistDetails.values()],
    );
}

// --- Загрузка с API ---
async function loadBooks() {
    if (state.currentRequest) state.currentRequest.abort();
    const controller = new AbortController();
    state.currentRequest = controller;


    state.uiState = { name: 'loading', message: '' };
    render();

    try {
        const data = await searchBooks(state.query, state.page, controller.signal);
        if (controller.signal.aborted) return;

        state.data = data;
        if (data.items.length === 0) {
            state.uiState = { name: 'empty', message: '' };
        } else {
            state.uiState = { name: 'success', message: '' };
        }
    } catch (error) {
        if (error.name === 'AbortError') return; 

        let message = 'Не удалось загрузить данные';
        if (error instanceof ApiError) {
            if (error.status === 0) message = 'Нет подключения к сети. Проверьте интернет.';
            else if (error.status >= 500) message = `Сервер недоступен (${error.status}). Попробуйте позже.`;
            else if (error.status >= 400) message = `Ошибка запроса (${error.status}). Проверьте параметры.`;
        }
        state.uiState = { name: 'error', message };
    } finally {
        if (state.currentRequest === controller) {
            state.currentRequest = null;
            render();
        }
    }
}

// --- Debounced поиск ---
const debouncedSearch = debounce(() => {
    state.page = 1;
    loadBooks();
}, 350);

// --- События ---
function setupEventListeners() {
    elements.searchInput.addEventListener('input', (e) => {
        state.query = e.target.value.trim();
        if (state.query.length < 2) {
            state.uiState = { name: 'empty', message: '' };
            render();
            return;
        }
        debouncedSearch();
    });

    elements.prevBtn.addEventListener('click', () => {
        if (state.page > 1) {
            state.page -= 1;
            loadBooks();
        }
    });

    elements.nextBtn.addEventListener('click', () => {
        if (state.data && state.page < state.data.totalPages) {
            state.page += 1;
            loadBooks();
        }
    });

    elements.retryBtn.addEventListener('click', () => {
        loadBooks();
    });

    elements.catalog.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-action="wishlist"]');
        if (!btn) return;
        const { id } = btn.dataset;
        const book = state.data?.items.find((b) => b.key === id);
        if (!book) return;

        if (state.wishlist.has(id)) {
            state.wishlist.delete(id);
            state.wishlistDetails.delete(id);
        } else {
            state.wishlist.add(id);
            state.wishlistDetails.set(id, book);
        }
        saveWishlist();
        render();
    });

    elements.wishlistList.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-action="remove-wishlist"]');
        if (!btn) return;
        const { id } = btn.dataset;
        state.wishlist.delete(id);
        state.wishlistDetails.delete(id);
        saveWishlist();
        render();
    });
}

// --- Старт ---
function init() {
    loadWishlist();
    setupEventListeners();
    state.uiState = { name: 'empty', message: '' };
    render();
}

init();