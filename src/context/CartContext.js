
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useUser } from "./UserContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn } = useUser();

  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const cartStorageKey =
    isLoggedIn && user?.phone
      ? `texora_cart_${user.phone}`
      : "texora_cart_guest";

  // Load cart
  useEffect(() => {
    setIsLoaded(false);

    try {
      const savedCart = localStorage.getItem(cartStorageKey);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        const cleanItems = Array.isArray(parsed)
          ? parsed.map((item) => {
              const quantity = Number(item.quantity);

              return {
                ...item,
                quantity:
                  Number.isFinite(quantity) && quantity > 0
                    ? quantity
                    : 1,
                selectedSize: item.selectedSize || "Free Size",
                selectedColor: item.selectedColor || "Standard",
              };
            })
          : [];

        setCartItems(cleanItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Cart loading error:", error);
      setCartItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, [cartStorageKey]);

  // Save cart
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Cart saving error:", error);
    }
  }, [cartItems, cartStorageKey, isLoaded]);

  // Add to cart
  const addToCart = (
    product,
    arg2 = 1,
    arg3 = "Free Size",
    arg4 = "Standard"
  ) => {
    let quantity = 1;
    let selectedSize = "Free Size";
    let selectedColor = "Standard";

    if (typeof arg2 === "string") {
      selectedSize = arg2 || "Free Size";
      selectedColor = typeof arg3 === "string" ? arg3 : "Standard";
      quantity = typeof arg4 === "number" ? arg4 : 1;
    } else {
      quantity = Number(arg2) || 1;
      selectedSize = typeof arg3 === "string" ? arg3 : "Free Size";
      selectedColor = typeof arg4 === "string" ? arg4 : "Standard";
    }

    quantity = Math.max(1, quantity);

    setCartItems((prevItems) => {
      const itemId = product.id || product._id;

      const existingIndex = prevItems.findIndex(
        (item) =>
          (item.id || item._id) === itemId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingIndex !== -1) {
        const updated = [...prevItems];

        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity:
            (Number(updated[existingIndex].quantity) || 1) + quantity,
        };

        return updated;
      }

      return [
        ...prevItems,
        {
          ...product,
          id: itemId,
          quantity,
          selectedSize,
          selectedColor,
        },
      ];
    });
  };

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
    const qty = Number(newQuantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        (item.id || item._id) === id
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  // Remove item
  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((item) => (item.id || item._id) !== id)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);

    try {
      localStorage.removeItem(cartStorageKey);
    } catch (error) {
      console.error("Cart clear error:", error);
    }
  };

  // Price calculations
  const {
    subtotalPrice,
    totalMrp,
    totalDiscount,
  } = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      return total + price * quantity;
    }, 0);

    const mrp = cartItems.reduce((total, item) => {
      const price = Number(item.mrp || item.originalPrice || item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      return total + price * quantity;
    }, 0);

    return {
      subtotalPrice: subtotal,
      totalMrp: mrp,
      totalDiscount: Math.max(0, mrp - subtotal),
    };
  }, [cartItems]);

  const totalCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        totalItemsCount: totalCount,
        subtotalPrice,
        totalMrp,
        totalDiscount,
        isLoaded,
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
