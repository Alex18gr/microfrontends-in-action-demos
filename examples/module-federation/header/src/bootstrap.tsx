import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <div className="standalone">
        <h2>Header Microfrontend (Standalone)</h2>
        <Header />
      </div>
    </BrowserRouter>
  );
}
