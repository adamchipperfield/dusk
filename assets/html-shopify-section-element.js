import { HTMLCustomElement } from '@theme/html-custom-element';
import { capitalize } from '@theme/utilities';

/**
 * Applies section specific helpers.
 * - Extend this custom element to hook into theme editor events.
 */
export class HTMLShopifySectionElement extends HTMLCustomElement {
  /**
   * Returns the Shopify section container.
   * @returns {HTMLElement}
   */
  get container() {
    return this.closest('.shopify-section');
  }

  /**
   * The Shopify theme editor event names.
   * @returns {String[]}
   */
  get eventNames() {
    return [
      'shopify:section:select',
      'shopify:section:deselect',
      'shopify:section:reorder',
      'shopify:block:select',
      'shopify:block:deselect',
    ];
  }

  /**
   * Maps the event names into an array of event objects, with their handlers.
   * @returns {{
   *   name: String
   *   handler: Function
   * }[]}
   */
  get editorEvents() {
    return this.eventNames.reduce((handlers, name) => {
      const methodName = this.convertEventToMethodName(name);
      const handler = this[methodName];

      if (typeof handler === 'function') {
        handlers.push({
          name,
          handler: (event) => handler.call(this, event),
        });
      }

      return handlers;
    }, []);
  }

  /**
   * Converts a theme editor event name into it's corresponding method.
   * @param {String} eventName - The original event name.
   * @returns {String}
   */
  convertEventToMethodName(eventName) {
    return `on${eventName.split(':').slice(1).map(capitalize).join('')}`;
  }

  /**
   * Called each time the element is added to the document.
   */
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    if (!this.container) {
      return;
    }

    for (const { name, handler } of this.editorEvents) {
      this.on(name, this.container, handler);
    }
  }
}
