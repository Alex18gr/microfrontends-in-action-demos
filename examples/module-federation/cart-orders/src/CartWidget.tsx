import React, { useEffect, useMemo, useState } from 'react';
import { getStore } from './store';

export default function CartWidget() {
  const [cartItems, setCartItems] = useState<{ productId: string; qty: number }[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    getStore().then((store) => {
      const update = () => {
        const snap = store.getSnapshot();
        setCartItems(snap.cart.items);
        setProducts(snap.products);
      };
      update();
      unsub = store.subscribe(update);
    });
    return () => { unsub?.(); };
  }, []);

  const count = useMemo(() => cartItems.reduce((sum, i) => sum + i.qty, 0), [cartItems]);
  const total = useMemo(() => {
    return cartItems.reduce((sum, it) => {
      const p = products.find((x) => x.id === it.productId);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
  }, [cartItems, products]);

  const remove = async (id: string) => {
    const store = await getStore();
    store.removeFromCart(id, 1);
  };

  const checkout = async () => {
    const ok = window.confirm('Are you sure you want to complete the order?');
    if (!ok) return;
    const store = await getStore();
    store.completeOrder();
  };

  return (
    <div className="cart-widget">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong>Cart</strong>
        <span>Items: {count}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        {cartItems.length === 0 ? (
          <div style={{ opacity: .7 }}>Cart is empty</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cartItems.map((it) => {
              const p = products.find((x) => x.id === it.productId);
              return (
                <li key={it.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 500 }}>{p?.name ?? it.productId}</span>
                    <span style={{ opacity: .7 }}>x{it.qty}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>${p ? (p.price * it.qty).toFixed(2) : '-'}</span>
                    <button className="btn" onClick={() => remove(it.productId)}>Remove</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, borderTop: '1px solid #eee', paddingTop: 8 }}>
        <span>Total:</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
      <button className="btn primary" disabled={cartItems.length === 0} onClick={checkout} style={{ width: '100%', marginTop: 8 }}>Complete Order</button>
    </div>
  );
}
