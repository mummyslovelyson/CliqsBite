import React, { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext();

let orderSequence = 5200;
function getNextOrderId() {
  orderSequence += 1;
  return `CB-${orderSequence}`;
}

let notifSequence = 100;
function getNextNotifId() {
  notifSequence += 1;
  return `notif-${notifSequence}`;
}

let cartSequence = 1;
function getNextCartItemId(prefix) {
  cartSequence += 1;
  return `${prefix}-${cartSequence}`;
}

export function CartProvider({ children }) {
  // Starts completely empty — no mock data
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Authentication State (user must sign up / sign in before accessing cart)
  const [currentUser, setCurrentUser] = useState(null);

  const loginUser = useCallback((userData) => {
    setCurrentUser(
      userData || {
        id: "cust-1",
        name: "CliqsBite Customer",
        email: "customer@cliqsbite.com",
        phone: "+233 24 123 4567",
        role: "customer",
      }
    );
  }, []);

  const signupUser = useCallback((userData) => {
    setCurrentUser(
      userData || {
        id: `cust-${Date.now()}`,
        name: "New Customer",
        email: "newcustomer@cliqsbite.com",
        phone: "+233 24 000 0000",
        role: "customer",
      }
    );
  }, []);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const isAuthenticated = Boolean(currentUser);

  // Onboarding state: first-time app launch displays onboarding before app home opens
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasCompletedOnboarding(false);
  }, []);

  /**
   * Search history actions
   */
  const addRecentSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== clean.toLowerCase()
      );
      return [clean, ...filtered].slice(0, 8);
    });
  }, []);

  const removeRecentSearch = useCallback((term) => {
    setRecentSearches((prev) =>
      prev.filter((s) => s.toLowerCase() !== term.toLowerCase())
    );
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  /**
   * Add item to cart
   */
  const addToCart = useCallback((newItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => {
        const sameId = item.id === newItem.id;
        const samePortion = item.portion === newItem.portion;
        const sameSpice = item.spiceLevel === newItem.spiceLevel;
        const sameAddons =
          JSON.stringify(item.addons || []) ===
          JSON.stringify(newItem.addons || []);
        return sameId && samePortion && sameSpice && sameAddons;
      });

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (newItem.quantity || 1),
        };
        return updated;
      }

      const cartItemId = getNextCartItemId(newItem.id);

      return [
        ...prevCart,
        {
          ...newItem,
          cartItemId,
          quantity: newItem.quantity || 1,
        },
      ];
    });
  }, []);

  /**
   * Adjust quantity for a cart item
   */
  const updateQuantity = useCallback((cartItemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  /**
   * Remove item from cart completely
   */
  const removeFromCart = useCallback((cartItemId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.cartItemId !== cartItemId)
    );
  }, []);

  /**
   * Clear all items in cart
   */
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  /**
   * Place an order
   */
  const placeOrder = useCallback((orderData) => {
    const orderId = getNextOrderId();
    const notifId = getNextNotifId();

    const newOrder = {
      id: orderId,
      date: "Today, Just now",
      status: "In Kitchen",
      statusCode: "active",
      statusColor: "#FF6000",
      statusBg: "#FFF3EB",
      step: 2, // 1: Confirmed, 2: Kitchen, 3: Rider picked up, 4: Delivered
      rider: {
        name: "Kwame Asante",
        phone: "+233 24 111 2233",
        vehicle: "Honda Ace (GW-8821)",
        lat: 5.6045,
        lng: -0.1865,
      },
      kitchen: {
        name: "CliqsBite Kitchen (East Legon)",
        lat: 5.6072,
        lng: -0.1832,
      },
      destination: {
        address: orderData.deliveryAddress || "Accra, Ghana",
        lat: 5.6012,
        lng: -0.1895,
      },
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || "Mobile Money",
      deliveryType: orderData.deliveryType || "delivery",
      deliveryAddress: orderData.deliveryAddress || "Customer Pickup Counter",
      eta: "25-30 mins",
      notes: orderData.notes || "",
      rating: null,
      review: null,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Send push / in-app notification
    const newNotif = {
      id: notifId,
      title: `Order #${orderId} Confirmed! 🎉`,
      message: `Kitchen is preparing your freshly fried meals. Estimated delivery is 25-30 minutes.`,
      time: "Just now",
      type: "order",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setCart([]);
    return newOrder;
  }, []);

  /**
   * Rate an order (meals & rider service)
   */
  const rateOrder = useCallback((orderId, rating, review, riderRating = 5) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, rating, review, riderRating } : ord
      )
    );
  }, []);

  /**
   * Cancel an active order with automatic refund notice
   */
  const cancelOrder = useCallback((orderId, reason = "Cancelled by customer") => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: "Cancelled",
            statusCode: "cancelled",
            statusColor: "#DC2626",
            statusBg: "#FEF2F2",
            cancelReason: reason,
            cancelledAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        }
        return ord;
      })
    );

    const notifId = getNextNotifId();
    setNotifications((prev) => [
      {
        id: notifId,
        title: `Order #${orderId} Cancelled`,
        message: `Your order was cancelled. Any Mobile Money or Card payment will be refunded immediately.`,
        time: "Just now",
        type: "order",
        read: false,
      },
      ...prev,
    ]);
  }, []);

  /**
   * Advance order lifecycle milestone (simulates real-time kitchen & rider progress)
   */
  const advanceOrderStatus = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const currentStep = ord.step || 2;
          const nextStep = currentStep + 1;
          let nextStatus = ord.status;
          let nextColor = ord.statusColor;
          let nextBg = ord.statusBg;
          let nextEta = ord.eta;
          let nextCode = ord.statusCode;

          if (nextStep === 3) {
            nextStatus = "Out for Delivery";
            nextColor = "#FF6000";
            nextBg = "#FFF3EB";
            nextEta = "10-15 mins";
            nextCode = "active";
          } else if (nextStep === 4) {
            nextStatus = "Arrived at Doorstep";
            nextColor = "#16A34A";
            nextBg = "#F0FDF4";
            nextEta = "Arrived now";
            nextCode = "active";
          } else if (nextStep >= 5) {
            nextStatus = "Delivered";
            nextColor = "#16A34A";
            nextBg = "#F0FDF4";
            nextEta = "Delivered";
            nextCode = "delivered";
          }

          const notifId = getNextNotifId();
          setNotifications((n) => [
            {
              id: notifId,
              title: `Order #${orderId}: ${nextStatus}!`,
              message:
                nextStep >= 5
                  ? `Your food has been delivered! Please enjoy your crispy hot meal.`
                  : nextStep === 4
                  ? `Your rider Kwame Asante has arrived outside your gate. Share your 4-digit code (5824).`
                  : `Rider has picked up your meals from CliqsBite Kitchen and is heading to you.`,
              time: "Just now",
              type: "order",
              read: false,
            },
            ...n,
          ]);

          return {
            ...ord,
            step: nextStep,
            status: nextStatus,
            statusCode: nextCode,
            statusColor: nextColor,
            statusBg: nextBg,
            eta: nextEta,
          };
        }
        return ord;
      })
    );
  }, []);

  /**
   * Tip rider for great delivery service
   */
  const tipRider = useCallback((orderId, tipAmount) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            riderTip: (ord.riderTip || 0) + tipAmount,
          };
        }
        return ord;
      })
    );

    const notifId = getNextNotifId();
    setNotifications((prev) => [
      {
        id: notifId,
        title: `Tip Sent! 🌟`,
        message: `You tipped GH₵ ${tipAmount.toFixed(2)} to your delivery rider. Thank you for your generosity!`,
        time: "Just now",
        type: "order",
        read: false,
      },
      ...prev,
    ]);
  }, []);

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const cartCount = cart.reduce((totalQty, item) => totalQty + item.quantity, 0);
  const subtotal = cart.reduce(
    (totalPrice, item) => totalPrice + item.price * item.quantity,
    0
  );
  const deliveryFee = cart.length > 0 ? 15.0 : 0.0;
  const total = Math.max(0, subtotal + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        deliveryFee,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        // Orders state & management
        orders,
        placeOrder,
        cancelOrder,
        advanceOrderStatus,
        tipRider,
        rateOrder,
        // Notifications state
        notifications,
        clearNotifications,
        // Addresses state
        savedAddresses,
        setSavedAddresses,
        // Search history state
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        // Authentication state
        currentUser,
        isAuthenticated,
        loginUser,
        signupUser,
        logoutUser,
        // Onboarding flow state
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
