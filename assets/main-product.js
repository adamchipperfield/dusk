import { events } from '@theme/constants';
import { parseHtml } from '@theme/dom';
import { publish } from '@theme/event-bus';
import { sectionStatusHandler, text } from '@theme/fetch';
import { HTMLCustomElement } from '@theme/html-custom-element';
import { updateQueryParam } from '@theme/utilities';

customElements.define(
  'main-product',
  class MainProduct extends HTMLCustomElement {
    attributes = {
      /**
       * The container section.
       */
      sectionId: 'section-id',
    };

    requiredAttributes = [this.attributes.sectionId];

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();

      this.on('option-change', this.refs.form, this.handleOptionChange.bind(this));
    }

    /**
     * Handles the product form option change event.
     * @param {Object} event - The event payload.
     */
    async handleOptionChange(event) {
      const response = await this.getSectionByOptionValues(event.detail);
      const section = parseHtml(response, this.tagName.toLowerCase());

      publish(events.sectionUpdate, {
        sections: {
          [this.getAttribute(this.attributes.sectionId)]: response,
        },
      });

      updateQueryParam('variant', section.getAttribute('selected-variant'));
    }

    /**
     * Fetches and returns the updated section.
     * @param {String[]} values - The selected option values.
     * @returns {Promise<String>}
     */
    getSectionByOptionValues(values) {
      return text(
        fetch(
          `${window.location.pathname}?section_id=${this.getAttribute(
            this.attributes.sectionId,
          )}&option_values=${values.join(',')}`,
        ),
        sectionStatusHandler,
      );
    }
  },
);
