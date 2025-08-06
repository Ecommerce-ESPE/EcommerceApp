// CartContext.js
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext({
  cart: [],
  showCart: false,
  setShowCart: () => {},
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [showCart, setShowCart] = useState(false); // Estado para mostrar el carrito

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem) => {
  setCart((prev) => {
    const existing = prev.find(
      (item) =>
        item.productId === newItem.productId &&
        item.size === newItem.size // ← usamos 'size' como variante
    );

    if (existing) {
      return prev.map((item) =>
        item.productId === newItem.productId &&
        item.size === newItem.size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...prev, newItem];
  });
};


  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        showCart, // <-- Añadimos
        setShowCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
