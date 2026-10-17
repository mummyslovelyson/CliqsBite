import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import {
  SYNC_KEYS,
  getSharedData,
  setSharedData,
  subscribeToSync,
  getSyncApiBaseUrl,
} from "../data/syncBridge";
import { MENU_ITEMS } from "../data/menuData";

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

async function fetchJson(path, options = {}) {
  const baseUrl = getSyncApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" ? payload?.message : payload;
    throw new Error(message || "Request failed");
  }

  return payload;
}

export function CartProvider({ children }) {
  // Starts clean or synchronizes with shared orders
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => getSharedData(SYNC_KEYS.ORDERS, []));
  const [notifications, setNotifications] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Live Food Menu & Catalog (Controlled and managed by Admin Dashboard)
  const [liveMenu, setLiveMenu] = useState(() => {
    const saved = getSharedData(SYNC_KEYS.MENU, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return MENU_ITEMS;
  });

  // Live Categories (Controlled by Admin Dashboard)
  const [liveCategories, setLiveCategories] = useState(() => {
    return getSharedData(SYNC_KEYS.CATEGORIES, null);
  });

  // Live Promotions, Banners, and Promo Codes (Controlled by Admin Dashboard)
  const [livePromotions, setLivePromotions] = useState(() => {
    return getSharedData(SYNC_KEYS.PROMOTIONS, null);
  });

  // Live Store Settings (Kitchen online status, delivery fee)
  const [liveSettings, setLiveSettings] = useState(() => {
    return getSharedData(SYNC_KEYS.SETTINGS, {
      isKitchenOpen: true,
      baseDeliveryFee: 15.0,
      surgeActive: false,
    });
  });

  // Authentication State (user must sign up / sign in before accessing cart)
  const [currentUser, setCurrentUser] = useState(null);

  // Subscribe to real-time events from Admin Dashboard
  useEffect(() => {
    const unsub = subscribeToSync((event) => {
      if (
        event?.key === SYNC_KEYS.ORDERS ||
        event?.type === "ORDER_CREATED" ||
        event?.type === "ORDER_STATUS_CHANGED"
      ) {
        const fresh = getSharedData(SYNC_KEYS.ORDERS, null);
        if (fresh && Array.isArray(fresh)) {
          setOrders(fresh);
        }
      }

      if (event?.key === SYNC_KEYS.MENU || event?.type === "MENU_UPDATED") {
        const fresh = getSharedData(SYNC_KEYS.MENU, null);
        if (fresh && Array.isArray(fresh) && fresh.length > 0) {
          setLiveMenu(fresh);
        }
      }

      if (event?.key === SYNC_KEYS.CATEGORIES) {
        const fresh = getSharedData(SYNC_KEYS.CATEGORIES, null);
        if (fresh && Array.isArray(fresh)) {
          setLiveCategories(fresh);
        }
      }

      if (event?.key === SYNC_KEYS.PROMOTIONS || event?.type === "PROMOTIONS_UPDATED") {
        const fresh = getSharedData(SYNC_KEYS.PROMOTIONS, null);
        if (fresh) {
          setLivePromotions(fresh);
        }
      }

      if (event?.key === SYNC_KEYS.SETTINGS) {
        const fresh = getSharedData(SYNC_KEYS.SETTINGS, null);
        if (fresh) {
          setLiveSettings(fresh);
        }
      }

      if (event?.key === SYNC_KEYS.CUSTOMERS || event?.type === "CUSTOMER_UPDATED") {
        if (event?.data && Array.isArray(event.data)) {
          setCurrentUser((prevUser) => {
            if (!prevUser) return prevUser;
            const freshMe = event.data.find(
              (c) => c.id === prevUser.id || c.phone === prevUser.phone || c.email === prevUser.email
            );
            return freshMe ? { ...prevUser, ...freshMe } : prevUser;
          });
        }
      }
    });
    return () => unsub();
  }, []);

  const loginUser = useCallback(async (inputData) => {
    const email = inputData?.email || (inputData?.phone && inputData.phone.includes("@") ? inputData.phone : undefined);
    const phone = inputData?.phone && !inputData.phone.includes("@") ? inputData.phone : undefined;
    const password = inputData?.password || "password123";

    try {
      const response = await fetchJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email || undefined,
          phone: phone || undefined,
          password,
        }),
      });

      const user = response?.user || response;
      const normalized = {
        ...user,
        id: String(user.id ?? inputData?.id ?? `cust-${Date.now()}`),
        name: user.name || inputData?.name || "CliqsBite Customer",
        email: user.email || inputData?.email || "customer@cliqsbite.com",
        phone: user.phone || inputData?.phone || "+233 24 123 4567",
        role: user.role || "customer",
        walletBalance: user.walletBalance ?? 15.0,
        cliqsPoints: user.cliqsPoints ?? 100,
        status: user.status || "active",
      };

      setCurrentUser(normalized);
      return normalized;
    } catch (error) {
      console.warn("Backend login failed, using local fallback:", error.message);
    }

    try {
      const existingCustomers = getSharedData(SYNC_KEYS.CUSTOMERS, []);
      const query = (
        inputData?.email ||
        inputData?.phone ||
        inputData?.name ||
        ""
      )
        .toLowerCase()
        .trim();
      const match = Array.isArray(existingCustomers)
        ? existingCustomers.find(
            (c) =>
              (c.email && c.email.toLowerCase() === query) ||
              (c.phone &&
                c.phone.replace(/\s+/g, "") === query.replace(/\s+/g, "")) ||
              (c.id && c.id === inputData?.id)
          )
        : null;

      if (match) {
        setCurrentUser(match);
        return match;
      }
    } catch (e) {
      console.warn("Failed to lookup existing customer on login:", e);
    }

    const fallbackUser = {
      id: inputData?.id || `cust-${Date.now()}`,
      name: inputData?.name || "CliqsBite Customer",
      email: inputData?.email || "customer@cliqsbite.com",
      phone: inputData?.phone || "+233 24 123 4567",
      role: "customer",
      walletBalance: 15.0,
      cliqsPoints: 100,
      status: "active",
    };
    setCurrentUser(fallbackUser);
    return fallbackUser;
  }, [setCurrentUser]);

  const signupUser = useCallback(async (userData) => {
    const defaultAvatar =
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    const now = new Date();
    const password = userData?.password || "password123";

    try {
      const response = await fetchJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: userData?.name,
          email: userData?.email,
          phone: userData?.phone,
          password,
          primaryZone: userData?.primaryZone,
          primaryAddress: userData?.primaryAddress,
          landmark: userData?.landmark,
          dietaryPreference: userData?.dietaryPreference,
          role: userData?.role || "customer",
        }),
      });

      const createdUser = response?.user || response;
      const normalized = {
        ...createdUser,
        id: String(createdUser.id ?? userData?.id ?? `cust-${Date.now()}`),
        name: createdUser.name || userData?.name || "New CliqsBite Customer",
        email: createdUser.email || userData?.email || "customer@cliqsbite.com",
        phone: createdUser.phone || userData?.phone || "+233 24 000 0000",
        walletBalance: createdUser.walletBalance ?? 15.0,
        cliqsPoints: createdUser.cliqsPoints ?? 100,
        role: createdUser.role || userData?.role || "customer",
      };

      setCurrentUser(normalized);
      setSharedData(SYNC_KEYS.CUSTOMERS, [normalized], "CUSTOMER_REGISTERED");
      return normalized;
    } catch (error) {
      console.warn("Backend registration failed, using local fallback:", error.message);
    }

    const fullCustomer = {
      id: userData?.id || `cust-${Date.now()}`,
      name: userData?.name || "New CliqsBite Customer",
      email: userData?.email || "customer@cliqsbite.com",
      phone: userData?.phone || "+233 24 000 0000",
      avatar: userData?.avatar || defaultAvatar,
      primaryZone: userData?.primaryZone || "East Legon",
      primaryAddress:
        userData?.primaryAddress ||
        `${userData?.primaryZone || "East Legon"}, Accra, Ghana`,
      landmark: userData?.landmark || "Main Gate / Reception",
      savedAddresses: userData?.savedAddresses || [
        {
          label: "Home",
          address:
            userData?.primaryAddress ||
            `${userData?.primaryZone || "East Legon"}, Accra`,
          zone: userData?.primaryZone || "East Legon",
          isDefault: true,
        },
      ],
      totalOrders: 0,
      totalSpent: 0.0,
      walletBalance: 15.0,
      cliqsPoints: 100,
      loyaltyTier: "Bronze Starter",
      referralsCount: 0,
      dietaryPreference: userData?.dietaryPreference || "Standard / Halal",
      joinDate: now.toISOString().split("T")[0],
      registrationTime: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      lastActivity: "Just registered on mobile app",
      status: "active",
      isPhoneVerified: true,
      isEmailVerified: true,
      deviceInfo:
        Platform.OS === "ios"
          ? "Apple iPhone (iOS)"
          : Platform.OS === "android"
          ? "Android Mobile"
          : "CliqsBite Mobile Web",
      role: "customer",
      notes: [
        {
          id: `note-${Date.now()}`,
          author: "System (Auth)",
          text: `Customer signed up via CliqsBite Mobile App. Zone: ${
            userData?.primaryZone || "East Legon"
          }.`,
          date: now.toISOString().split("T")[0],
        },
      ],
    };

    setCurrentUser(fullCustomer);

    try {
      const existing = getSharedData(SYNC_KEYS.CUSTOMERS, []);
      const currentList = Array.isArray(existing) ? existing : [];
      const mockNames = [
        "Akosua Serwaa",
        "Kojo Boateng",
        "Esi Mensah-Bonsu",
        "Nana Yaw Darko",
        "Dr. Selasi Gbeho",
        "Afiya Poku",
        "Michael Ashitey",
      ];
      const realExisting = currentList.filter(
        (c) =>
          !mockNames.includes(c?.name) &&
          !["cust-1", "cust-2", "cust-3", "cust-4", "cust-5", "cust-6", "cust-7"].includes(c?.id)
      );
      const updated = [
        fullCustomer,
        ...realExisting.filter(
          (c) =>
            c.phone !== fullCustomer.phone && c.email !== fullCustomer.email
        ),
      ];
      setSharedData(SYNC_KEYS.CUSTOMERS, updated, "CUSTOMER_REGISTERED");
    } catch (e) {
      console.error("Failed to broadcast new customer to admin:", e);
    }

    const notifId = getNextNotifId();
    setNotifications((prev) => [
      {
        id: notifId,
        title: "Welcome to CliqsBite! 🍗🎉",
        message:
          "Your account has been created. GH₵ 15.00 welcome credit and 100 CliqsPoints added to your wallet!",
        time: "Just now",
        type: "promo",
        read: false,
      },
      ...prev,
    ]);
  }, [setCurrentUser]);

  useEffect(() => {
    const loadServerState = async () => {
      try {
        const menu = await fetchJson("/api/menu");
        if (Array.isArray(menu) && menu.length > 0) {
          setLiveMenu(menu);
          setSharedData(SYNC_KEYS.MENU, menu, "MENU_UPDATED");
        }
      } catch (error) {
        console.warn("Menu sync skipped:", error.message);
      }

      try {
        const settings = await fetchJson("/api/settings");
        if (settings && typeof settings === "object") {
          setLiveSettings(settings);
          setSharedData(SYNC_KEYS.SETTINGS, settings, "SETTINGS_UPDATED");
        }
      } catch (error) {
        console.warn("Settings sync skipped:", error.message);
      }

      try {
        const riders = await fetchJson("/api/riders");
        if (Array.isArray(riders)) {
          setSharedData(SYNC_KEYS.RIDERS, riders, "RIDER_STATUS_CHANGED");
        }
      } catch (error) {
        console.warn("Rider sync skipped:", error.message);
      }
    };

    loadServerState();
  }, []);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

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
    if (newItem?.inStock === false || newItem?.isAvailable === false) {
      return false;
    }
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
    return true;
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

    const normalizedOrder = {
      ...newOrder,
      totalAmount: newOrder.total,
      zone: orderData.deliveryAddress?.split(",")[0] || "East Legon",
      customer: {
        name: currentUser?.name || orderData.customerName || "CliqsBite Customer",
        phone: currentUser?.phone || orderData.customerPhone || "+233 24 123 4567",
        address: orderData.deliveryAddress || "Accra, Ghana",
        zone: orderData.deliveryAddress?.split(",")[0] || "East Legon",
      },
    };

    setOrders((prev) => {
      const updated = [normalizedOrder, ...prev];
      setSharedData(SYNC_KEYS.ORDERS, updated, "ORDER_CREATED");
      return updated;
    });

    // Update customer spending & order count for Admin
    try {
      const currentCustList = getSharedData(SYNC_KEYS.CUSTOMERS, []);
      if (Array.isArray(currentCustList) && currentCustList.length > 0) {
        const custPhone = currentUser?.phone || orderData.customerPhone;
        const custEmail = currentUser?.email;
        const updatedCustList = currentCustList.map((c) => {
          if (
            (custPhone && c.phone === custPhone) ||
            (custEmail && c.email === custEmail)
          ) {
            return {
              ...c,
              totalOrders: (c.totalOrders || 0) + 1,
              totalSpent: (c.totalSpent || 0) + (normalizedOrder.totalAmount || 0),
              lastActivity: `Just now (Placed Order #${orderId})`,
            };
          }
          return c;
        });
        setSharedData(SYNC_KEYS.CUSTOMERS, updatedCustList, "CUSTOMER_UPDATED");
      }
    } catch (e) {
      console.error("Failed to update customer order count:", e);
    }

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
    return normalizedOrder;
  }, [currentUser]);

  /**
   * Rate an order (meals & rider service)
   */
  const rateOrder = useCallback((orderId, rating, review, riderRating = 5) => {
    setOrders((prev) => {
      const updated = prev.map((ord) =>
        ord.id === orderId ? { ...ord, rating, review, riderRating } : ord
      );
      setSharedData(SYNC_KEYS.ORDERS, updated, "ORDER_STATUS_CHANGED");
      return updated;
    });
  }, []);

  /**
   * Cancel an active order with automatic refund notice
   */
  const cancelOrder = useCallback((orderId, reason = "Cancelled by customer") => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
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
      });
      setSharedData(SYNC_KEYS.ORDERS, updated, "ORDER_STATUS_CHANGED");
      return updated;
    });

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
    setOrders((prev) => {
      const updated = prev.map((ord) => {
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
      });
      setSharedData(SYNC_KEYS.ORDERS, updated, "ORDER_STATUS_CHANGED");
      return updated;
    });
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

  // Coupon validator driven by Admin Dashboard promotions
  const validateCoupon = useCallback(
    (code, subtotalAmount) => {
      if (!code || !code.trim()) {
        return { valid: false, message: "Please enter a coupon code." };
      }
      const cleanCode = code.trim().toUpperCase();

      // Look up in livePromotions.coupons from Admin Dashboard
      const promoList = livePromotions?.coupons || [];
      const found = promoList.find(
        (c) => (c.code || "").toUpperCase() === cleanCode
      );

      // Fallback built-in vouchers if none configured in Admin Dashboard
      if (!found) {
        if (cleanCode === "CLIQS25") {
          if (subtotalAmount < 50) {
            return {
              valid: false,
              message: "Minimum order of GH₵ 50.00 required for this coupon.",
            };
          }
          return {
            valid: true,
            code: "CLIQS25",
            title: "GH₵ 25 Welcome Discount",
            discountAmount: Math.min(25.0, subtotalAmount),
            discountType: "fixed",
          };
        }
        if (cleanCode === "FREESHIP") {
          return {
            valid: true,
            code: "FREESHIP",
            title: "Free Delivery Voucher",
            discountAmount: 0.0,
            freeDelivery: true,
            discountType: "free_delivery",
          };
        }
        return {
          valid: false,
          message: "This coupon code is invalid or has expired.",
        };
      }

      if (found.isActive === false) {
        return {
          valid: false,
          message:
            "This coupon code is currently inactive or deactivated by admin.",
        };
      }

      const minSpend = Number(found.minOrderAmount) || 0;
      if (subtotalAmount < minSpend) {
        return {
          valid: false,
          message: `Minimum order of GH₵ ${minSpend.toFixed(
            2
          )} required for code ${cleanCode}.`,
        };
      }

      let discount = 0;
      if (found.discountType === "percentage" || found.type === "percentage") {
        const pct = Number(found.discountValue) || Number(found.value) || 0;
        discount = (subtotalAmount * pct) / 100;
      } else {
        discount = Number(found.discountValue) || Number(found.value) || 0;
      }

      discount = Math.min(discount, subtotalAmount);

      return {
        valid: true,
        code: found.code,
        title: found.description || found.title || `${found.code} Voucher`,
        discountAmount: discount,
        discountType: found.discountType,
      };
    },
    [livePromotions]
  );

  const cartCount = cart.reduce((totalQty, item) => totalQty + item.quantity, 0);
  const subtotal = cart.reduce(
    (totalPrice, item) => totalPrice + item.price * item.quantity,
    0
  );
  const baseDeliveryFee =
    liveSettings?.baseDeliveryFee !== undefined
      ? Number(liveSettings.baseDeliveryFee)
      : 15.0;
  const deliveryFee = cart.length > 0 ? baseDeliveryFee : 0.0;
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
        // Live Admin Dashboard Managed States
        liveMenu,
        liveCategories,
        livePromotions,
        liveSettings,
        validateCoupon,
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
