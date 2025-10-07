import type { StoreAPI, StoreState, Product } from '../../host/src/types';

async function getHostStore(): Promise<StoreAPI | null> {
  try {
    const mod = await import('host/store');
    return mod.default as StoreAPI;
  } catch (e) {
    return null;
  }
}

// fallback local (standalone mode)
const fallbackProducts: Product[] = Array.from({ length: 4 }).map((_, i) => ({
  id: String(i + 1),
  name: `Local Product ${i + 1}`,
  price: 12.5 + i * 3,
  image: `https://picsum.photos/seed/cart${i}/300/200`,
  description: 'Local product for standalone mode'
}));

let localState: StoreState = {
  products: fallbackProducts,
  cart: { items: [{ productId: '1', qty: 1 }, { productId: '2', qty: 2 }] },
  orders: [
    { id: '2001', date: '2025-08-01', total: 39.99, items: [{ productId: '1', qty: 1 }] },
    { id: '2002', date: '2025-08-18', total: 59.49, items: [{ productId: '2', qty: 2 }] },
    { id: '2003', date: '2025-09-10', total: 22.0, items: [{ productId: '3', qty: 1 }] }
  ],
  user: { id: 'u-local', name: 'Standalone User', avatar: 'https://i.pravatar.cc/100?img=5' },
  notifications: []
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

const fallbackStore: StoreAPI = {
  getSnapshot: () => localState,
  subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  addToCart: (pid, qty = 1) => {
    const it = localState.cart.items.find((i) => i.productId === pid);
    if (it) it.qty += qty; else localState.cart.items.push({ productId: pid, qty });
    notify();
  },
  removeFromCart: (pid, qty = 1) => {
    localState.cart.items = localState.cart.items
      .map((i) => (i.productId === pid ? { ...i, qty: i.qty - qty } : i))
      .filter((i) => i.qty > 0);
    notify();
  },
  clearCart: () => { localState.cart.items = []; notify(); },
  completeOrder: () => {
    if (!localState.cart.items.length) return;
    const total = localState.cart.items.reduce((sum, it) => {
      const p = localState.products.find((x) => x.id === it.productId);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
    const newOrderId = String(2000 + localState.orders.length + 1);
    localState.orders = [
      { id: newOrderId, date: new Date().toISOString().slice(0, 10), total: Number(total.toFixed(2)), items: localState.cart.items.map((i) => ({ ...i })) },
      ...localState.orders
    ];
    localState.cart.items = [];
    notify();
  },
  getProductById: (id) => localState.products.find((p) => p.id === id),
  logout: () => { localState.user = null as any; notify(); },
  loginMock: () => { localState.user = { id: 'u-local', name: 'Standalone User', avatar: 'https://i.pravatar.cc/100?img=5' }; notify(); }
};

let cached: StoreAPI | null = null;
export async function getStore(): Promise<StoreAPI> {
  if (cached) return cached;
  const hostStore = await getHostStore();
  cached = hostStore ?? fallbackStore;
  return cached;
}
