// js/ui/render.js
// Только отрисовка DOM. Логики нет.

function createBookCard(book, isWishlisted) {
    const article = document.createElement('article');
    article.className = 'book-card';
    article.dataset.id = book.id;

    const h3 = document.createElement('h3');
    const link = document.createElement('a');
    link.href = 'book.html';
    link.textContent = book.title;
    h3.appendChild(link);
    article.appendChild(h3);

    const author = document.createElement('p');
    author.textContent = `Автор: ${book.author}`;
    article.appendChild(author);

    const info = document.createElement('p');
    info.textContent = `Год: ${book.year} · Жанр: ${book.genre} · Рейтинг: ${book.rating}`;
    article.appendChild(info);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn wishlist-btn';
    btn.dataset.action = 'wishlist';
    btn.dataset.id = String(book.id);
    btn.textContent = isWishlisted ? '★ В списке' : '☆ Хочу прочитать';
    btn.setAttribute('aria-pressed', String(isWishlisted));
    article.appendChild(btn);

    return article;
}

export function renderBooks(container, books, wishlist) {
    container.replaceChildren();
    books.forEach((book) => {
        container.appendChild(createBookCard(book, wishlist.has(book.id)));
    });
}

export function renderCount(el, count) {
    el.textContent = `Найдено: ${count}`;
}

export function renderEmptyState(el, isEmpty) {
    el.hidden = !isEmpty;
}

export function renderWishlistCount(el, count) {
    el.textContent = String(count);
}

export function renderWishlist(container, books) {
    container.replaceChildren();
    books.forEach((book) => {
        const li = document.createElement('li');
        li.className = 'wishlist-item';

        const span = document.createElement('span');
        span.textContent = `${book.title} — ${book.author}`;
        li.appendChild(span);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn wishlist-remove';
        btn.dataset.action = 'remove-wishlist';
        btn.dataset.id = String(book.id);
        btn.textContent = 'Удалить';
        li.appendChild(btn);

        container.appendChild(li);
    });
}