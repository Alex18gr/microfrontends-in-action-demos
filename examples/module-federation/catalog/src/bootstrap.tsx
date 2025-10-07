import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductCatalog from './ProductCatalog';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <div className="standalone">
      <h2>Catalog Microfrontend (Standalone)</h2>
      <ProductCatalog />
    </div>
  );
}
