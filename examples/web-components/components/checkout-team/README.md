Checkout Team — <shopping-cart>

Overview
A sticky sidebar shopping cart that listens to add-to-cart events, manages item quantities, and calculates totals with a 10% tax. Emits checkout-complete after a successful checkout animation.

Tag
- `<shopping-cart>`

Events (listened)
- add-to-cart (CustomEvent<{ id: string, name: string, price: number, image: string, initialStock: number }>) — adds or increments an item, capped by initialStock

Events (emitted)
- cart-updated (CustomEvent<{ items, count, subtotal, tax, total }>) — optional, for analytics/telemetry
- checkout-complete (CustomEvent<{ orderId, items, total, timestamp }>) — after successful checkout

State & behavior
- Items are keyed by product id
- Quantity controls (+/−) with max enforced by initialStock
- Remove button to drop an item entirely
- Empty state message when no items
- Cart badge shows current item count
- No persistence; state lives within the component

Usage
```html
<script type="module" src="./components/checkout-team/shopping-cart.js"></script>
<shopping-cart></shopping-cart>
```

Design
- Semi-translucent sticky panel with blur, matching the app’s gradient theme
- Smooth transitions on item list and totals updates
- Subtle loading state and success indicator on checkout
