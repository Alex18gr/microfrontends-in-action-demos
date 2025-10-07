Search Team — <product-search>

Overview
A real-time search component that emits debounced product-search CustomEvents on the window object. Designed for accessibility and modern UI.

Tag
- `<product-search>`

Attributes
- delay: number (optional, default 300) — debounce delay in milliseconds

Events
- product-search (CustomEvent<{ query: string }>): fired on user input after the debounce delay

Usage
```html
<script type="module" src="./components/search-team/product-search.js"></script>
<product-search delay="300"></product-search>
```

Listen for events
```html
<script type="module">
  window.addEventListener('product-search', (e) => {
    console.log('Query:', e.detail.query);
  });
</script>
```

Accessibility
- Includes an associated label for the input
- Uses semantic input[type=search]

Design
- Rounded pill input with subtle shadow
- Search icon and focus elevation
