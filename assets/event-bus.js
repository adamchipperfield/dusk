import { on } from '@theme/dom';

/**
 * Subscribes a callback to an event.
 *
 * @param {String} eventName - The event name.
 * @param {Function} callback - Runs when the event is published.
 * @returns {Function}
 */
export function subscribe(eventName, callback) {
  return on(eventName, document, (event) => callback(event.detail ?? undefined));
}

/**
 * Publishes an event, which triggers any subscribed callbacks.
 *
 * @param {String} eventName - The event name.
 * @param {any} detail - The event payload.
 */
export function publish(eventName, detail) {
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
}
