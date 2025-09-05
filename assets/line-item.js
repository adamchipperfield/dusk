import { classes, events } from '@theme/constants';
import { on } from '@theme/dom';
import { publish } from '@theme/event-bus';
import { fetchConfig, json } from '@theme/fetch';
import { HTMLCustomElement } from '@theme/html-custom-element';
import { getCartSectionNames } from '@theme/utilities';

class LineItem extends HTMLCustomElement {
  attributes = {
    /**
     * @see https://shopify.dev/docs/api/liquid/objects/line_item#line_item-key
     */
    key: 'key',
  };

  requiredAttributes = [this.attributes.key];

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.on('change', this.refs.quantity, this.handleQuantityChange.bind(this));
    this.on('click', this.refs.remove, this.handleRemoveEvent.bind(this));
  }

  /**
   * Handles the quantity change event.
   * @param {InputEvent} event - The quantity input change event.
   */
  handleQuantityChange(event) {
    this.updateItem({ quantity: Number(event.target.value) });
  }

  /**
   * Handles the remove click event.
   * @param {MouseEvent} event - The remove click event.
   */
  handleRemoveEvent(event) {
    event.preventDefault();

    /**
     * Set the item's quantity to 0 to remove it.
     */
    this.updateItem({ quantity: 0 });
  }

  /**
   * Updates the line item in the cart.
   * @param {Object} updates - The update data.
   * @param {Number} updates.quantity - The line item quantity.
   */
  async updateItem({ quantity }) {
    if (typeof quantity === 'undefined') {
      return;
    }

    /**
     * Prevents the event.
     * @param {MouseEvent} event - The event payload.
     */
    function prevent(event) {
      event.preventDefault();
    }

    this.classList.add(classes.loading);

    /**
     * Stops the customer from triggering any actions whilst loading.
     */
    this.removeMouseDownEvent = on('mousedown', this, prevent);

    try {
      await json(
        fetch(
          `${theme.routes.cart_update_url}.js`,
          fetchConfig('json', {
            body: JSON.stringify({
              updates: {
                [this.getAttribute(this.attributes.key)]: quantity,
              },
              sections: getCartSectionNames().join(','),
            }),
          }),
        ),
      ).then((response) => {
        this.reset();
        this.removeMouseDownEvent();

        if (response.status) {
          throw new Error(response.message);
        }

        publish(events.cartUpdated);
        publish(events.sectionUpdate, { sections: response.sections });
      });
    } catch {
      this.reset();
    }
  }

  /**
   * Resets the line item state.
   */
  reset() {
    this.classList.remove(classes.loading);
  }
}

if (!customElements.get('line-item')) customElements.define('line-item', LineItem);
