// CliqsBite Universal Local Sync Bridge (Mobile App Side)
// Enables zero-backend real-time communication between Mobile App and Admin Dashboard.

import { Platform } from "react-native";
import Constants from "expo-constants";

export const SYNC_KEYS = {
  ORDERS: "cliqsbite_shared_orders",
  MENU: "cliqsbite_shared_menu",
  CATEGORIES: "cliqsbite_shared_categories",
  PROMOTIONS: "cliqsbite_shared_promotions",
  RIDERS: "cliqsbite_shared_riders",
  CUSTOMERS: "cliqsbite_shared_customers",
  SETTINGS: "cliqsbite_shared_settings",
};

const CHANNEL_NAME = "cliqsbite_sync_channel";

// In-memory cache for native platforms (iOS/Android) where window.localStorage is unavailable
const memCache = {};

let channel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn("BroadcastChannel not available:", e);
  }
}

/**
 * Resolves the Admin Dashboard Vite Sync server URL dynamically
 */
export function getSyncApiBaseUrl() {
  if (typeof process !== "undefined" && process.env && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname || "localhost";
    return `http://${hostname}:5000`;
  }
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000`;
  }
  return "http://10.148.124.101:5000";
}

export function getSharedData(key, fallback = null) {
  if (memCache[key] !== undefined) {
    return memCache[key];
  }
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        memCache[key] = parsed;
        return parsed;
      }
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
    }
  }
  return fallback;
}

export function setSharedData(key, data, broadcastType = null) {
  // 1. Update in-memory cache
  memCache[key] = data;

  // 2. Local storage if on web
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  }

  // 3. BroadcastChannel (same origin)
  if (channel && broadcastType) {
    try {
      channel.postMessage({ type: broadcastType, key, data, timestamp: Date.now() });
    } catch (_e) {}
  }

  // 4. PostMessage to parent window if inside iframe
  if (typeof window !== "undefined" && window.parent && window.parent !== window) {
    try {
      window.parent.postMessage(
        { source: "cliqsbite_mobile_sync", type: broadcastType, key, data, timestamp: Date.now() },
        "*"
      );
    } catch (_e) {}
  }

  // 5. Direct HTTP POST to Vite Dev Server Sync API (cross-port & cross-device)
  const baseUrl = getSyncApiBaseUrl();
  fetch(`${baseUrl}/api/sync/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, event: broadcastType || `UPDATE_${key}` }),
  }).catch((_err) => {
    // Silently continue if sync server is temporarily restarting
  });
}

export function broadcastEvent(type, payload = {}) {
  if (channel) {
    try {
      channel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (_e) {}
  }
  if (typeof window !== "undefined" && window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({ source: "cliqsbite_mobile_sync", type, payload, timestamp: Date.now() }, "*");
    } catch (_e) {}
  }
  const baseUrl = getSyncApiBaseUrl();
  fetch(`${baseUrl}/api/sync/event_broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, payload }),
  }).catch(() => {});
}

export function subscribeToSync(handler) {
  // 1. BroadcastChannel listener
  const channelListener = (event) => {
    if (event?.data && handler) {
      if (event.data.key && event.data.data !== undefined) {
        memCache[event.data.key] = event.data.data;
      }
      handler(event.data);
    }
  };
  if (channel) {
    channel.addEventListener("message", channelListener);
  }

  // 2. Storage event listener (web tabs)
  let storageListener = null;
  if (typeof window !== "undefined" && window.addEventListener) {
    storageListener = (event) => {
      if (event.key && Object.values(SYNC_KEYS).includes(event.key)) {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : null;
          memCache[event.key] = parsed;
          handler({
            type: `STORAGE_${event.key}`,
            key: event.key,
            data: parsed,
            timestamp: Date.now(),
          });
        } catch (_e) {}
      }
    };
    window.addEventListener("storage", storageListener);
  }

  // 3. PostMessage listener (iframe)
  let postMessageListener = null;
  if (typeof window !== "undefined" && window.addEventListener) {
    postMessageListener = (event) => {
      if (event?.data?.source === "cliqsbite_admin_sync" && handler) {
        if (event.data.key && event.data.data !== undefined) {
          memCache[event.data.key] = event.data.data;
        }
        handler(event.data);
      }
    };
    window.addEventListener("message", postMessageListener);
  }

  // 4. Server-Sent Events (SSE) listener if supported
  let eventSource = null;
  const baseUrl = getSyncApiBaseUrl();
  if (typeof EventSource !== "undefined") {
    try {
      eventSource = new EventSource(`${baseUrl}/api/sync/events`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed?.key) {
            memCache[parsed.key] = parsed.data;
            if (handler) {
              handler(parsed);
            }
          }
        } catch (_err) {}
      };
    } catch (_e) {}
  }

  // 5. Initial fetch from Vite Sync API to pull current state
  const syncKeysList = [
    SYNC_KEYS.MENU,
    SYNC_KEYS.CATEGORIES,
    SYNC_KEYS.PROMOTIONS,
    SYNC_KEYS.SETTINGS,
    SYNC_KEYS.CUSTOMERS,
    SYNC_KEYS.ORDERS,
  ];

  syncKeysList.forEach((key) => {
    fetch(`${baseUrl}/api/sync/${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data !== null && data !== undefined) {
          memCache[key] = data;
          if (typeof window !== "undefined" && window.localStorage) {
            try {
              window.localStorage.setItem(key, JSON.stringify(data));
            } catch (_e) {}
          }
          if (handler) {
            handler({
              type: `INITIAL_${key}`,
              key,
              data,
              timestamp: Date.now(),
            });
          }
        }
      })
      .catch(() => {});
  });

  // 6. Polling interval to maintain continuous sync across network boundaries
  const pollInterval = setInterval(() => {
    [SYNC_KEYS.MENU, SYNC_KEYS.SETTINGS, SYNC_KEYS.PROMOTIONS].forEach((key) => {
      fetch(`${baseUrl}/api/sync/${encodeURIComponent(key)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data !== null && data !== undefined) {
            const currentStr = JSON.stringify(memCache[key]);
            const newStr = JSON.stringify(data);
            if (currentStr !== newStr) {
              memCache[key] = data;
              if (handler) {
                handler({
                  type: `POLL_${key}`,
                  key,
                  data,
                  timestamp: Date.now(),
                });
              }
            }
          }
        })
        .catch(() => {});
    });
  }, 4000);

  return () => {
    if (channel) {
      channel.removeEventListener("message", channelListener);
    }
    if (storageListener && typeof window !== "undefined") {
      window.removeEventListener("storage", storageListener);
    }
    if (postMessageListener && typeof window !== "undefined") {
      window.removeEventListener("message", postMessageListener);
    }
    if (eventSource) {
      eventSource.close();
    }
    clearInterval(pollInterval);
  };
}
