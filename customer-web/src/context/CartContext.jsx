import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product, qty = 1, weight = null) => {
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id && i.selectedWeight === weight);
      if (exists) return prev.map((i) =>
        i._id === product._id && i.selectedWeight === weight
          ? { ...i, quantity: i.quantity + qty }
          : i
      );
      return [...prev, { ...product, quantity: qty, selectedWeight: weight }];
    });
  };

  const updateQty = (id, weight, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !(i._id === id && i.selectedWeight === weight)));
    } else {
      setItems((prev) => prev.map((i) =>
        i._id === id && i.selectedWeight === weight ? { ...i, quantity: qty } : i
      ));
    }
  };

  const removeItem = (id, weight) =>
    setItems((prev) => prev.filter((i) => !(i._id === id && i.selectedWeight === weight)));

  const clearCart = () => setItems([]);

  const { subtotal, itemCount } = useMemo(() => ({
    subtotal: items.reduce((s, i) => s + (i.discountPrice || i.price) * i.quantity, 0),
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
  }), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}
