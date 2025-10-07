import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStore } from './store';

export default function ProductCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    let unsub: (() => void) | null = null;
    getStore().then((store) => {
      const update = () => setProducts(store.getSnapshot().products);
      update();
      unsub = store.subscribe(update);
    });
    return () => { unsub?.(); };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => p.name.toLowerCase().includes(s));
  }, [products, q]);

  const add = async (id: string) => {
    const store = await getStore();
    store.addToCart(id, 1);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
        <span style={{ opacity: .7, fontSize: 12 }}>{filtered.length} items</span>
      </div>
      <div className="grid">
        {filtered.map((p) => (
          <div key={p.id} className="card">
            <img src={p.image} alt={p.name} />
            <div className="body">
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
              <div style={{ opacity: .8, marginBottom: 8 }}>${p.price.toFixed(2)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => add(p.id)}>Add to cart</button>
                <Link className="btn" to={`/product/${p.id}`}>Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
