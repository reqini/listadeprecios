import React, { createContext, useContext, useEffect, useState } from "react";
import { calculateCartTotalWithDiscounts } from "../utils/rouletteHelpers";

const CART_STORAGE_KEY = "cart:v1";

const CartContext = createContext(null);

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignorar errores de localStorage (cuota llena, modo privado, etc.)
    }
  }, [cart]);

  // Agrega un producto (con cuota ya resuelta por el catálogo que llama) o
  // incrementa su cantidad si ya está en el carrito, por `codigo`.
  const addItem = (productWithCuota) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.codigo === productWithCuota.codigo
      );

      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          cantidad: (updatedCart[existingIndex].cantidad || 1) + 1,
          selectedCuotaKey: updatedCart[existingIndex].selectedCuotaKey || productWithCuota.selectedCuotaKey,
          selectedCuotaValue: updatedCart[existingIndex].selectedCuotaValue || productWithCuota.selectedCuotaValue,
          selectedCuotaLabel: updatedCart[existingIndex].selectedCuotaLabel || productWithCuota.selectedCuotaLabel,
        };
        return updatedCart;
      }

      return [...prevCart, { ...productWithCuota, cantidad: productWithCuota.cantidad || 1 }];
    });
  };

  const removeItem = (codigo) => {
    setCart((prev) => prev.filter((item) => item.codigo !== codigo));
  };

  const updateQuantity = (codigo, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      removeItem(codigo);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.codigo === codigo ? { ...item, cantidad: nuevaCantidad } : item))
    );
  };

  const clearCart = () => setCart([]);

  const total = calculateCartTotalWithDiscounts(cart);

  return (
    <CartContext.Provider
      // setCart crudo se expone para casos que operan sobre el array completo
      // (ej. aplicar descuento/regalo de la ruleta vía rouletteHelpers).
      value={{ cart, setCart, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
