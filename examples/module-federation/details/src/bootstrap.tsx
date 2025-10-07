import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductDetails from './ProductDetails';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <div className="standalone">
      <h2>Product Details Microfrontend (Standalone)</h2>
      <MemoryRouter initialEntries={["/product/1"]}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
}
