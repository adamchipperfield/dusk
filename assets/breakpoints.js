/**
 * Media query breakpoints.
 */
export const breakpoints = {
  small: 576,
  medium: 768,
  large: 1024,
  xlarge: 1328,
};

/**
 * Returns if the viewport is at least the named breakpoint.
 * @param {keyof typeof breakpoints} breakpoint - The name of the breakpoint.
 * @returns {Boolean}
 */
export function isFromBreakpoint(breakpoint) {
  return window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`).matches;
}

/**
 * Returns if the viewport is less than the named breakpoint.
 * @param {keyof typeof breakpoints} breakpoint - The name of the breakpoint.
 * @returns {Boolean}
 */
export function isUntilBreakpoint(breakpoint) {
  return window.matchMedia(`(max-width: ${breakpoints[breakpoint] - 1}px)`).matches;
}
