import { events } from '@theme/constants';
import { on, updateSectionElements } from '@theme/dom';
import { publish, subscribe } from '@theme/event-bus';
import { SelectProvider } from '@theme/select-provider';
import { ToggleElement, ToggleElementButton } from '@theme/toggle-element';
import { VideoElement } from '@theme/video-element';

/**
 * Keyboard events.
 */
on('keyup', document, (event) => {
  if (event.key === 'Escape') publish(events.escapeKey);
});

/**
 * Custom elements.
 */
customElements.define('select-provider', SelectProvider);
customElements.define('toggle-element', ToggleElement);
customElements.define('toggle-element-button', ToggleElementButton);
customElements.define('video-element', VideoElement);

/**
 * Handles Section Rendering API events.
 */
subscribe(events.sectionUpdate, async ({ sections, onComplete }) => {
  await Promise.all(
    Object.entries(sections).map(([sectionId, sectionHtml]) => updateSectionElements(sectionId, sectionHtml)),
  );

  if (typeof onComplete === 'function') {
    onComplete();
  }
});
