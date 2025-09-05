/**
 * Capitalizes the string.
 * @param {String} string - The source string to format.
 * @returns {String}
 */
export function capitalize(string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}

/**
 * Formats a string into camel case.
 * @param {String} input - The string to format.
 * @returns {String}
 */
export function camelCase(input) {
  return input
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

/**
 * Returns the names of cart-related sections.
 * @returns {String[]}
 */
export function getCartSectionNames() {
  return ['.shopify-section-header', '.shopify-section-cart-drawer', '.shopify-section-main-cart']
    .map((selector) => document.querySelector(selector)?.id.replace('shopify-section-', ''))
    .filter(Boolean);
}

/**
 * Returns a function, that, as long as it continues to be invoked,
 * will not be triggered. The function will be called after it stops
 * being called for N milliseconds. If `immediate` is passed, trigger
 * the function on the leading edge, instead of the trailing.
 *
 * @param {Function} callback - The function to execute when timer is passed.
 * @param {Number} wait - The amount of time before debounce call is triggered.
 * @param {Boolean} immediate - Trigger the immediately.
 */
export function throttle(callback, wait, immediate = false) {
  let timeout = null;
  let initialCall = true;

  return function (...args) {
    const callNow = immediate && initialCall;
    function next() {
      callback.apply(this, args);
      timeout = null;
    }

    if (callNow) {
      initialCall = false;
      next();
    }

    if (!timeout) {
      timeout = window.setTimeout(next, wait);
    }
  };
}

/**
 * Debounce functions for better performance
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param {Function} callback The function to debounce.
 * @param {Number} wait - The amount of time before debounce call is triggered.
 * @param {Boolean} immediate - Trigger the immediately.
 */
export function debounce(callback, wait, immediate) {
  let timeout = null;

  return function (...args) {
    const later = function () {
      timeout = null;
      if (!immediate) {
        callback.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);

    if (callNow) {
      callback.apply(this, args);
    }
  };
}

/**
 * Pushes a query parameter to the current location state.
 * @param {String} key - The parameter key.
 * @param {String} value - The value to push (optional).
 */
export function updateQueryParam(key, value, push = false) {
  const url = new URL(window.location.href);

  if (value === null) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }

  window.history[push ? 'pushState' : 'replaceState']({}, '', url);
}
