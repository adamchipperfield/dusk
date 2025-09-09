import { getFocusableElements } from '@theme/a11y';
import { isFromBreakpoint } from '@theme/breakpoints';
import { classes, events } from '@theme/constants';
import { getRefs } from '@theme/dom';
import { publish } from '@theme/event-bus';
import { text } from '@theme/fetch';
import { HTMLCustomElement } from '@theme/html-custom-element';
import { debounce } from '@theme/utilities';

class SiteHeader extends HTMLCustomElement {
  customAttributes = {
    /** @type {string} */
    sectionId: 'section-id',
  };

  requiredAttributes = [this.customAttributes.sectionId];

  connectedCallback() {
    new ResizeObserver(() => {
      document.body.style.setProperty('--header-height', `${this.getBoundingClientRect().height.toFixed(2)}px`);
    }).observe(this);

    this.on('keyup', this.refs.predictiveSearchInput, this.handlePredictiveSearch.bind(this));
  }

  /**
   * Performs a predictive search query and publishes the updated section.
   * @param {KeyboardEvent} event
   */
  async handlePredictiveSearch(event) {
    const url = new URL(theme.routes.predictive_search_url, window.location.origin);

    event.preventDefault();

    url.searchParams.append('q', event.target.value);
    url.searchParams.append('section_id', this.getAttribute(this.customAttributes.sectionId));

    publish(events.sectionUpdate, {
      sections: {
        [this.getAttribute(this.customAttributes.sectionId)]: await text(fetch(url.toString())),
      },
    });
  }
}

class HeaderMenu extends HTMLCustomElement {
  isFromMedium = isFromBreakpoint('medium');

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    if (this.refs.item) {
      this.on('click', this.refs.item.all, this.handleItemClickEvent.bind(this));

      /**
       * Desktop events.
       */
      for (const [name, handler, target] of [
        ['mouseenter', this.openItem, 'target'],
        ['mouseleave', this.closeItem, 'target'],
        ['focusin', this.openItem, 'currentTarget'],
        ['focusout', this.closeItem, 'currentTarget'],
      ]) {
        this.on(name, this.refs.item.all, (event) => {
          if (isFromBreakpoint('medium')) {
            handler.call(this, event[target]);
          }
        });
      }
    }

    if (this.refs.submenu) {
      for (const focusable of this.refs.submenu.all.map(getFocusableElements).flat()) {
        focusable.tabIndex = -1;
      }
    }

    this.on('resize', window, debounce(this.handleWindowResize.bind(this)));
  }

  /**
   * Handles the menu item click event.
   * @param {MouseEvent} event
   */
  handleItemClickEvent(event) {
    const { submenu } = getRefs(event.currentTarget, this.tagName.toLowerCase());

    /**
     * Return if on desktop, or the click is inside the submenu.
     */
    if (isFromBreakpoint('medium') || (submenu && submenu.contains(event.target))) {
      return;
    }

    event.preventDefault();

    if (event.currentTarget.classList.contains(classes.open)) {
      this.closeItem(event.currentTarget);
      return;
    }

    this.openItem(event.currentTarget);
  }

  /**
   * Opens the menu item.
   * @param {HTMLElement} item - The menu item container.
   */
  openItem(item) {
    const { link, submenu } = getRefs(item, this.tagName.toLowerCase());

    item.classList.add(classes.open);

    /**
     * Update a11y attributes.
     */
    if (link) link.ariaExpanded = true;

    if (submenu) {
      submenu.ariaHidden = false;

      for (const element of getFocusableElements(submenu)) {
        element.tabIndex = 0;
      }
    }
  }

  /**
   * Closes the menu item.
   * @param {HTMLElement} item - The menu item container.
   */
  closeItem(item) {
    const { link, submenu } = getRefs(item, this.tagName.toLowerCase());

    item.classList.remove(classes.open);

    /**
     * Update a11y attributes.
     */
    if (link) link.ariaExpanded = false;

    if (submenu) {
      submenu.ariaHidden = true;

      for (const element of getFocusableElements(submenu)) {
        element.tabIndex = -1;
        element.blur();
      }
    }
  }

  /**
   * Sets a ready state to signal that transitions can be safely applied.
   */
  handleWindowResize() {
    this.classList.remove(classes.ready);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.classList.add(classes.ready);
      });
    });

    if (!this.isFromMedium && isFromBreakpoint('medium')) {
      this.isFromMedium = true;

      /**
       * Close items when resizing from mobile to desktop.
       */
      for (const element of this.refs.item.all) {
        this.closeItem(element);
      }

      return;
    }

    this.isFromMedium = isFromBreakpoint('medium');
  }
}

if (!customElements.get('header-menu')) customElements.define('header-menu', HeaderMenu);
if (!customElements.get('site-header')) customElements.define('site-header', SiteHeader);
