import { on, emit, EventNames } from '../shared/event-bus.js';

/**
 * <product-card>
 * Displays a product with stock badge and an Add to Cart action.
 * Attributes: product-id, name, price, image, stock, description
 */
class ProductCard extends HTMLElement {
  static get observedAttributes() {
    return ['product-id', 'name', 'price', 'image', 'stock', 'description'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    /** @private */ this._stock = 0;
    /** @private */ this._initialStock = 0;
    /** @private */ this._loading = false;
    /** @private */ this._query = '';
    /** @private */ this._searchHandler = (e) => this._onSearch(e);
  }

  connectedCallback() {
    this._stock = Number(this.getAttribute('stock')) || 0;
    this._initialStock = this._stock;
    this.render();
    on(EventNames.PRODUCT_SEARCH, this._searchHandler);
  }

  disconnectedCallback() {
    // Best effort; off() requires the exact reference and event name
    window.removeEventListener(EventNames.PRODUCT_SEARCH, this._searchHandler);
  }

  attributeChangedCallback() {
    // Re-render on attribute changes
    if (this.isConnected) this.render();
  }

  /** @private */
  _onSearch(/** @type {CustomEvent<{query: string}>} */ e) {
    this._query = (e.detail?.query || '').toLowerCase();
    this._applyFilterAndHighlight();
  }

  /** @private */
  _applyFilterAndHighlight() {
    const root = this.shadowRoot;
    if (!root) return;
    const name = (this.getAttribute('name') || '');
    const desc = (this.getAttribute('description') || '');
    const q = this._query;

    const nameEl = root.querySelector('[data-name]');
    const descEl = root.querySelector('[data-desc]');
    const card = root.querySelector('.card');

    const matches = (text) => text.toLowerCase().includes(q);
    const highlight = (text) => {
      if (!q) return this._escapeHtml(text);
      const idx = text.toLowerCase().indexOf(q);
      if (idx === -1) return this._escapeHtml(text);
      const before = this._escapeHtml(text.slice(0, idx));
      const mid = this._escapeHtml(text.slice(idx, idx + q.length));
      const after = this._escapeHtml(text.slice(idx + q.length));
      return `${before}<mark>${mid}</mark>${after}`;
    };

    const isMatch = !q || matches(name) || matches(desc);
    if (card) {
      card.classList.toggle('hidden', !isMatch);
      card.classList.toggle('match', !!q && isMatch);
    }
    if (nameEl) nameEl.innerHTML = highlight(name);
    if (descEl) descEl.innerHTML = highlight(desc);
  }

  /** @private */
  _escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** @private */
  _formatPrice(n) {
    try { return Number(n).toFixed(2); } catch { return '--'; }
  }

  /** @private */
  _stockColor(stock) {
    if (stock <= 0) return 'var(--red-600)';
    if (stock <= 5) return 'var(--orange-500)';
    return 'var(--green-600)';
  }

  /** @private */
  async _onAddClick(btn) {
    if (this._loading || this._stock <= 0) return;
    this._loading = true;
    btn.disabled = true;
    btn.classList.add('loading');

    const payload = {
      id: this.getAttribute('product-id') || '',
      name: this.getAttribute('name') || '',
      price: Number(this.getAttribute('price')) || 0,
      image: this.getAttribute('image') || '',
      initialStock: this._initialStock
    };

    try {
      // Emit first for responsiveness
      emit(EventNames.ADD_TO_CART, payload);
      // Visual feedback delay
      await new Promise((res) => setTimeout(res, 350));
      // Decrease local stock and update
      this._stock = Math.max(0, this._stock - 1);
      this.setAttribute('stock', String(this._stock));
      this._updateStockBadge();
      this._toggleDisabledIfNeeded();
      // Micro interaction
      const card = this.shadowRoot?.querySelector('.card');
      card?.classList.add('pulse');
      setTimeout(() => card?.classList.remove('pulse'), 300);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      this._loading = false;
      btn.disabled = this._stock <= 0;
      btn.classList.remove('loading');
    }
  }

  /** @private */
  _updateStockBadge() {
    const badge = this.shadowRoot?.querySelector('.stock');
    if (!badge) return;
    const s = this._stock;
    badge.textContent = s <= 0 ? 'Out of stock' : s <= 5 ? `${s} left` : 'In stock';
    badge.setAttribute('style', `background:${this._stockBg(s)}; color:${this._stockFg(s)};`);
  }

  /** @private */
  _stockBg(s) {
    if (s <= 0) return 'var(--red-100)';
    if (s <= 5) return 'var(--orange-100)';
    return 'var(--green-100)';
  }

  /** @private */
  _stockFg(s) {
    if (s <= 0) return 'var(--red-700)';
    if (s <= 5) return 'var(--orange-700)';
    return 'var(--green-700)';
  }

  /** @private */
  _toggleDisabledIfNeeded() {
    const btn = this.shadowRoot?.querySelector('button.add');
    if (btn) {
      btn.disabled = this._stock <= 0;
    }
  }

  /** @private */
  render() {
    if (!this.shadowRoot) return;
    const name = this.getAttribute('name') || '';
    const price = this._formatPrice(this.getAttribute('price'));
    const image = this.getAttribute('image') || '';
    const desc = this.getAttribute('description') || '';
    this._stock = Number(this.getAttribute('stock')) || 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 8px;
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: var(--shadow-sm);
          transition: transform 150ms ease, box-shadow 200ms ease, opacity 200ms ease;
        }
        .card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .card.pulse { animation: pulse 300ms ease; }
        @keyframes pulse { from { transform: scale(1); } 50% { transform: scale(1.02); } to { transform: scale(1);} }
        .hidden { opacity: 0.2; filter: grayscale(0.3); pointer-events: none; }
        .match mark { background: #fff3; color: var(--primary-700); animation: highlight 600ms ease; }
        @keyframes highlight { from { background: #fff; } to { background: #fff3; } }
        .image { font-size: 48px; text-align: center; }
        .title { font-weight: 600; color: var(--text-900); min-height: 24px; }
        .desc { color: var(--muted-700); font-size: 14px; min-height: 36px; }
        .footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .price { font-weight: 700; color: var(--text-900); }
        .stock { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
        button.add {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
          color: white; border: none; border-radius: 8px;
          padding: 8px 12px; cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 120ms ease, opacity 200ms ease, box-shadow 200ms ease;
        }
        button.add:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
        button.add:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.2); }
        button.add.loading { position: relative; }
        button.add.loading::after {
          content: '';
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid #fff9; border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
      <div class="card">
        <div class="image" aria-hidden="true">${image}</div>
        <div class="title" data-name>${this._escapeHtml(name)}</div>
        <div class="desc" data-desc>${this._escapeHtml(desc)}</div>
        <div class="footer">
          <span class="price">$${price}</span>
          <span class="stock">--</span>
          <button class="add" aria-label="Add ${this._escapeHtml(name)} to cart">
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    `;

    const btn = this.shadowRoot.querySelector('button.add');
    btn?.addEventListener('click', () => this._onAddClick(/** @type {HTMLButtonElement} */(btn)));

    this._updateStockBadge();
    this._toggleDisabledIfNeeded();
    // Re-apply highlight after re-render
    this._applyFilterAndHighlight();
  }
}

customElements.define('product-card', ProductCard);
