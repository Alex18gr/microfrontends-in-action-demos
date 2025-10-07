import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStore } from './store';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    getStore().then((store) => {
      const update = () => {
        if (!id) return;
        setProduct(store.getProductById(id));
      };
      update();
      unsub = store.subscribe(update);
    });
    return () => { unsub?.(); };
  }, [id]);

  const add = async () => {
    if (!id) return;
    const store = await getStore();
    store.addToCart(id, 1);
  };

  if (!product) return <div>Product not found.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div>
        <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: 12, border: '1px solid #1e2a4a' }} />
      </div>
      <div>
        <h2 style={{ marginTop: 0 }}>{product.name}</h2>
        <div style={{ opacity: .85, marginBottom: 12 }}>{product.description}</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>${product.price.toFixed(2)}</div>
        <button className="btn" onClick={add}>Add to cart</button>
      </div>
    </div>
  );
}
