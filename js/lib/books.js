// js/lib/books.js
// Чистые функции — не мутируют аргументы, не обращаются к DOM

export function filterBySearch(books, query) {
    if (!query) return books;
    const normalized = query.trim().toLowerCase();
    return books.filter((book) => (
        book.title.toLowerCase().includes(normalized)
        || book.author.toLowerCase().includes(normalized)
    ));
}

export function filterByGenre(books, genre) {
    if (!genre) return books;
    return books.filter((book) => book.genre === genre);
}

export function filterByAvailability(books, onlyAvailable) {
    if (!onlyAvailable) return books;
    return books.filter((book) => book.available);
}

export function sortBooks(books, sortBy) {
    const copy = [...books];
    switch (sortBy) {
        case 'title':
            return copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        case 'year':
            return copy.sort((a, b) => b.year - a.year);
        case 'rating':
            return copy.sort((a, b) => b.rating - a.rating);
        default:
            return copy;
    }
}

export function getUniqueGenres(books) {
    const set = new Set(books.map((book) => book.genre));
    return [...set].sort((a, b) => a.localeCompare(b, 'ru'));
}

export function applyFilters(books, filters) {
    let result = books;
    result = filterBySearch(result, filters.search);
    result = filterByGenre(result, filters.genre);
    result = filterByAvailability(result, filters.onlyAvailable);
    result = sortBooks(result, filters.sortBy);
    return result;
}
