import { on, emit, EventNames } from '../shared/event-bus.js';

/**
 * <shopping-cart>
 * Listens to add-to-cart events and manages cart state.
 */
class ShoppingCart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    /** @private */ this._items = new Map(); // id -> {id, name, price, qty, image, initialStock}
  }

  connectedCallback() {
    this.render();
    on(EventNames.ADD_TO_CART, (e) => this._handleAdd(e));
  }

  /** @private */
  _handleAdd(/** @type {CustomEvent<{id:string,name:string,price:number,image:string,initialStock:number}>} */ e) {
    const p = e.detail;
    if (!p || !p.id) return;
    const existing = this._items.get(p.id);
    if (existing) {
      if (existing.qty < existing.initialStock) {
        existing.qty += 1;
      } else {
        this._toast('Max stock reached');
      }
    } else {
      this._items.set(p.id, { ...p, qty: 1 });
    }
    this._renderItems();
    this._emitCartUpdated();
  }

  /** @private */
  _emitCartUpdated() {
    const summary = this._summary();
    emit(EventNames.CART_UPDATED, summary);
  }

  /** @private */
  _summary() {
    const itemsArr = Array.from(this._items.values());
    const count = itemsArr.reduce((acc, i) => acc + i.qty, 0);
    const subtotal = itemsArr.reduce((acc, i) => acc + i.qty * i.price, 0);
    const tax = +(subtotal * 0.1).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    return { items: itemsArr, count, subtotal: +subtotal.toFixed(2), tax, total };
  }

  /** @private */
  _renderItems() {
    const list = this.shadowRoot?.querySelector('.items');
    const empty = this.shadowRoot?.querySelector('.empty');
    const badge = this.shadowRoot?.querySelector('.badge');
    if (!list || !empty || !badge) return;

    list.innerHTML = '';
    const { items, count, subtotal, tax, total } = this._summary();

    badge.textContent = String(count);
    badge.classList.toggle('hide', count === 0);

    if (items.length === 0) {
      empty.classList.remove('hide');
    } else {
      empty.classList.add('hide');
      for (const item of items) {
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = `
          <div class="iimg" aria-hidden="true">${item.image}</div>
          <div class="info">
            <div class="name">${this._escape(item.name)}</div>
            <div class="meta">$${item.price.toFixed(2)} • In cart: ${item.qty}/${item.initialStock}</div>
          </div>
          <div class="qty">
            <button class="dec" aria-label="Decrease quantity">−</button>
            <span class="q">${item.qty}</span>
            <button class="inc" aria-label="Increase quantity">+</button>
          </div>
          <div class="rm">
            <button class="remove" aria-label="Remove from cart">✕</button>
          </div>
        `;
        // Quantity handlers
        row.querySelector('.dec')?.addEventListener('click', () => {
          const it = this._items.get(item.id);
          if (!it) return;
          it.qty = Math.max(0, it.qty - 1);
          if (it.qty === 0) this._items.delete(item.id);
          this._renderItems();
          this._emitCartUpdated();
        });
        row.querySelector('.inc')?.addEventListener('click', () => {
          const it = this._items.get(item.id);
          if (!it) return;
          if (it.qty < it.initialStock) {
            it.qty += 1;
          } else {
            this._toast('Max stock reached');
          }
          this._renderItems();
          this._emitCartUpdated();
        });
        row.querySelector('.remove')?.addEventListener('click', () => {
          this._items.delete(item.id);
          this._renderItems();
          this._emitCartUpdated();
        });
        list.appendChild(row);
      }
    }

    // Update totals
    const subtotalEl = this.shadowRoot?.querySelector('.subtotal .val');
    const taxEl = this.shadowRoot?.querySelector('.tax .val');
    const totalEl = this.shadowRoot?.querySelector('.total .val');
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }

  /** @private */
  _escape(s) { return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  /** @private */
  _toast(msg) {
    const root = this.shadowRoot;
    const panel = root?.querySelector('.panel');
    if (!panel) return;
    let t = root.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      panel.appendChild(t);
    }
    t.textContent = String(msg);
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1400);
  }

  /** @private */
  async _checkout(btn) {
    if (this._items.size === 0) return;
    btn.classList.add('loading');
    btn.disabled = true;
    await new Promise((r) => setTimeout(r, 600));
    const payload = this._summary();
    // Simulate order id
    const orderId = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    emit(EventNames.CHECKOUT_COMPLETE, {
      orderId,
      items: payload.items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      total: payload.total,
      timestamp: new Date().toISOString()
    });
    // Success animation
    const success = this.shadowRoot?.querySelector('.success');
    success?.classList.remove('hide');
    success?.classList.add('show');
    await new Promise((r) => setTimeout(r, 1200));
    success?.classList.remove('show');
    success?.classList.add('hide');
    // Clear cart
    this._items.clear();
    this._renderItems();
    btn.classList.remove('loading');
    btn.disabled = false;
  }

  /** @private */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .panel {
          position: sticky; top: 16px;
          background: #ffffffcc; backdrop-filter: blur(8px);
          border-radius: 12px; padding: 16px; box-shadow: var(--shadow-md);
        }
        .title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-900); }
        .badge { background: var(--primary-100); color: var(--primary-700); border-radius: 999px; padding: 2px 8px; font-size: 12px; }
        .badge.hide { display: none; }
        .empty { color: var(--muted-700); text-align: center; padding: 24px 8px; }
        .empty.hide { display: none; }
        .items { display: grid; gap: 8px; margin-top: 8px; }
        .row { display: grid; grid-template-columns: 32px 1fr auto auto; align-items: center; gap: 8px; background: white; border-radius: 10px; padding: 8px; box-shadow: var(--shadow-sm); transition: transform 120ms ease; }
        .row:hover { transform: translateY(-1px); }
        .iimg { font-size: 20px; text-align: center; }
        .name { font-weight: 600; color: var(--text-900); }
        .meta { font-size: 12px; color: var(--muted-700); }
        .qty { display: inline-flex; align-items: center; gap: 6px; }
        .qty button { width: 28px; height: 28px; border-radius: 6px; border: none; background: var(--muted-100); color: var(--text-900); cursor: pointer; }
        .qty button:hover { background: var(--muted-200); }
        .rm button { border: none; background: transparent; color: var(--muted-600); cursor: pointer; font-size: 16px; }
        .rm button:hover { color: var(--red-600); }
        .totals { display: grid; gap: 6px; padding-top: 12px; border-top: 1px solid var(--muted-200); margin-top: 12px; }
        .line { display: flex; justify-content: space-between; color: var(--text-900); }
        .total { font-weight: 800; font-size: 18px; }
        .checkout { margin-top: 12px; display: flex; gap: 8px; align-items: center; }
        .checkout button {
          flex: 1; padding: 10px 12px; border-radius: 10px; border: none; color: white; cursor: pointer;
          background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
          box-shadow: var(--shadow-sm); transition: transform 120ms ease, box-shadow 200ms ease, opacity 200ms ease;
        }
        .checkout button:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .checkout button.loading { opacity: 0.7; }
        .success { display: none; color: var(--green-700); font-weight: 600; }
        .success.show { display: inline; animation: pop 300ms ease; }
        @keyframes pop { from { transform: scale(0.98); opacity:0; } to { transform: scale(1); opacity:1; } }
        .toast { position: absolute; right: 12px; bottom: 12px; background: #111a; color: #fff; padding: 6px 10px; border-radius: 8px; backdrop-filter: blur(6px); box-shadow: var(--shadow-sm); opacity: 0; transform: translateY(6px); transition: opacity 200ms ease, transform 200ms ease; }
        .toast.show { opacity: 1; transform: translateY(0); }
      </style>
      <div class="panel">
        <div class="title">Your Cart <span class="badge hide">0</span></div>
        <div class="empty">Your cart is empty. Add items to get started.</div>
        <div class="items"></div>
        <div class="totals">
          <div class="line subtotal"><span>Subtotal</span><span class="val">$0.00</span></div>
          <div class="line tax"><span>Tax (10%)</span><span class="val">$0.00</span></div>
          <div class="line total"><span>Total</span><span class="val">$0.00</span></div>
        </div>
        <div class="checkout">
          <button class="btn">Checkout</button>
          <span class="success hide">✅ Success!</span>
        </div>
      </div>
    `;

    this._renderItems();

    const btn = this.shadowRoot?.querySelector('.checkout .btn');
    btn?.addEventListener('click', () => this._checkout(/** @type {HTMLButtonElement} */(btn)));
  }
}

customElements.define('shopping-cart', ShoppingCart);
