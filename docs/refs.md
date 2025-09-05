# Refs

Refs are a way of query selecting elements inside JavaScript. For example, in a carousel component you may want to reference a "next" button and add a click event listener to it.

Refs use the `data-ref` attribute, made up of the parent custom element's tag name, e.g. example carousel, and the unique ref identifier, e.g. next-button. For example:

```html
<example-carousel>
  <button
    class="button-reset"
    data-ref="example-carousel.next-button"
    type="button"
  >
    Next
  </button>
</example-carousel>
```

## Using refs
In any custom element using the `HTMLCustomElement` class, you can access the ref with `this.refs`:

```js
class MyElement extends HTMLCustomElement {
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    if (this.refs.nextButton) {
      alert('The next button exists')
    }
  }
}
```

You can also manually get all refs for an element using the `getRefs` utility function:

```js
import { getRefs } from '@theme/dom'

const { nextButton } = getRefs(document.querySelector('example-carousel'))
```

### Multiple refs

This system supports multiple refs of the same name, e.g. pagination buttons. Tag all of the refs with the same `data-ref` value and access the array of elements using the `all` property:

```js
this.refs.paginationButton.all.forEach((button) => {
  // do something with `button`
})
```

Accessing the ref property directly will return the first ref element in the document.

## Non-custom elements

By default, refs are built to work with custom elements. If you aren't using a custom element provide a second argument to `getRefs` defining a unique name:

```html
<div class="not-a-custom-element">
  <button
    class="button-reset"
    data-ref="example-carousel.next-button"
    type="button"
  >
    Next
  </button>
<div>

<script>
  const { nextButton } = getRefs(document.querySelector('div.not-a-custom-element'), 'example-carousel')
</script>
```
