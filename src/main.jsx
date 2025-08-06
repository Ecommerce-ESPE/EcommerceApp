import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './Ecommerce/context/cartContext';
import { AuthProvider } from './auth/authContext'; // Asegúrate que la ruta esté correcta
import { EcommerceApp } from './EcommerceApp';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <EcommerceApp />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
