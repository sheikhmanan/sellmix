import { createContext, useContext, useState, useMemo, useEffect } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

function loadCart() {
  try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const getMax = (product) => Math.min(5, product?.stock > 0 ? product.stock : 5);

  const addItem = (product, qty = 1, weight = null) => {
    const max = getMax(product);
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id && i.selectedWeight === weight);
      if (exists) return prev.map((i) =>
        i._id === product._id && i.selectedWeight === weight
          ? { ...i, quantity: Math.min(i.quantity + qty, max) }
          : i
      );
      return [...prev, { ...product, quantity: Math.min(qty, max), selectedWeight: weight }];
    });
  };

  const updateQty = (id, weight, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !(i._id === id && i.selectedWeight === weight)));
    } else {
      setItems((prev) => prev.map((i) => {
        if (!(i._id === id && i.selectedWeight === weight)) return i;
        return { ...i, quantity: Math.min(qty, getMax(i)) };
      }));
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
