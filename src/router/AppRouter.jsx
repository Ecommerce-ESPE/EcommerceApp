import { Routes, Route, Navigate } from "react-router-dom";
import { HomeComponent } from "../Ecommerce/pages/Home/home";
import { NavbarComponent } from '../shared';
import { CatalogoComponent } from "../Ecommerce/pages/catalogo/catalogo";
import { Checkout } from "../Ecommerce/pages/checkout/checkout";
import { CartShop } from '../Ecommerce/components/carshop';
import { useContext } from 'react';
import { CartContext } from '../Ecommerce/context/cartContext';

export const AppRouter = () => {
  const context = useContext(CartContext);
  
  // Valores por defecto si el contexto no está disponible
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
        <Route path="catalogo" element={<CatalogoComponent />} />
        <Route path="checkout" element={<Checkout />} />
      </Routes>
    </>
  );
};