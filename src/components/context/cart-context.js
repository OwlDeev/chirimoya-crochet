// src/context/CartContext.js
import useState from "react-usestateref";
import React, { createContext, useContext, useEffect } from "react";

// Crear el contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto del carrito
export function useCart() {
  return useContext(CartContext);
}

// Proveedor del contexto
export function CartProvider({ children }) {
  const [isCartOpen, setCartOpen] = useState(false);
  const [cart, setCart, refCart] = useState([]);

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
  let productCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    productCount =
      refCart.current.length > 0
        ? cart.reduce((total, item) => total + item.quantity, 0)
        : 0;
  }, [cart]);

  const toggleCart = () => setCartOpen(!isCartOpen);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);
  const cleanCart = () => setCart([]);
  console.log("Carrito después de limpiar:", cart);
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
        cleanCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
