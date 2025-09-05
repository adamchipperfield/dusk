import { getRefs, parseHtml } from '@theme/dom';
import { sectionStatusHandler, text } from '@theme/fetch';
import { HTMLCustomElement } from '@theme/html-custom-element';

class LocalizationForm extends HTMLCustomElement {
  attributes = {
    /**
     * The container section.
     */
    sectionId: 'section-id',
  };

  requiredAttributes = [this.attributes.sectionId];

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.on('change', this.refs.country, this.handleCountrySelect.bind(this));
  }

  /**
   * Handles the country select event.
   * @param {InputEvent} event - The event payload.
   */
  async handleCountrySelect(event) {
    this.refs.language.disabled = true;

    await text(
      fetch(
        `${theme.routes.root_url}?country=${event.target.value}&section_id=${this.getAttribute(
          this.attributes.sectionId,
        )}`,
      ),
      sectionStatusHandler,
    ).then((response) => {
      const element = parseHtml(response, this.tagName);
      const refs = getRefs(element);

      /**
       * Updates the language options to those available with the selected country.
       */
      this.refs.language.innerHTML = '';

      for (const option of refs.language.options) {
        this.refs.language.add(new Option(option.text, option.value, option.defaultSelected, option.selected));
      }

      requestAnimationFrame(() => {
        this.refs.language.disabled = false;
      });
    });
  }
}

if (!customElements.get('localization-form')) customElements.define('localization-form', LocalizationForm);
