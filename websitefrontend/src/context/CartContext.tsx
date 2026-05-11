

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import api from '@/api';
import { getSessionId } from '@/utils/sessionUtils';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image: string | null;
  };
  variation: {
    id: number;
    name: string;
    sku: string;
    unit: string | null;
    weight: string | null;
  };
  quantity: number;
  price: number;
  discount_price: number | null;
  total: number;
}

interface AddableItem {
  product_id: number;
  variation_id: number;
  quantity?: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (item: AddableItem) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number, variationId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getItemQty: (productId: number, variationId: number) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Get auth headers for API requests
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {};
    if (user?.id) {
      headers['x-customer-id'] = user.id.toString();
    }
    return headers;
  };

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const sessionId = getSessionId();
      const headers = getAuthHeaders();
      
      const response = await api.get('/cart', { 
        params: { session_id: sessionId },
        headers 
      });
      
      if (response.data.status === 1) {
        setItems(response.data.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch cart on mount and when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (item: AddableItem) => {
    try {
      const sessionId = getSessionId();
      const headers = getAuthHeaders();
      
      const response = await api.post('/cart/add', {
        session_id: sessionId,
        product_id: item.product_id,
        variation_id: item.variation_id,
        quantity: item.quantity || 1
      }, { headers });
      
      if (response.data.status === 1) {
        toast.success('Added to cart');
        await fetchCart();
      } else {
        toast.error(response.data.message || 'Failed to add to cart');
      }
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  }, [fetchCart, user]);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await api.post('/cart/update', {
        cart_item_id: cartItemId,
        quantity
      }, { headers });
      
      if (response.data.status === 1) {
        await fetchCart();
      } else {
        toast.error(response.data.message || 'Failed to update quantity');
      }
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (productId: number, variationId: number) => {
    try {
      const headers = getAuthHeaders();
      const item = items.find((i) => 
        i.product.id === productId && i.variation.id === variationId
      );
      
      if (!item) {
        toast.error('Item not found in cart');
        return;
      }
      
      const response = await api.post('/cart/remove', {
        cart_item_id: item.id
      }, { headers });
      
      if (response.data.status === 1) {
        toast.success('Removed from cart');
        await fetchCart();
      } else {
        toast.error(response.data.message || 'Failed to remove item');
      }
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  }, [fetchCart, items]);

  const clearCart = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const headers = getAuthHeaders();
      
      const response = await api.post('/cart/clear', {
        session_id: sessionId
      }, { headers });
      
      if (response.data.status === 1) {
        setItems([]);
        toast.success('Cart cleared');
      } else {
        toast.error(response.data.message || 'Failed to clear cart');
      }
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  }, [user]);

  const getItemQty = useCallback((productId: number, variationId: number) => {
    const item = items.find((i) => 
      i.product.id === productId && i.variation.id === variationId
    );
    return item ? item.quantity : 0;
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((acc, i) => acc + i.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((acc, i) => acc + i.total, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((acc, i) => acc + i.total, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{ 
      items, 
      loading,
      addItem, 
      updateQuantity,
      removeItem, 
      clearCart,
      fetchCart,
      getItemQty, 
      getTotalItems, 
      getTotalPrice,
      getSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
