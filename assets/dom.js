import { camelCase } from '@theme/utilities';

/**
 * Returns parsed HTML from a string.
 *
 * @param {String} text - The text to parse.
 * @param {String} selector - Optional child selector.
 * @returns {Document|HTMLElement}
 */
export function parseHtml(text, selector) {
  const parsed = new DOMParser().parseFromString(text, 'text/html');

  if (selector) {
    return parsed.querySelector(selector);
  }

  return parsed;
}

/**
 * Returns a parsed attribute values.
 *
 * @param {HTMLElement} element - The element to get attributes from.
 * @param {String} attribute - The attribute name.
 * @param {any} fallback - The fallback value, if the attribute isn't found.
 * @returns {Boolean|Number|String}
 */
export function getAttributeValue(element, attribute, fallback = null) {
  const value = element.getAttribute(attribute);

  if (value === null) {
    return fallback;
  }

  const lowercase = value.toLowerCase();

  /**
   * Handle boolean values.
   */
  if (lowercase === '' || lowercase === 'true') return true;
  if (lowercase === 'false') return false;

  /**
   * Handle number values.
   */
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  return value;
}

/**
 * Adds an event listener to an element or elements.
 *
 * @param {String} event - The event name.
 * @param {HTMLElement | HTMLElement[]} element - The element(s) to apply the listener to.
 * @param {Function} handler - The listener callback.
 * @param {AddEventListenerOptions} options - Options for the event listener.
 * @param {Boolean} immediate - Runs the handler immedaitely, without an event payload.
 * @returns {Function} Removes the event listeners.
 */
export function on(event, element, handler, options, immediate) {
  const add = (element) => element.addEventListener(event, handler, options);
  const remove = (element) => element.removeEventListener(event, handler, options);

  if (!element) return () => null;

  /**
   * Handle multiple elements.
   */
  if (Array.isArray(element)) {
    [...element].forEach(add);

    return () => {
      [...element].forEach(remove);

      return null;
    };
  }

  add(element);

  if (immediate) handler();

  return () => {
    remove(element);

    return null;
  };
}

/**
 * Returns elements related to the parent element.
 *
 * @param {HTMLElement} element - The parent custom element.
 * @param {String} [tagName] - Custom tag name selector, defaults to the element.
 * @returns {Record<string, HTMLElement & { all: HTMLElement[] }>}
 * @example <div data-ref="example-element.item"></div>
 */
export function getRefs(element, tagName) {
  if (!element) return null;

  if (!tagName) {
    tagName = element.tagName.toLowerCase();
  }

  return [...element.querySelectorAll(`[data-ref^="${tagName}"]`)].reduce((refs, ref) => {
    const key = camelCase(ref.dataset.ref.replace(`${tagName}.`, ''));

    if (tagName === element.tagName.toLowerCase() && !(ref.closest(tagName) === element)) {
      return refs;
    }

    if (!Object.hasOwn(refs, key)) {
      refs[key] = ref;
    }

    /**
     * Define the `all` property, for multiple refs of the same name.
     */
    if (Object.hasOwn(refs[key], 'all')) {
      refs[key].all.push(ref);
    } else {
      Object.defineProperty(refs[key], 'all', {
        value: [ref],
      });
    }

    return refs;
  }, {});
}

/**
 * Replaces an element with it's updated version.
 *
 * @param {HTMLElement} fromElement - The current element.
 * @param {HTMLElement} toElement - The updated element.
 * @param {Boolean} childrenOnly - Only updates the elements' children.
 * @param {function(HTMLElement): boolean} onBeforeElUpdated - Decides if an element should be morphed.
 * @returns {Promise<HTMLElement>}
 */
export async function morph(fromElement, toElement, childrenOnly, onBeforeElUpdated) {
  const { default: morphdom } = await import('@theme/morphdom');

  return morphdom(fromElement, toElement, {
    childrenOnly,
    onBeforeElUpdated,
  });
}

/**
 * Updates a section's elements with refreshed content.
 *
 * @param {String} sectionId - The section name.
 * @param {String} sectionHtml - The section content.
 * @returns {Promise<HTMLElement[]>}
 */
export async function updateSectionElements(sectionId, sectionHtml) {
  const sectionElements = document.querySelectorAll(`[data-section-element][data-section="${sectionId}"]`);

  if (sectionElements.length === 0) {
    return [];
  }

  const section = parseHtml(sectionHtml);
  const elements = [];

  for (const sectionElement of sectionElements) {
    const matchedSectionElement = section.querySelector(
      `[data-section-element="${sectionElement.dataset.sectionElement}"]`,
    );

    if (!matchedSectionElement) continue;

    elements.push(
      morph(
        sectionElement,
        matchedSectionElement,
        false,
        /**
         * Exclude dynamic Shopify elements.
         */
        (from) =>
          !['dynamic-checkout-cart', 'payment-button'].includes(from.dataset.shopify) &&
          !from.hasAttribute('data-static'),
      ),
    );
  }

  return Promise.all(elements);
}
