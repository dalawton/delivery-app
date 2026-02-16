import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]); // [{ id, name, price, quantity, restaurant_id, image_url }]
  const [restaurantId, setRestaurantId] = useState(null); // track which restaurant cart belongs to

  // Add item to cart (only from same restaurant)
  const addToCart = (item) => {
    if (restaurantId && restaurantId !== item.restaurant_id) {
      const confirm = window.confirm(
        'Your cart has items from another restaurant. Clear cart and add this item?'
      );
      if (!confirm) return;
      clearCart();
    }

    setRestaurantId(item.restaurant_id);
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove one unit of an item
  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity === 1) {
        const updated = prev.filter(i => i.id !== itemId);
        if (updated.length === 0) setRestaurantId(null);
        return updated;
      }
      return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
  };

  // Total price
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Total item count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      restaurantId,
      addToCart,
      removeFromCart,
      clearCart,
      totalPrice,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
