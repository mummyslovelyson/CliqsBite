import "../app.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "../context/CartContext";
import { RiderProvider } from "../context/RiderContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <RiderProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="menu" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="ai-bot" />
            <Stack.Screen name="notifications" />
          </Stack>
        </RiderProvider>
      </CartProvider>
    </SafeAreaProvider>
  );
}
