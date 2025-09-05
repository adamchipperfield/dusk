import { isFromBreakpoint } from '@theme/breakpoints';
import { HTMLCustomElement } from '@theme/html-custom-element';
import { debounce } from '@theme/utilities';

/**
 * Custom video wrapper for handling mobile and desktop video sources.
 * - Use the `data-large` attribute on each `source` element.
 * - Lazy load the video (so the original doesn't load by default) by using `data-src` instead of `src`.
 */
export class VideoElement extends HTMLCustomElement {
  requiredRefs = ['video'];

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.on('resize', window, debounce(this.setDefaultState.bind(this)), null, true);
  }

  /**
   * Sets the default video source state.
   */
  setDefaultState() {
    this.setPosterDefaultState();

    for (const element of this.refs.video.children) {
      if (element.tagName === 'SOURCE') {
        this.setSourceDefaultState(element);
      }
    }
  }

  /**
   * Sets the default video state based on viewport.
   * @param {HTMLSourceElement} element - The video source element.
   */
  setSourceDefaultState(element) {
    const reset = () => {
      if (element.hasAttribute('data-src')) {
        this.setSourceSrc(element, element.dataset.src);
      }
    };

    if (!element.hasAttribute('data-large')) {
      /**
       * Loads the default video, if lazy loaded.
       */
      reset();
      return;
    }

    if (isFromBreakpoint('large')) {
      if (!element.hasAttribute('data-src')) {
        element.dataset.src = element.src;
      }

      this.setSourceSrc(element, element.dataset.large);
      return;
    }

    reset();
  }

  /**
   * Sets a `source` element's `src` value.
   * @param {HTMLSourceElement} element - The video source element.
   * @param {String} src - The updated source.
   */
  setSourceSrc(element, src) {
    if (element.getAttribute('src') === src) return;

    element.src = src;

    /**
     * Reload the video with the new source.
     */
    this.refs.video.load();

    if (this.refs.video.autoplay) {
      this.refs.video.play();
    }
  }

  /**
   * Sets the responsive poster attribute.
   */
  setPosterDefaultState() {
    if (this.refs.video.hasAttribute('data-large-poster') && isFromBreakpoint('large')) {
      if (this.refs.video.poster && !this.refs.video.hasAttribute('data-poster')) {
        this.refs.video.dataset.poster = this.refs.video.poster;
      }

      this.setPoster(this.refs.video.dataset.largePoster);
      return;
    }

    if (this.refs.video.hasAttribute('data-poster')) {
      this.setPoster(this.refs.video.dataset.poster);
    }
  }

  /**
   * Sets the video element's poster.
   * @param {String} posterUrl - The poster url to set.
   */
  setPoster(posterUrl) {
    this.refs.video.poster = null;
    this.refs.video.poster = posterUrl;
  }
}
