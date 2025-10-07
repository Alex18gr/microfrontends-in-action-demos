import type { StoreAPI, StoreState } from '../../host/src/types';

async function getHostStore(): Promise<StoreAPI | null> {
  try {
    const mod = await import('host/store');
    return mod.default as StoreAPI;
  } catch (e) {
    return null;
  }
}

let localState: StoreState = {
  products: [
    { id: '1', name: 'Local Product 1', price: 12.99, image: 'https://picsum.photos/seed/d1/600/320', description: 'Local details product' }
  ],
  cart: { items: [] },
  orders: [],
  user: null,
  notifications: []
};
const listeners = new Set<() => void>();
const fallbackStore: StoreAPI = {
  getSnapshot: () => localState,
  subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  addToCart: (pid, qty=1) => { const it = localState.cart.items.find(i=>i.productId===pid); if (it) it.qty+=qty; else localState.cart.items.push({productId:pid, qty}); listeners.forEach((l)=>l()); },
  removeFromCart: (pid, qty=1) => { localState.cart.items = localState.cart.items.map(i=> i.productId===pid?{...i, qty: i.qty-qty}:i).filter(i=>i.qty>0); listeners.forEach((l)=>l()); },
  clearCart: () => { localState.cart.items = []; listeners.forEach((l)=>l()); },
  completeOrder: () => {},
  getProductById: (id) => localState.products.find(p=>p.id===id),
  logout: () => {},
  loginMock: () => {}
};

let cached: StoreAPI | null = null;
export async function getStore(): Promise<StoreAPI> {
  if (cached) return cached;
  const hostStore = await getHostStore();
  cached = hostStore ?? fallbackStore;
  return cached;
}
