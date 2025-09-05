import { getRefs, on } from '@theme/dom';
import { subscribe } from '@theme/event-bus';

/**
 * General custom element helpers, such as ref selectors and event management.
 */
export class HTMLCustomElement extends HTMLElement {
  events = [];

  /**
   * Throws an error if any of these attributes don't exist.
   * @type {string[]}
   */
  requiredAttributes = [];

  /**
   * Throws an error if any of these refs don't exist.
   * @type {string[]}
   */
  requiredRefs = [];

  constructor() {
    super();

    this.resetRefs();
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    if (this.requiredAttributes && this.requiredAttributes.length) {
      for (const attribute of this.requiredAttributes) {
        if (!this.hasAttribute(attribute)) {
          throw new MissingRequiredAttributeError(attribute, this);
        }
      }
    }

    if (this.requiredRefs && this.requiredRefs.length) {
      for (const name of this.requiredRefs) {
        if (!this.refs[name]) {
          throw new MissingRequiredRefError(name, this);
        }
      }
    }
  }

  /**
   * Returns elements related to the custom element.
   * @returns {ReturnType<typeof import('./utilities').getRefs>}
   */
  get refs() {
    return this.cachedRefs ?? {};
  }

  /**
   * Applies a self-cleaning event listener.
   * @param {Parameters<typeof import('@theme/utilities').on>} args - The `on` helper arguments.
   */
  on(...args) {
    this.events.push(on(...args));
  }

  /**
   * Applies a self-cleaning Event Bus listener.
   * @param {Parameters<typeof import('event-bus').subscribe>} args - The `on` helper arguments.
   */
  subscribe(...args) {
    this.events.push(subscribe(...args));
  }

  /**
   * Removes all self-cleaning event listeners.
   */
  removeEventListeners() {
    for (const removeEvent of this.events) {
      removeEvent();
    }

    /**
     * Clear the event state.
     */
    this.events = [];
  }

  /**
   * Queries the refs again.
   */
  resetRefs() {
    this.cachedRefs = getRefs(this);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

class MissingRequiredAttributeError extends Error {
  /**
   * @param {string} attribute
   * @param {HTMLCustomElement} element
   */
  constructor(attribute, element) {
    super(`Required attribute "${attribute}" not found on element ${element.tagName.toLowerCase()}`);
  }
}

class MissingRequiredRefError extends Error {
  /**
   * @param {string} name
   * @param {HTMLCustomElement} element
   */
  constructor(name, element) {
    super(`Required ref "${name}" not found in element ${element.tagName.toLowerCase()}`);
  }
}
