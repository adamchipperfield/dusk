# Breakpoints

There are 4 responsive breakpoints used throughout the theme:

| Name        | Size   |
| ----------- | ------ |
| Small       | 576px  |
| Medium      | 768px  |
| Large       | 1024px |
| Extra large | 1328px |

In JavaScript, you can import these values:

```js
import { breakpoints } from '@theme/breakpoints';

alert(`The large breakpoint starts at ${breakpoints.large}px`);
```

You can also use the `isFromBreakpoint` and `isUntilBreakpoint` helper methods:

```js
import { isFromBreakpoint, isUntilBreakpoint } from '@theme/breakpoints';

if (isFromBreakpoint('large')) {
  alert("We've passed the large breakpoint");
}

if (isUntilBreakpoint('medium')) {
  alert("We're not quite at the medium breakpoint yet");
}
```

In CSS, there are some VSCode snippets to quickly write media queries with these breakpoints. See [.vscode/css.code-snippets](/.vscode/css.code-snippets).
