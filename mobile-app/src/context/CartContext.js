import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const getKey = (id, weight) => `${id}-${weight || 'default'}`;

  const addItem = (product, quantity = 1, weight = null) => {
    setItems((prev) => {
      const key = getKey(product._id, weight);
      const exists = prev.find((i) => getKey(i._id, i.selectedWeight) === key);
      if (exists) {
        return prev.map((i) =>
          getKey(i._id, i.selectedWeight) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...product, quantity, selectedWeight: weight }];
    });
  };

  const removeItem = (id, weight) => {
    setItems((prev) => prev.filter((i) => getKey(i._id, i.selectedWeight) !== getKey(id, weight)));
  };

  const updateQty = (id, weight, qty) => {
    if (qty <= 0) { removeItem(id, weight); return; }
    setItems((prev) =>
      prev.map((i) =>
        getKey(i._id, i.selectedWeight) === getKey(id, weight) ? { ...i, quantity: qty } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const { subtotal, itemCount } = useMemo(() => ({
    subtotal: items.reduce((s, i) => s + (i.discountPrice || i.price) * i.quantity, 0),
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
  }), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
