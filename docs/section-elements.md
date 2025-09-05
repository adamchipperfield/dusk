# Section elements

The theme has built-in support for handling [Section Rendering API](https://shopify.dev/docs/api/ajax/section-rendering) responses. Instead of replacing entire sections you can define elements which automatically refresh when an updated section has been published.

For example, you may want to update a cart counter in the header when a product has been added to the cart:

1. Get a Section Rendering API response using the `sections` property:

```js
const { sections } = await json(
  fetch(`${theme.routes.cart_add_url}.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [],
      sections: ['header', 'cart-drawer'],
    }),
  }),
);
```

2. Publish the updated sections:

```js
publish(events.sectionUpdate, {
  sections,
});
```

3. Give the element a name and connect it to a section:

```js
<div data-section="header" data-section-element="cart-count">
  {{ cart.item_count }}
</div>
```
