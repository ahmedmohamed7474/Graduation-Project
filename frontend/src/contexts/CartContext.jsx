import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [] });
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3002/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      if (!product?.id) {
        console.error("Invalid product:", product);
        return { 
          success: false, 
          error: "Invalid product data" 
        };
      }

      const token = localStorage.getItem("token");
      if (!token) {
        return { 
          success: false, 
          error: "Please log in to add items to cart" 
        };
      }

      const response = await fetch("http://localhost:3002/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setCart(data); // Update cart with the returned data
        return { success: true };
      } else {
        console.error("Server error:", data);
        return { 
          success: false, 
          error: data.message || 'Failed to add item to cart' 
        };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { 
        success: false, 
        error: "Failed to add item to cart" 
      };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3002/api/cart/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3002/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCart({ items: [] });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3002/api/cart/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      return { success: false, error: "Failed to update quantity" };
    }
  };

  const cartTotal = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        updateCartItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
