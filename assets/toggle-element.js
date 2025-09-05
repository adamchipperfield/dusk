import { getFocusableElements, trapFocus } from '@theme/a11y';
import { isUntilBreakpoint } from '@theme/breakpoints';
import { classes, events } from '@theme/constants';
import { getAttributeValue, on } from '@theme/dom';
import { publish } from '@theme/event-bus';
import { HTMLCustomElement } from '@theme/html-custom-element';
import { HTMLShopifySectionElement } from '@theme/html-shopify-section-element';
import { debounce } from '@theme/utilities';

/**
 * @typedef {'dialog'} Presets
 */

/**
 * Handles the state of toggleable UI elements, such as drawers.
 */
export class ToggleElement extends HTMLShopifySectionElement {
  attributes = {
    /**
     * Defines the breakpoint until which the toggle should work.
     */
    untilBreakpoint: 'until-breakpoint',

    /**
     * Defines the preset for the element settings.
     * @see {Presets}
     */
    preset: 'preset',

    /**
     * Moves the element to the end of the body tag.
     */
    hoist: 'hoist',
  };

  requiredAttributes = ['id'];

  mounted = false;
  hoisted = false;

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.subscribe(events.toggleElementOpen, ({ id }) => {
      if (id === this.id) this.open();
    });

    this.subscribe(events.toggleElementClose, ({ id }) => {
      if (id === this.id) this.close();
    });

    this.subscribe(events.toggleElementToggle, ({ id }) => {
      if (id === this.id) this.toggle();
    });

    this.subscribe(events.toggleElementOpening, ({ id }) => {
      /**
       * If this is, or contains, the opening element, prevent closing.
       */
      if (id == this.id || this.contains(document.getElementById(id))) {
        return;
      }

      this.close();
    });

    /**
     * Internal close buttons.
     */
    this.on('click', this.refs.close && this.refs.close.all, this.close.bind(this));

    /**
     * External open buttons.
     */
    if (this.options.openEvent) this.subscribe(events[this.options.openEvent], this.open.bind(this));
    if (this.options.closeOnEscape) this.subscribe(events.escapeKey, this.close.bind(this));

    /**
     * Sets the window resize event.
     */
    this.on('resize', window, debounce(this.setDefaultState.bind(this)));

    /**
     * Prepares the element for toggling.
     */
    this.setDefaultState();

    if (this.options.hoist && !this.hoisted) {
      this.hoisted = true;

      /**
       * Move to the end of the document body.
       */
      document.body.appendChild(this);
    }
  }

  /**
   * Sets the default state for the element.
   */
  setDefaultState() {
    /**
     * If the element has the "until" breakpoint attribute, conditionally set the default state.
     */
    if (this.hasAttribute(this.attributes.untilBreakpoint)) {
      if (isUntilBreakpoint(this.getAttribute(this.attributes.untilBreakpoint))) {
        this.mount();
        return;
      }

      this.destroy();
      return;
    }

    this.mount();
  }

  /**
   * Applies the default attributes etc.
   */
  mount() {
    if (this.mounted) return;

    if (this.options.setA11yAttributes) {
      this.setA11yAttributes();
    }

    this.mounted = true;
  }

  /**
   * Disables the toggle events and resets attributes.
   */
  async destroy() {
    if (!this.mounted) {
      return;
    }

    await this.close();

    if (this.options.setA11yAttributes) {
      this.setA11yAttributes(true);
    }

    this.mounted = false;
  }

  /**
   * Toggles between the open and closed state.
   * @param {Event} event - Optional event for `preventDefault`.
   */
  async toggle(event) {
    if (this.classList.contains(classes.open)) {
      return this.close(event);
    }

    return this.open(event);
  }

  /**
   * Opens the dialog element, and sets body events.
   * @param {Event} event - Optional event for `preventDefault`.
   */
  async open(event) {
    if (this.classList.contains(classes.open) || !this.mounted) return;
    if (event) event.preventDefault();

    /**
     * Open the parent first.
     */
    if (this.parent && !this.parent.classList.contains(classes.open)) {
      await this.parent.open();
    }

    if (this.options.bodyScrollLock) {
      document.body.style.overflow = 'hidden';
    }

    this.classList.add(classes.transitioning);
    this.classList.add(classes.open);

    await this.waitForTransitionEnd();

    this.classList.remove(classes.transitioning);

    if (this.options.closeOnBodyClick && !this.removeBodyEvent) {
      requestAnimationFrame(() => {
        this.removeBodyEvent = on('click', document.body, this.handleBodyClick.bind(this));
      });
    }

    if (this.options.trapFocus && !this.releaseFocus) {
      requestAnimationFrame(() => {
        this.releaseFocus = trapFocus(this);
      });
    }

    if (this.options.setA11yAttributes) {
      this.setA11yAttributes();
    }

    publish(events.toggleElementOpening, { id: this.id });

    this.dispatchEvent(new CustomEvent('open'));

    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  /**
   * Closes the dialog element, and clears up event listeners.
   */
  async close() {
    if (!this.classList.contains(classes.open) || !this.mounted) return;

    /**
     * Closes nested elements first.
     */
    await Promise.all(
      [...this.dialogElement.querySelectorAll(this.tagName.toLowerCase())].map((element) => {
        if (!element.classList.contains(classes.open)) {
          return Promise.resolve();
        }

        return element.close();
      }),
    );

    this.classList.add(classes.transitioning);
    this.classList.remove(classes.open);

    await this.waitForTransitionEnd();

    this.classList.remove(classes.transitioning);

    if (this.options.bodyScrollLock) {
      /**
       * Only enable scroll if there aren't other elements requiring locked body scroll.
       */
      if (
        ![...document.querySelectorAll(`${this.tagName}.${classes.open}`)].find(
          (element) => element.options.bodyScrollLock,
        )
      ) {
        document.body.style.overflow = '';
      }
    }

    if (this.removeBodyEvent) this.removeBodyEvent = this.removeBodyEvent();
    if (this.releaseFocus) this.releaseFocus = this.releaseFocus();

    if (this.options.setA11yAttributes) {
      this.setA11yAttributes();
    }

    this.dispatchEvent(new CustomEvent('close'));

    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  /**
   * Handles the body click event.
   * @param {MouseEvent} event - The click event.
   */
  handleBodyClick(event) {
    if (
      this.dialogElement.contains(event.target) ||
      /**
       * Returns open nested dialogs.
       */
      this.querySelector(`${this.tagName.toLowerCase()}.${classes.open}`) ||
      /**
       * Allow the Shopify cookie modal.
       */
      event.target.closest('#shopify-pc__banner') ||
      event.target.closest('#shopify-pc__prefs')
    ) {
      return;
    }

    this.close();
  }

  /**
   * Sets accessibility related attributes.
   * @param {Boolean} remove - Removes the accessibility attributes.
   */
  setA11yAttributes(remove) {
    for (const element of [...getFocusableElements(this, true), this]) {
      if (remove) {
        element.removeAttribute('tabindex');
        return;
      }

      element.setAttribute('tabindex', this.classList.contains(classes.open) ? 0 : -1);

      if (!this.classList.contains(classes.open)) {
        element.blur();
      }
    }

    if (remove) {
      this.removeAttribute('aria-hidden');
      return;
    }

    this.setAttribute('aria-hidden', !this.classList.contains(classes.open));
  }

  /**
   * Returns a Promise for waiting for the transition-end.
   * @returns {Promise}
   */
  waitForTransitionEnd() {
    return new Promise((resolve) => {
      if (!this.hasTransition()) {
        resolve();
      }

      let removeEvent;

      const onTransitionEnd = (event) => {
        event.stopPropagation();

        removeEvent();
        resolve();
      };

      removeEvent = on('transitionend', this.dialogElement, onTransitionEnd);
    });
  }

  /**
   * Returns if the dialog element has a transition in CSS.
   * @returns {Boolean}
   */
  hasTransition() {
    return (
      (parseFloat(getComputedStyle(this.dialogElement).transitionDuration) ||
        parseFloat(getComputedStyle(this.dialogElement).transitionDelay)) > 0
    );
  }

  /**
   * Handles the theme editor select event.
   */
  onSectionSelect() {
    this.options.openOnSectionSelect && this.open();
  }

  /**
   * Handles the theme editor de-select event.
   */
  onSectionDeselect() {
    this.options.openOnSectionSelect && this.close();
  }

  /**
   * Default feature flag options.
   */
  get defaults() {
    const defaults = {
      openEvent: null,
      closeOnEscape: false,
      closeOnBodyClick: false,
      bodyScrollLock: false,
      trapFocus: false,
      setA11yAttributes: false,
      openOnSectionSelect: false,
      hoist: false,
    };

    if (this.hasAttribute(this.attributes.preset)) {
      if (this.getAttribute(this.attributes.preset) === 'dialog') {
        return {
          ...defaults,
          closeOnEscape: true,
          bodyScrollLock: true,
          trapFocus: true,
          setA11yAttributes: true,
          closeOnBodyClick: true,
        };
      }
    }

    return defaults;
  }

  /**
   * Feature flags based on attributes.
   */
  get options() {
    return {
      /** @type {String} */
      openEvent: getAttributeValue(this, 'open-event', this.defaults.openEvent),
      /** @type {Boolean} */
      closeOnEscape: getAttributeValue(this, 'close-on-escape', this.defaults.closeOnEscape),
      /** @type {Boolean} */
      bodyScrollLock: getAttributeValue(this, 'body-scroll-lock', this.defaults.bodyScrollLock),
      /** @type {Boolean} */
      trapFocus: getAttributeValue(this, 'trap-focus', this.defaults.trapFocus),
      /** @type {Boolean} */
      setA11yAttributes: getAttributeValue(this, 'set-tabindex', this.defaults.setA11yAttributes),
      /** @type {Boolean} */
      closeOnBodyClick: getAttributeValue(this, 'close-on-body-click', this.defaults.closeOnBodyClick),
      /** @type {Boolean} */
      openOnSectionSelect: getAttributeValue(this, 'open-on-section-select', this.defaults.openOnSectionSelect),
      /** @type {Boolean} */
      hoist: getAttributeValue(this, 'hoist', this.defaults.hoist),
    };
  }

  /**
   * The container used for body click events.
   * @type {HTMLElement}
   */
  get dialogElement() {
    return this.refs.dialog ?? this;
  }

  /**
   * The parent toggle element.
   * @type {ToggleElement}
   */
  get parent() {
    return this.parentElement.closest(this.tagName.toLowerCase());
  }
}

/**
 * @typedef {'open'|'close'|'toggle'} ToggleElementButtonAction
 */

export class ToggleElementButton extends HTMLCustomElement {
  attributes = {
    /**
     * The toggle element instance to control.
     */
    toggleId: 'toggle-id',

    /**
     * Prevents the event from running.
     */
    disabled: 'disabled',

    /**
     * The action to run on click.
     * @see {ToggleElementButtonAction}
     */
    action: 'action',
  };

  requiredAttributes = [this.attributes.toggleId];

  /**
   * The button element which will be clicked.
   * @returns {HTMLButtonElement}
   */
  get button() {
    return this.firstElementChild;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.on('click', this.button, (event) => {
      if (getAttributeValue(this, this.attributes.disabled, false)) {
        return;
      }

      event.preventDefault();

      publish(`toggle-element-${getAttributeValue(this, this.attributes.action, 'open')}`, {
        id: this.getAttribute(this.attributes.toggleId),
      });
    });
  }
}
