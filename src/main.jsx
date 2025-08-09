import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './Ecommerce/context/cartContext';
import { AuthProvider } from './auth/authContext';
import { EcommerceApp } from './EcommerceApp';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <EcommerceApp />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
