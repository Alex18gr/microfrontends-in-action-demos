/**
 * Centralized event bus utilities for cross-component communication.
 * All events are dispatched on the window object to ensure loose coupling.
 *
 * Communication conventions:
 * - Event payloads are passed in event.detail
 * - Use the exported EventNames constants to avoid typos
 * - Use on() to subscribe and off() to unsubscribe
 * - Use emit() to dispatch a CustomEvent with typed detail
 *
 * @module EventBus
 */

/** @typedef {import('./types').Product} Product */

/**
 * Event name constants to prevent typos across teams.
 */
export const EventNames = Object.freeze({
  PRODUCT_SEARCH: 'product-search',
  ADD_TO_CART: 'add-to-cart',
  CART_UPDATED: 'cart-updated',
  CHECKOUT_COMPLETE: 'checkout-complete'
});

/**
 * Subscribe to an event on window.
 * @template T
 * @param {keyof typeof EventNames | string} eventName
 * @param {(event: CustomEvent<T>) => void} handler
 */
export function on(eventName, handler) {
  window.addEventListener(eventName, /** @param {Event} e */ (e) => {
    // Guard in case of non-CustomEvent
    if (e instanceof CustomEvent) {
      // @ts-ignore - handler typed to CustomEvent<T>
      handler(e);
    }
  });
}

/**
 * Unsubscribe from an event on window.
 * @template T
 * @param {keyof typeof EventNames | string} eventName
 * @param {(event: CustomEvent<T>) => void} handler
 */
export function off(eventName, handler) {
  // The same function reference must be provided to remove the listener.
  window.removeEventListener(eventName, handler);
}

/**
 * Dispatch a typed CustomEvent on window.
 * @template T
 * @param {keyof typeof EventNames | string} eventName
 * @param {T} detail
 * @param {boolean} [bubbles=true]
 * @param {boolean} [composed=true]
 */
export function emit(eventName, detail, bubbles = true, composed = true) {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles,
    composed
  });
  window.dispatchEvent(event);
}

/**
 * JSDoc Documentation of event payloads:
 *
 * Event: product-search
 * detail: {
 *   query: string
 * }
 * Description: Emitted by <product-search> on input (debounced). All components may listen.
 *
 * Event: add-to-cart
 * detail: {
 *   id: string,
 *   name: string,
 *   price: number,
 *   image: string,
 *   initialStock: number
 * }
 * Description: Emitted by <product-card> when user clicks Add to Cart. Cart listens and updates its state.
 *
 * Event: cart-updated
 * detail: {
 *   items: Array<{ id: string, name: string, price: number, qty: number, image: string, initialStock: number }>,
 *   count: number,
 *   subtotal: number,
 *   tax: number,
 *   total: number
 * }
 * Description: Emitted by <shopping-cart> whenever its internal state changes. Optional for analytics.
 *
 * Event: checkout-complete
 * detail: {
 *   orderId: string,
 *   items: Array<{ id: string, name: string, price: number, qty: number }>,
 *   total: number,
 *   timestamp: string
 * }
 * Description: Emitted by <shopping-cart> after successful checkout animation.
 */
