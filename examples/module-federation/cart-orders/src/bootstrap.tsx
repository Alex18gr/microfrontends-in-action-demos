import React from 'react';
import { createRoot } from 'react-dom/client';
import CartWidget from './CartWidget';
import OrderHistory from './OrderHistory';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <div className="standalone" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
      <div>
        <h2>Cart & Orders (Standalone)</h2>
        <CartWidget />
      </div>
      <div>
        <OrderHistory />
      </div>
    </div>
  );
}
