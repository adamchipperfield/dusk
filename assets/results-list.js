import { events } from '@theme/constants';
import { morph, parseHtml } from '@theme/dom';
import { publish } from '@theme/event-bus';
import { sectionStatusHandler, text } from '@theme/fetch';
import { HTMLCustomElement } from '@theme/html-custom-element';

/**
 * Handles filter and sort selections with the Section Rendering API.
 */
class ResultsList extends HTMLCustomElement {
  attributes = {
    /**
     * The container section.
     * - This is optional, but recommended to speed up the request.
     */
    sectionId: 'section-id',

    /**
     * @see https://shopify.dev/docs/api/liquid/objects/collection#collection-default_sort_by
     * @see https://shopify.dev/docs/api/liquid/objects/search#search-default_sort_by
     */
    defaultSortBy: 'default-sort-by',
  };

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.on('change', this.refs.sort, this.handleFormSubmit.bind(this));
    this.on('change', this.refs.filters, this.handleFormSubmit.bind(this));
  }

  /**
   * Handles the sort or filter form submit event.
   * @param {SubmitEvent} event - The form submit event.
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    const data = [...new FormData(this.refs.filters), ...new FormData(this.refs.sort)];
    const params = this.filterSearchParams(new URLSearchParams(data));
    const section = this.sectionId ? ['section_id', this.sectionId] : [null, null];
    const query = new URLSearchParams([...params.entries(), section]).toString();
    const { origin, pathname } = window.location;

    /**
     * Update the query parameters.
     */
    window.history.pushState({}, '', `${origin}${pathname}${params.size === 0 ? '' : `?${params.toString()}`}`);

    try {
      await text(fetch(`${origin}${pathname}?${query}`), sectionStatusHandler).then(async (response) => {
        if (this.sectionId) {
          publish(events.sectionUpdate, {
            sections: {
              [this.sectionId]: response,
            },
          });

          return;
        }

        morph(this, parseHtml(response, this.tagName.toLowerCase()));
      });
    } catch {
      /**
       * Since we couldn't update the results, reload the page.
       */
      window.location.reload();
    }
  }

  /**
   * Filters out empty values, or the default sort by option.
   * @param {URLSearchParams} params - The search params.
   * @returns {URLSearchParams}
   */
  filterSearchParams(params) {
    return new URLSearchParams([
      ...params.entries().filter(([key, value]) => {
        if (value === '') {
          return false;
        }

        if (key === 'sort_by' && this.hasAttribute(this.attributes.defaultSortBy)) {
          return !(value === this.getAttribute(this.attributes.defaultSortBy));
        }

        return true;
      }),
    ]);
  }

  /**
   * The section container.
   */
  get sectionId() {
    return this.getAttribute(this.attributes.sectionId);
  }
}

if (!customElements.get('results-list')) customElements.define('results-list', ResultsList);
