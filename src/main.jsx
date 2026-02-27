import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { CartProvider } from './Ecommerce/context/cartContext';
import { AuthProvider } from './auth/authContext';
import { EcommerceApp } from './EcommerceApp';
import { StoreSettingsProvider } from './Ecommerce/context/storeSettingsContext';
import { WishlistProvider } from './Ecommerce/wishlist/wishlistContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <StoreSettingsProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <WishlistProvider>
                <EcommerceApp />
              </WishlistProvider>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </StoreSettingsProvider>
    </HelmetProvider>
  </StrictMode>
);
