// js/main.js
// Точка входа. Состояние + логика + делегирование.

import books from './data/books.js';
import { applyFilters, getUniqueGenres } from './lib/books.js';
import {
    renderBooks,
    renderCount,
    renderEmptyState,
    renderWishlist,
    renderWishlistCount,
} from './ui/render.js';

// --- ЕДИНСТВЕННЫЙ объект state ---
const state = {
    filters: {
        search: '',
        genre: '',
        onlyAvailable: false,
        sortBy: 'title',
    },
    wishlist: new Set(),
};

const STORAGE_FILTERS = 'booknest.filters';
const STORAGE_WISHLIST = 'booknest.wishlist';

// --- localStorage с try/catch ---
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_FILTERS);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.filters = { ...state.filters, ...parsed };
        }
    } catch (e) {
        console.warn('filters: некорректные данные в localStorage', e);
    }
    try {
        const raw = localStorage.getItem(STORAGE_WISHLIST);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) state.wishlist = new Set(parsed);
        }
    } catch (e) {
        console.warn('wishlist: некорректные данные в localStorage', e);
    }
}

function saveFilters() {
    try {
        localStorage.setItem(STORAGE_FILTERS, JSON.stringify(state.filters));
    } catch (e) {
        console.warn('Не удалось сохранить filters', e);
    }
}

function saveWishlist() {
    try {
        localStorage.setItem(STORAGE_WISHLIST, JSON.stringify([...state.wishlist]));
    } catch (e) {
        console.warn('Не удалось сохранить wishlist', e);
    }
}

// --- ЕДИНСТВЕННАЯ функция render ---
function render() {
    const filtered = applyFilters(books, state.filters);

    renderBooks(document.querySelector('[data-role="catalog"]'), filtered, state.wishlist);
    renderCount(document.querySelector('[data-role="count"]'), filtered.length);
    renderEmptyState(document.querySelector('[data-role="empty"]'), filtered.length === 0);
    renderWishlistCount(document.querySelector('[data-role="wishlist-count"]'), state.wishlist.size);
    renderWishlist(
        document.querySelector('[data-role="wishlist-list"]'),
        books.filter((b) => state.wishlist.has(b.id)),
    );

    document.querySelector('#search').value = state.filters.search;
    document.querySelector('#genre').value = state.filters.genre;
    document.querySelector('#sort').value = state.filters.sortBy;
    document.querySelector('#available').checked = state.filters.onlyAvailable;
}

// --- Инициализация жанров ---
function initGenreSelect() {
    const select = document.querySelector('#genre');
    select.replaceChildren();
    const all = document.createElement('option');
    all.value = '';
    all.textContent = 'Все жанры';
    select.appendChild(all);
    getUniqueGenres(books).forEach((genre) => {
        const opt = document.createElement('option');
        opt.value = genre;
        opt.textContent = genre;
        select.appendChild(opt);
    });
}

// --- Делегирование ---
function setupEventListeners() {
    const form = document.querySelector('#filters-form');
    form.addEventListener('input', (event) => {
        const { target } = event;
        if (target.id === 'search') state.filters.search = target.value;
        if (target.id === 'genre') state.filters.genre = target.value;
        if (target.id === 'sort') state.filters.sortBy = target.value;
        if (target.id === 'available') state.filters.onlyAvailable = target.checked;
        saveFilters();
        render();
    });
    form.addEventListener('submit', (event) => event.preventDefault());

    document.querySelector('#reset-btn').addEventListener('click', () => {
        state.filters = { search: '', genre: '', onlyAvailable: false, sortBy: 'title' };
        saveFilters();
        render();
    });

    document.querySelector('[data-role="catalog"]').addEventListener('click', (event) => {
        const btn = event.target.closest('[data-action="wishlist"]');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        if (state.wishlist.has(id)) state.wishlist.delete(id);
        else state.wishlist.add(id);
        saveWishlist();
        render();
    });

    document.querySelector('[data-role="wishlist-list"]').addEventListener('click', (event) => {
        const btn = event.target.closest('[data-action="remove-wishlist"]');
        if (!btn) return;
        state.wishlist.delete(Number(btn.dataset.id));
        saveWishlist();
        render();
    });
}

// --- Запуск ---
function init() {
    loadState();
    initGenreSelect();
    setupEventListeners();
    render();
}

init();