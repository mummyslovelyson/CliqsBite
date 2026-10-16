import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, clearNotifications } = useCart();
  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "orders") return n.type === "order";
    if (filter === "promos") return n.type === "promo";
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Top Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-xl font-black text-[#1C1917] tracking-tight">
            Notifications
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {notifications.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={clearNotifications}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-bold text-[#DC2626]">Clear</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-11" />
        )}
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 pt-3 pb-2">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "orders", label: "Orders" },
          { key: "promos", label: "Offers" },
        ].map((tab) => {
          const active = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full mr-2.5 border ${
                active
                  ? "bg-[#FF6000] border-[#FF6000]"
                  : "bg-white border-[#EFE5D6]"
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  active ? "text-white" : "text-[#78716C]"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 }}
      >
        {filteredNotifications.length === 0 ? (
          <View className="items-center justify-center py-24">
            <View className="w-24 h-24 rounded-full bg-white border border-[#EFE5D6] items-center justify-center mb-5">
              <Feather name="bell-off" size={32} color="#A8A29E" />
            </View>
            <Text className="text-xl font-black text-[#1C1917] mb-2">
              No notifications yet
            </Text>
            <Text className="text-sm text-[#78716C] text-center max-w-[280px] leading-6 mb-6 font-medium">
              You&apos;re all caught up! Order status updates, rider arrival SMS alerts, and flash promo discounts will appear here.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/menu")}
              className="bg-[#FF6000] px-7 py-3 rounded-full flex-row items-center"
            >
              <Feather name="compass" size={17} color="#ffffff" className="mr-2" />
              <Text className="text-sm font-black text-white ml-2">Browse Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <View
              key={item.id}
              className={`bg-white border rounded-[22px] p-4 mb-3.5 flex-row items-start ${
                item.read ? "border-[#EFE5D6]" : "border-[#FF6000]/40 bg-[#FFFDF9]"
              }`}
            >
              <View className="w-11 h-11 rounded-2xl bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mr-3.5">
                <MaterialCommunityIcons
                  name={item.type === "order" ? "moped" : "bell"}
                  size={22}
                  color="#FF6000"
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-black text-[#1C1917] flex-1 mr-2" numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View className="w-2.5 h-2.5 rounded-full bg-[#FF6000]" />
                  )}
                </View>

                <Text className="text-sm text-[#78716C] font-medium leading-5 mb-1.5">
                  {item.message}
                </Text>

                <Text className="text-xs font-semibold text-[#A8A29E]">
                  {item.time}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
