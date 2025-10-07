E-commerce Microfrontends (Web Components)

A multi-team e-commerce demo built with vanilla Web Components and CustomEvents for decoupled communication. This example demonstrates search, catalog, and checkout microfrontends collaborating via a simple event bus, without any framework or external dependencies.

Architecture

    +-------------------- ecommerce-microfrontends --------------------+
    |                                                                   |
    |  [Header]                 [Main]                                  |
    |   └─ <product-search>     ├─ Products Grid (catalog-team)         |
    |                           │   └─ <product-card>*                  |
    |                           └─ Sidebar Cart (checkout-team)         |
    |                               └─ <shopping-cart>                  |
    |                                                                   |
    |  Shared Event Bus: window CustomEvents (shared/event-bus.js)      |
    +-------------------------------------------------------------------+

Teams
- search-team: <product-search> emits product-search events with the query
- catalog-team: <product-card> renders products, highlights search matches, dispatches add-to-cart events
- checkout-team: <shopping-cart> listens for add-to-cart, manages quantities and totals, emits checkout-complete
- shared: event-bus utilities and event name constants

Communication
- All cross-component communication via CustomEvent on window
- Event payload is provided via event.detail
- Constants and helpers in components/shared/event-bus.js

Getting started
- Option 1 (Node >= 18):
  - From this folder, run: npx http-server -c-1 .  or  npx serve .
  - Open http://localhost:8080 (http-server) or the URL printed by serve
- Option 2 (VS Code):
  - Use the Live Server extension and open index.html
- Option 3 (Simple):
  - Double-click index.html to open it in a modern browser (some browsers restrict fetch from file://; prefer a local server)

Features
- Real-time search filtering with highlight animation
- Add to cart with visual feedback
- Stock management (decrease on add, disable when empty)
- Cart operations (add, remove, quantity change)
- Price calculations with 10% tax
- Checkout flow with success state
- Responsive layout for mobile/tablet/desktop
- Smooth animations for state changes and interactions
- Empty states for cart and no search results

Tech stack
- Vanilla Web Components (Custom Elements + Shadow DOM)
- ES Modules
- No external dependencies
