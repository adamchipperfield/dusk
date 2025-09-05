import { morph, parseHtml } from '@theme/dom';
import { text } from '@theme/fetch';
import { HTMLCustomElement } from '@theme/html-custom-element';

class ProductRecommendations extends HTMLCustomElement {
  attributes = {
    /**
     * The recommendations endpoint.
     */
    url: 'url',
  };

  requiredAttributes = [this.attributes.url];

  connectedCallback() {
    text(fetch(`${this.getAttribute(this.attributes.url)}`), async (response) => {
      /**
       * @see https://shopify.dev/docs/api/ajax/reference/product-recommendations#error-responses
       */

      if (response.status === 404) {
        throw new Error('Product or section not found');
      }

      if (response.status === 422) {
        throw new Error('A parameter was invalid');
      }

      return response;
    }).then((response) => {
      morph(this, parseHtml(response, 'product-recommendations'));
    });
  }
}

if (!customElements.get('product-recommendations'))
  customElements.define('product-recommendations', ProductRecommendations);
