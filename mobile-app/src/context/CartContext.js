import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext({});

const CART_KEY = 'slx_cart';
const getMax = (product) => Math.min(5, product?.stock > 0 ? product.stock : 5);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load cart from AsyncStorage on first mount
  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((data) => {
        if (data) setItems(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Persist cart to AsyncStorage whenever it changes (skip before initial load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  const getKey = (id, weight) => `${id}-${weight || 'default'}`;

  const addItem = (product, quantity = 1, weight = null) => {
    const max = getMax(product);
    setItems((prev) => {
      const key = getKey(product._id, weight);
      const exists = prev.find((i) => getKey(i._id, i.selectedWeight) === key);
      if (exists) {
        return prev.map((i) =>
          getKey(i._id, i.selectedWeight) === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, max) }
            : i
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, max), selectedWeight: weight }];
    });
  };

  const removeItem = (id, weight) => {
    setItems((prev) => prev.filter((i) => getKey(i._id, i.selectedWeight) !== getKey(id, weight)));
  };

  const updateQty = (id, weight, qty) => {
    if (qty <= 0) { removeItem(id, weight); return; }
    setItems((prev) =>
      prev.map((i) => {
        if (getKey(i._id, i.selectedWeight) !== getKey(id, weight)) return i;
        const max = getMax(i);
        return { ...i, quantity: Math.min(qty, max) };
      })
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
