// src/router/AppRouter.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { HomeComponent } from "../Ecommerce/pages/home/home";
import { NavbarComponent } from '../shared';
import { CatalogoComponent } from "../Ecommerce/pages/catalogo/catalogo";
import { Checkout } from "../Ecommerce/pages/checkout/Checkouts";
import { CartShop } from '../Ecommerce/components/carshop';
import { useContext, useEffect } from 'react';
import { CartContext } from '../Ecommerce/context/cartContext';
import ProductoDetalle from "../Ecommerce/pages/item/item";
import CatalogComponent from "../Ecommerce/pages/catalogo/CatalogComponent";
import { LoginPage } from "../auth/login/login";
import { useAuth } from "../auth/authContext";
import AccountDashboard from "../Ecommerce/account/AccountDashboard";
import {PageNotFound} from '../shared/index'; // Importamos la pagina 404
import { RegisterPage } from "../auth/register/register";
import PromoResolvePage from "../Ecommerce/pages/promo/PromoResolvePage";
import SearchPage from "../Ecommerce/pages/search/SearchPage";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirigir despues de 10 segundos
      const timer = setTimeout(() => navigate('/login'), 10000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <PageNotFound />;
};

export const AppRouter = () => {
  const context = useContext(CartContext);
  
  const showCart = context?.showCart || false;
  const setShowCart = context?.setShowCart || (() => {});

  return (
    <>
      <NavbarComponent />
      <CartShop 
        showCart={showCart}
        setShowCart={setShowCart}
      />
      <Routes>
        <Route path="/" element={<Navigate to='/home' />} />
        <Route path="home" element={<HomeComponent />} />
        <Route path="shop/:section/:slug" element={<PromoResolvePage />} />
        <Route path="shop" element={<CatalogComponent />} />
        <Route path="buscar" element={<SearchPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="catalog" element={<CatalogComponent />} />
        <Route path="catalogo" element={<CatalogoComponent />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="producto/:id" element={<ProductoDetalle />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="wishlist"
          element={
            <PrivateRoute>
              <Navigate to="/account/wishlist" replace />
            </PrivateRoute>
          }
        />
        
        <Route 
          path="account/*" 
          element={
            <PrivateRoute>
              <AccountDashboard />
            </PrivateRoute>
          } 
        />
        <Route path="dashboard/*" element={<Navigate to="/account" replace />} />
        
        {/* Ruta para manejar todas las paginas no encontradas */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};
