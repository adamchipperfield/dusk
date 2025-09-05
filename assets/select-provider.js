import { HTMLCustomElement } from '@theme/html-custom-element';

/**
 * Provides useful functions for select elements.
 *
 * @attribute default-value - The default selected value.
 */
export class SelectProvider extends HTMLCustomElement {
  attributes = {
    /**
     * The default select value.
     */
    defaultValue: 'default-value',
  };

  connectedCallback() {
    const selector = this.querySelector('select');

    if (!selector) {
      throw new Error('The `select-provider` element must contain a select element.');
    }

    if (this.hasAttribute(this.attributes.defaultValue)) {
      for (const [index, option] of [...selector.options].entries()) {
        if (option.value === this.getAttribute(this.attributes.defaultValue)) {
          selector.selectedIndex = index;
        }
      }
    }
  }
}
