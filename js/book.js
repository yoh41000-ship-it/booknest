
// Страница деталей книги

import { getBookById } from './api/books.js';
import { ApiError } from './api/client.js';

const elements = {
    loading: document.querySelector('[data-role="loading"]'),
    error: document.querySelector('[data-role="error"]'),
    errorText: document.querySelector('[data-role="error-text"]'),
    book: document.querySelector('[data-role="book"]'),
    title: document.querySelector('[data-role="title"]'),
    authors: document.querySelector('[data-role="authors"]'),
    year: document.querySelector('[data-role="year"]'),
    description: document.querySelector('[data-role="description"]'),
};

function show(name) {
    elements.loading.hidden = name !== 'loading';
    elements.error.hidden = name !== 'error';
    elements.book.hidden = name !== 'success';
}

function renderBook(book) {
    elements.title.textContent = book.title || 'Без названия';
    elements.authors.textContent = (book.by_statement) || 'Автор неизвестен';
    elements.year.textContent = book.first_publish_date
        || book.first_publish_year
        || '—';
    if (typeof book.description === 'string') {
        elements.description.textContent = book.description;
    } else if (book.description?.value) {
        elements.description.textContent = book.description.value;
    } else {
        elements.description.textContent = 'Описание отсутствует.';
    }
}

async function load() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        elements.errorText.textContent = 'Не указан идентификатор книги.';
        show('error');
        return;
    }

    show('loading');
    try {
        const book = await getBookById(id);
        renderBook(book);
        show('success');
    } catch (error) {
        if (error instanceof ApiError) {
            if (error.status === 404) {
                elements.errorText.textContent = 'Книга не найдена (404).';
            } else if (error.status === 0) {
                elements.errorText.textContent = 'Нет подключения к сети.';
            } else {
                elements.errorText.textContent = `Ошибка: ${error.message}`;
            }
        } else {
            elements.errorText.textContent = 'Неизвестная ошибка.';
        }
        show('error');
    }
}

load();