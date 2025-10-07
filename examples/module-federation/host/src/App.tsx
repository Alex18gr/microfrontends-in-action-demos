import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useStore } from './state/store';

const Header = lazy(() => import('header/Header'));
const ProductCatalog = lazy(() => import('catalog/ProductCatalog'));
const ProductDetails = lazy(() => import('details/ProductDetails'));
const CartWidget = lazy(() => import('cartorders/CartWidget'));
const OrderHistory = lazy(() => import('cartorders/OrderHistory'));

export default function App() {
  const cartCount = useStore((s) => s.cart.items.reduce((n, it) => n + it.qty, 0));

  return (
    <div>
      <header>
        <Suspense fallback={<div style={{ padding: 8 }}>Loading header…</div>}>
          <Header />
        </Suspense>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">E-Comm Dashboard</div>
          <div style={{ marginTop: 20 }}>
            <Suspense fallback={<div>Loading cart…</div>}>
              <CartWidget />
            </Suspense>
            <div style={{ marginTop: 8, fontSize: 12, color: '#9fb2d8' }}>
              Items in cart: {cartCount}
            </div>
          </div>
        </aside>
        <main className="main">
          <Suspense fallback={<div>Loading page…</div>}>
            <Routes>
              <Route path="/" element={<div>Welcome to the E-Comm Dashboard. Use the navigation to explore.</div>} />
              <Route path="/catalog" element={<ProductCatalog />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/orders" element={<OrderHistory />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
