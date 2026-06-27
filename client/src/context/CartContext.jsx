import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setItems(res.data);
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (variant_id, quantity = 1) => {
    const res = await api.post('/cart', { variant_id, quantity });
    await fetchCart();
    return res.data;
  };

  const updateQuantity = async (id, quantity) => {
    await api.put(`/cart/${id}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (id) => {
    await api.delete(`/cart/${id}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.variant?.product?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, totalItems, totalPrice, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
