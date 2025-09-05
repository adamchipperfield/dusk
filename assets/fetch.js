/**
 * @typedef {{ [key: string]: string | undefined }} Headers
 */

/**
 * @typedef {Object} FetchConfig
 * @property {string} method
 * @property {Headers} headers
 * @property {string | FormData | undefined} [body]
 */

/**
 * Creates a fetch configuration object
 * @param {string} [type] The type of response to expect
 * @param {Object} [config] The config of the request
 * @param {FetchConfig['body']} [config.body] The body of the request
 * @param {FetchConfig['headers']} [config.headers] The headers of the request
 * @returns {RequestInit} The fetch configuration object
 */
export function fetchConfig(type = 'json', config = {}) {
  /** @type {Headers} */
  const headers = { 'Content-Type': 'application/json', Accept: `application/${type}`, ...config.headers };

  if (type === 'javascript') {
    headers['X-Requested-With'] = 'XMLHttpRequest';
    delete headers['Content-Type'];
  }

  return {
    method: 'POST',
    headers: /** @type {HeadersInit} */ (headers),
    body: config.body,
  };
}

/**
 * Returns a Promise which resolves with the result of parsing the body text as JSON.
 * @param {Promise} fetch - The fetch request.
 * @param {function(): Promise<Response>} [statusHandler] - Handles the initial response status.
 * @returns {Promise}
 */
export async function json(fetch, statusHandler) {
  const handler = (response) => response.json();

  if (statusHandler) {
    return fetch.then(statusHandler).then(handler);
  }

  return fetch.then(handler);
}

/**
 * Returns a Promise that resolves with a string.
 * @param {Promise} fetch - The fetch request.
 * @param {() => Promise<Response>} [statusHandler] - Handles the initial response status.
 * @returns {Promise}
 */
export async function text(fetch, statusHandler) {
  const handler = (response) => response.text();

  if (statusHandler) {
    return fetch.then(statusHandler).then(handler);
  }

  return fetch.then(handler);
}

/**
 * Handles the section rendering initial response status.
 * @param {Response} response - The request response.
 * @returns {Response}
 */
export function sectionStatusHandler(response) {
  if (response.status === 404) {
    throw new (class SectionNotFoundError extends Error {
      /**
       * @param {Response} response
       */
      constructor(response) {
        const url = new URL(response.url);

        super(`Section "${url.searchParams.get('section_id')}" not found`);
      }
    })(response);
  }

  return response;
}
