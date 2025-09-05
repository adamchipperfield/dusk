import { on } from '@theme/dom';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'details',
  'summary',
  '[tabindex]',
  '[contenteditable="true"]',
].join(', ');

/**
 * Returns focusable elements inside a container.
 * @param {HTMLElement} container - The container to find elements.
 * @param {Boolean} excludeHiden - Excludes hidden elements.
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(container, excludeHidden) {
  const elements = [...container.querySelectorAll(focusableSelector)];

  if (!excludeHidden) return elements;

  return elements.filter(
    (element) => element.offsetParent !== null && getComputedStyle(element).visibility !== 'hidden',
  );
}

/**
 * Traps focus inside a container.
 * @param {HTMLElement} container - The container to trap focus in.
 * @returns {Function} Releases the focus trap.
 */
export function trapFocus(container) {
  const focusable = getFocusableElements(container);
  const firstFocusable = focusable[0] ?? container;
  const lastFocusable = focusable[focusable.length - 1] ?? container;
  const previouslyFocused = document.activeElement;

  container.focus();

  const removeFocusinEvent = on(
    'focus',
    document,
    (event) => {
      if (!container.contains(event.target)) {
        (firstFocusable || container).focus();
      }
    },
    true,
  );

  const removeKeydownEvent = on('keydown', container, (event) => {
    if (event.key === 'Tab' || event.keyCode === 9) {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          event.preventDefault();
        }

        return;
      }

      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  });

  return () => {
    removeFocusinEvent();
    removeKeydownEvent();

    container.blur();

    if (previouslyFocused) {
      previouslyFocused.focus();
    }
  };
}
