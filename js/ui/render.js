
const cover = (id) => (id ? `https://covers.openlibrary.org/b/id/${id}-M.jpg` : null);

function createBookCard(book, isWishlisted) {
    const article = document.createElement('article');
    article.className = 'book-card';
    article.dataset.id = book.key;

    const h3 = document.createElement('h3');
    const link = document.createElement('a');
    link.href = `book.html?id=${encodeURIComponent(book.key)}`;
    link.textContent = book.title || 'Без названия';
    h3.appendChild(link);
    article.appendChild(h3);

    const coverUrl = cover(book.cover_i);
    if (coverUrl) {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = coverUrl;
        img.alt = `Обложка книги «${book.title}»`;
        img.width = 150;
        img.height = 220;
        img.loading = 'lazy';
        figure.appendChild(img);
        article.appendChild(figure);
    }

    const author = document.createElement('p');
    const authors = book.author_name?.join(', ') || 'Автор неизвестен';
    author.textContent = `Автор: ${authors}`;
    article.appendChild(author);

    const info = document.createElement('p');
    const year = book.first_publish_year || '—';
    const rating = book.ratings_average
        ? book.ratings_average.toFixed(1)
        : '—';
    info.textContent = `Год: ${year} · Рейтинг: ${rating}`;
    article.appendChild(info);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn wishlist-btn';
    btn.dataset.action = 'wishlist';
    btn.dataset.id = book.key;
    btn.textContent = isWishlisted ? '★ В списке' : '☆ Хочу прочитать';
    btn.setAttribute('aria-pressed', String(isWishlisted));
    article.appendChild(btn);

    return article;
}

// --- Рендер списка  ---
export function renderBooks(container, books, wishlist) {
    container.replaceChildren();
    books.forEach((book) => {
        container.appendChild(createBookCard(book, wishlist.has(book.key)));
    });
}

// --- Счётчик и пагинация ---
export function renderCount(el, data) {
    if (!data) {
        el.textContent = '';
        return;
    }
    el.textContent = `Найдено: ${data.total} (страница ${data.page} из ${data.totalPages || 1})`;
}

export function renderPagination(prevBtn, nextBtn, data) {
    if (!data) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }
    prevBtn.disabled = data.page <= 1;
    nextBtn.disabled = data.page >= data.totalPages;
}

// --- Список желаемого ---
export function renderWishlistCount(el, count) {
    el.textContent = String(count);
}

export function renderWishlist(container, books) {
    container.replaceChildren();
    if (books.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Список пуст';
        container.appendChild(li);
        return;
    }
    books.forEach((book) => {
        const li = document.createElement('li');
        li.className = 'wishlist-item';

        const span = document.createElement('span');
        span.textContent = `${book.title} — ${(book.author_name || []).join(', ')}`;
        li.appendChild(span);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn wishlist-remove';
        btn.dataset.action = 'remove-wishlist';
        btn.dataset.id = book.key;
        btn.textContent = 'Удалить';
        li.appendChild(btn);

        container.appendChild(li);
    });
}

// --- 4 СОСТОЯНИЯ ИНТЕРФЕЙСА ---
export function renderState(uiState, elements) {
    const { catalog, loading, empty, error, count } = elements;


    loading.hidden = uiState.name !== 'loading';
    empty.hidden = uiState.name !== 'empty';
    error.hidden = uiState.name !== 'error';
    catalog.hidden = uiState.name !== 'success';

    if (uiState.name === 'error') {
        error.querySelector('[data-role="error-text"]').textContent = uiState.message;
    }

    if (uiState.name !== 'success') {
        count.textContent = '';
    }
}