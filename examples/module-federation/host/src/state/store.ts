import { useSyncExternalStore } from 'react';
import type { CartItem, StoreAPI, StoreState, Product, Order } from '../types';

function generateProducts(): Product[] {
  const products: Product[] = [];
  for (let i = 1; i <= 12; i++) {
    products.push({
      id: String(i),
      name: `Product ${i}`,
      price: Number((10 + i * 2.5).toFixed(2)),
      image: `https://picsum.photos/seed/p${i}/300/200`,
      description: `This is a great product number ${i} with awesome features and premium quality.`
    });
  }
  return products;
}

let state: StoreState = {
  products: generateProducts(),
  cart: { items: [] },
  orders: [
    { id: '1001', date: '2024-12-04', total: 89.97, items: [{ productId: '1', qty: 1 }, { productId: '2', qty: 2 }] },
    { id: '1002', date: '2025-01-18', total: 59.99, items: [{ productId: '3', qty: 1 }] },
    { id: '1003', date: '2025-08-02', total: 129.5, items: [{ productId: '4', qty: 3 }, { productId: '5', qty: 1 }] }
  ],
  user: { id: 'u1', name: 'Alex C', avatar: 'https://i.pravatar.cc/100?img=12' },
  notifications: [
    { id: 'n1', message: 'Your order #1003 has shipped', read: false },
    { id: 'n2', message: 'New discount on Product 7', read: true }
  ]
};

const listeners = new Set<() => void>();

function setState(partial: Partial<StoreState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, it) => {
    const p = state.products.find((x) => x.id === it.productId);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
}

const api: StoreAPI = {
  getSnapshot: () => state,
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  addToCart: (productId: string, qty = 1) => {
    const items = [...state.cart.items];
    const idx = items.findIndex((i) => i.productId === productId);
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    else items.push({ productId, qty });
    setState({ cart: { items } });
  },
  removeFromCart: (productId: string, qty = 1) => {
    const items = state.cart.items
      .map((i) => (i.productId === productId ? { ...i, qty: i.qty - qty } : i))
      .filter((i) => i.qty > 0);
    setState({ cart: { items } });
  },
  clearCart: () => setState({ cart: { items: [] } }),
  completeOrder: () => {
    const items = state.cart.items;
    if (!items.length) return;
    const total = Number(calcTotal(items).toFixed(2));
    const newOrder: Order = {
      id: String(1000 + state.orders.length + 1),
      date: new Date().toISOString().slice(0, 10),
      total,
      items: items.map((i) => ({ ...i }))
    };
    setState({ orders: [newOrder, ...state.orders], cart: { items: [] } });
  },
  getProductById: (id: string) => state.products.find((p) => p.id === id),
  logout: () => setState({ user: null }),
  loginMock: () => setState({ user: { id: 'u1', name: 'Alex C', avatar: 'https://i.pravatar.cc/100?img=12' } })
};

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(api.subscribe, () => selector(api.getSnapshot()));
}

export default api;
