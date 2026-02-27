// CartContext.js
import React, { createContext, useEffect, useState } from "react";

export const CartContext = createContext({
  cart: [],
  showCart: false,
  setShowCart: () => {},
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

const buildCartItemId = (item = {}) => {
  if (item.id) return String(item.id);

  const productId = String(item.productId || "").trim();
  const sizeId = String(item.sizeId || item.size || "").trim();

  if (productId && sizeId) return `${productId}-${sizeId}`;
  if (productId) return productId;
  return "";
};

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const id = buildCartItemId(item);
      if (!id) return null;

      const qty = Number.parseInt(item?.quantity, 10);
      return {
        ...item,
        id,
        quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      };
    })
    .filter(Boolean);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? normalizeCartItems(JSON.parse(savedCart)) : [];
    } catch {
      return [];
    }
  });

  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem) => {
    const normalizedItem = {
      ...newItem,
      id: buildCartItemId(newItem),
    };

    if (!normalizedItem.id) return;

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === normalizedItem.productId && item.size === normalizedItem.size
      );

      if (existing) {
        const nextQty = Number.parseInt(normalizedItem.quantity, 10);
        const increment = Number.isFinite(nextQty) && nextQty > 0 ? nextQty : 1;
        return prev.map((item) =>
          item.productId === normalizedItem.productId && item.size === normalizedItem.size
            ? { ...item, quantity: item.quantity + increment }
            : item
        );
      }

      const initQty = Number.parseInt(normalizedItem.quantity, 10);
      return [
        ...prev,
        {
          ...normalizedItem,
          quantity: Number.isFinite(initQty) && initQty > 0 ? initQty : 1,
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    const normalizedId = String(id || "").trim();
    const parsed = Number.parseInt(quantity, 10);

    if (!normalizedId) return;
    if (!Number.isFinite(parsed) || parsed < 1) return;

    setCart((prev) =>
      prev.map((item) => (item.id === normalizedId ? { ...item, quantity: parsed } : item))
    );
  };

  const removeFromCart = (id) => {
    const normalizedId = String(id || "").trim();
    if (!normalizedId) return;
    setCart((prev) => prev.filter((item) => item.id !== normalizedId));
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
        showCart,
        setShowCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
