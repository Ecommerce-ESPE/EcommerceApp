import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './Ecommerce/context/cartContext';
import { EcommerceApp } from './EcommerceApp';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <EcommerceApp />
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)