export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

export type CartItem = {
  productId: string;
  qty: number;
};

export type Order = {
  id: string;
  date: string;
  total: number;
  items: CartItem[];
};

export type Notification = {
  id: string;
  message: string;
  read: boolean;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type StoreState = {
  products: Product[];
  cart: { items: CartItem[] };
  orders: Order[];
  user: User | null;
  notifications: Notification[];
};

export type StoreAPI = {
  getSnapshot: () => StoreState;
  subscribe: (listener: () => void) => () => void;
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string, qty?: number) => void;
  clearCart: () => void;
  completeOrder: () => void;
  getProductById: (id: string) => Product | undefined;
  logout: () => void;
  loginMock: () => void;
};
