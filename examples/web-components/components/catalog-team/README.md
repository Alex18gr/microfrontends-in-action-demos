Catalog Team — <product-card>

Overview
A presentational product card component with stock awareness, search highlighting, and an Add to Cart interaction. Emits add-to-cart events.

Tag
- `<product-card>`

Attributes
- product-id: string (required)
- name: string (required)
- price: number (required)
- image: string (emoji or URL) (required)
- stock: number (required)
- description: string (optional)

Events
- add-to-cart (CustomEvent<{ id: string, name: string, price: number, image: string, initialStock: number }>)
- Listens for product-search (CustomEvent<{ query: string }>) to highlight and softly hide non-matching cards

Usage
```html
<script type="module" src="./components/catalog-team/product-card.js"></script>
<product-card
  product-id="p001"
  name="Wireless Headphones"
  price="99.99"
  image="🎧"
  stock="12"
  description="Over-ear Bluetooth headphones">
</product-card>
```

Listen for events
```js
window.addEventListener('add-to-cart', (e) => {
  console.log('Added:', e.detail);
});
```

States
- Disabled: when stock is 0, the Add button is disabled and badge shows "Out of stock"
- Loading: shortly after clicking Add to Cart to provide visual feedback

Design
- White card on gradient background
- Subtle hover elevation and pulse micro-interaction on add
- Stock badge color-coded: green (>5), orange (≤5), red (=0)
