# Custom elements

[Custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) are used heavily throughout the theme and are highly encouraged for performance and code reusability.

## The "HTMLCustomElement" class

The theme includes a custom class which comes with helpful utitilies. To use it, extend your custom elements from the [`HTMLCustomElement` class](/assets/html-custom-element.js):

```js
import { HTMLCustomElement } from '@theme/html-custom-element';

class MyElement extends HTMLCustomElement {
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.on('click', this.refs.button, () => {
      // handle the click event
    })
  }
}

if (!customElements.get('my-element')) customElements.define('my-element', MyElement);
```

### Properties

| Name | Description |
| --- | --- |
| refs | The scoped refs, see [Refs](/docs/refs.md) |
| requiredAttributes | Defines the attribute names required or an error will throw |
| requiredRefs | Defines the refs required or an error will throw, see [Refs](/docs/refs.md) |

### Methods

| Name | Description |
| --- | --- |
| on | Creates an event listener which is removed when the custom element is disconnected |
| subscribe | Creates an event bus listener which is removed when the custom element is disconnected |
| resetRefs | Resets the ref query selectors, see [Refs](/docs/refs.md) |
