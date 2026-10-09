
/**
 * Откладывает вызов fn, пока не пройдёт delay мс без новых вызовов.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 350) {
    let timerId;
    return function debounced(...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn.apply(this, args), delay);
    };
}