// Adapter to obtain the host store when running under Module Federation, with a local fallback for standalone mode.
import type { StoreAPI, StoreState } from '../../host/src/types';

async function getHostStore(): Promise<StoreAPI | null> {
  try {
    const mod = await import('host/store');
    return mod.default as StoreAPI;
  } catch (e) {
    return null;
  }
}

// very small local fallback store for standalone dev
let localState: StoreState = {
  products: [
    { id: '1', name: 'Local Product', price: 19.99, image: 'https://picsum.photos/seed/local/300/200', description: 'Local product for standalone mode' }
  ],
  cart: { items: [] },
  orders: [],
  user: { id: 'u-local', name: 'Standalone User', avatar: 'https://i.pravatar.cc/100?img=5' },
  notifications: [{ id: 'n-local', message: 'Welcome to standalone header', read: false }]
};

const listeners = new Set<() => void>();
const fallbackStore: StoreAPI = {
  getSnapshot: () => localState,
  subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  addToCart: (pid) => { localState = { ...localState, cart: { items: [{ productId: pid, qty: 1 }] } }; listeners.forEach((l)=>l()); },
  removeFromCart: (pid) => { localState = { ...localState, cart: { items: localState.cart.items.filter(i=>i.productId!==pid) } }; listeners.forEach((l)=>l()); },
  clearCart: () => { localState = { ...localState, cart: { items: [] } }; listeners.forEach((l)=>l()); },
  completeOrder: () => {},
  getProductById: (id) => localState.products.find(p=>p.id===id),
  logout: () => { localState = { ...localState, user: null }; listeners.forEach((l)=>l()); },
  loginMock: () => {}
};

let cached: StoreAPI | null = null;
export async function getStore(): Promise<StoreAPI> {
  if (cached) return cached;
  const hostStore = await getHostStore();
  cached = hostStore ?? fallbackStore;
  return cached;
}
