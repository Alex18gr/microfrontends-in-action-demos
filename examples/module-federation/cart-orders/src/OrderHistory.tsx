import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStore } from './store';

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    getStore().then((store) => {
      const update = () => {
        const snap = store.getSnapshot();
        setOrders(snap.orders);
        setProducts(snap.products);
      };
      update();
      unsub = store.subscribe(update);
    });
    return () => { unsub?.(); };
  }, []);

  const enriched = useMemo(() => orders.map((o) => ({
    ...o,
    items: o.items.map((it: any) => ({
      ...it,
      product: products.find((p) => p.id === it.productId)
    }))
  })), [orders, products]);

  return (
    <div className="order-history">
      <h3 style={{ margin: '8px 0 12px' }}>Order History</h3>
      {enriched.length === 0 ? (
        <div style={{ opacity: .7 }}>No past orders</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {enriched.map((o) => (
            <div key={o.id} className="card">
              <div className="body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <strong>Order #{o.id}</strong>
                    <div style={{ fontSize: 12, opacity: .7 }}>Date: {o.date}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>${o.total.toFixed(2)}</div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {o.items.map((it: any, idx: number) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {it.product && <img src={it.product.image} alt={it.product.name} style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }} />}
                        <span>{it.product?.name ?? it.productId}</span>
                        <span style={{ opacity: .7 }}>x{it.qty}</span>
                      </div>
                      <div>
                        <Link className="btn" to={`/product/${it.productId}`}>View details</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
