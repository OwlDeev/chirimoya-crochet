// src/context/CartContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

// Crear el contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto del carrito
export function useCart() {
  return useContext(CartContext);
}

// Proveedor del contexto
export function CartProvider({ children }) {
  const [isCartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  // Obtener el carrito desde localStorage al inicio
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

    // Consolidar productos con el mismo ID
    const consolidatedCart = storedCart.reduce((acc, product) => {
      const existingProduct = acc.find((item) => item.id === product.id);

      if (existingProduct) {
        // Si el producto ya existe, sumar la cantidad
        existingProduct.quantity += product.quantity;
      } else {
        // Si no existe, agregarlo al acumulador
        acc.push({ ...product });
      }

      return acc;
    }, []);

    setCart(consolidatedCart);
  }, []);

  // Función para agregar un producto al carrito
  const addToCartInvited = () => {
    const storedCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

    // Consolidar productos con el mismo ID
    const consolidatedCart = storedCart.reduce((acc, product) => {
      const existingProduct = acc.find((item) => item.id === product.id);

      if (existingProduct) {
        // Si el producto ya existe, sumar la cantidad
        existingProduct.quantity += product.quantity;
      } else {
        // Si no existe, agregarlo al acumulador
        acc.push({ ...product });
      }

      return acc;
    }, []);

    setCart(consolidatedCart);
  };

  // Contar los productos en el carrito
  const productCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleCart = () => setCartOpen(!isCartOpen);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        toggleCart,
        openCart,
        closeCart,
        cart,
        productCount,
        addToCartInvited,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
