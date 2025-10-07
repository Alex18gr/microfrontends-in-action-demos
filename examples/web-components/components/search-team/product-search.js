import { emit, EventNames } from '../shared/event-bus.js';

/**
 * <product-search>
 * A11y-friendly search input that emits debounced product-search events.
 */
class ProductSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    /** @private */ this._debounceTimer = null;
    /** @private */ this._delay = Number(this.getAttribute('delay')) || 300;
  }

  connectedCallback() {
    this.render();
  }

  /** @private */
  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .search {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 999px;
          box-shadow: var(--shadow-md);
          padding: 8px 12px;
          transition: box-shadow 200ms ease, transform 150ms ease;
        }
        .search:focus-within { box-shadow: var(--shadow-lg); transform: translateY(-1px); }
        .icon { font-size: 18px; color: var(--muted-600); margin-right: 8px; }
        input {
          width: 100%;
          border: none;
          outline: none;
          font: inherit;
          background: transparent;
          color: var(--text-900);
        }
        input::placeholder { color: var(--muted-500); }
        label { position: absolute; left: -9999px; }
      </style>
      <label for="q">Search products</label>
      <div class="search" role="search">
        <span class="icon" aria-hidden="true">🔎</span>
        <input id="q" type="search" placeholder="Search products…" autocomplete="off" />
      </div>
    `;

    const input = this.shadowRoot.querySelector('#q');
    if (input) {
      input.addEventListener('input', (e) => {
        const value = /** @type {HTMLInputElement} */ (e.target).value.trim();
        this._debounce(() => this._emitQuery(value));
      });
    }
  }

  /** @private */
  _emitQuery(query) {
    try {
      emit(EventNames.PRODUCT_SEARCH, { query });
      // console.log('[product-search] emitted', query);
    } catch (err) {
      console.error('Failed to emit product-search event', err);
    }
  }

  /** @private */
  _debounce(fn) {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._debounceTimer = null;
      fn();
    }, this._delay);
  }
}

customElements.define('product-search', ProductSearch);
