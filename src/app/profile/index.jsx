import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logoutUser } = useCart();
  const userName = currentUser?.name || "CliqsBite Guest";
  const userPhone = currentUser?.phone || currentUser?.email || "Sign in to save orders & rewards";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of CliqsBite?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          logoutUser();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-[#1C1917] tracking-tight">
          My Account
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/profile/settings")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="settings" size={20} color="#1C1917" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
      >
        {/* User Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/profile/edit-profile")}
          className="bg-white border border-[#EFE5D6] rounded-[28px] p-5 mb-5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-2">
            {/* Avatar Icon */}
            <View className="w-14 h-14 rounded-full bg-[#FF6000] items-center justify-center mr-3.5 border-2 border-white">
              <Feather name="user" size={28} color="#ffffff" />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center mb-0.5">
                <Text className="text-lg font-black text-[#1C1917] mr-2">
                  {userName}
                </Text>
                <View className="bg-[#FFF3EB] px-2.5 py-0.5 rounded-full border border-[#FED7AA]">
                  <Text className="text-xs font-black text-[#FF6000] uppercase">
                    MEMBER
                  </Text>
                </View>
              </View>

              <Text className="text-sm text-[#78716C] font-semibold">{userPhone}</Text>
              <Text className="text-xs text-[#FF6000] font-bold mt-1">
                Edit Personal Info &amp; Verification &rarr;
              </Text>
            </View>
          </View>

          <Feather name="chevron-right" size={20} color="#A8A29E" />
        </TouchableOpacity>

        {/* Quick Stats Badges */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/profile/orders")}
            className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-3.5 items-center mr-2.5"
          >
            <Text className="text-xl font-black text-[#FF6000]">0</Text>
            <Text className="text-xs font-bold text-[#78716C] mt-1">
              Past Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/profile/wallet")}
            className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-3.5 items-center mr-2.5"
          >
            <Text className="text-xl font-black text-[#EA580C]">0</Text>
            <Text className="text-xs font-bold text-[#78716C] mt-1">
              CliqsPoints
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/profile/wallet")}
            className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-3.5 items-center"
          >
            <Text className="text-xl font-black text-[#16A34A]">3</Text>
            <Text className="text-xs font-bold text-[#78716C] mt-1">
              Vouchers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Orders & Delivery */}
        <View className="mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2 px-1">
            Orders &amp; Food Preferences
          </Text>

          <View className="bg-white border border-[#EFE5D6] rounded-[24px] overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/orders")}
              className="p-4 flex-row items-center justify-between border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="shopping-bag" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Order History &amp; Live Tracking
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">View receipts, reorder previous meals</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/addresses")}
              className="p-4 flex-row items-center justify-between border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="map-pin" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Delivery Addresses
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Home, Work, GPS coordinates &amp; instructions</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/preferences")}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <MaterialCommunityIcons name="silverware-fork-knife" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Food Preferences &amp; Allergies
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Spice levels, cutlery &amp; allergy warnings</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Payments & Rewards */}
        <View className="mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2 px-1">
            Payments &amp; Rewards
          </Text>

          <View className="bg-white border border-[#EFE5D6] rounded-[24px] overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/wallet")}
              className="p-4 flex-row items-center justify-between border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <MaterialCommunityIcons name="wallet-outline" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    CliqsPay Wallet &amp; Balances
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Top up wallet, view refunds &amp; points</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/wallet")}
              className="p-4 flex-row items-center justify-between border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="credit-card" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Payment Methods &amp; Cards
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">MTN MoMo, Telecel Cash &amp; Bank Cards</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/wallet")}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Ionicons name="pricetag-outline" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Promo Codes &amp; Vouchers
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Exclusive meal discounts &amp; free delivery</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Settings & Support */}
        <View className="mb-6">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2 px-1">
            Support &amp; Preferences
          </Text>

          <View className="bg-white border border-[#EFE5D6] rounded-[24px] overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/settings")}
              className="p-4 flex-row items-center justify-between border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="bell" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Notifications &amp; Alerts
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Push, SMS, email &amp; promotional preferences</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/settings")}
              className="p-4 flex-row items-center justify-between border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="shield" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Security &amp; Active Sessions
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Password, biometric lock &amp; logged-in devices</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/support")}
              className="p-4 flex-row items-center justify-between border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="help-circle" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Help &amp; Customer Support
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">FAQs, WhatsApp chat &amp; order problem reports</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/about")}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="info" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    About CliqsBite &amp; Rewards
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Rate the app, invite friends &amp; version info</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/onboarding")}
              className="p-4 flex-row items-center justify-between border-t border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="compass" size={19} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Take App Onboarding Tour
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Review features, AI bot &amp; Ghanaian meals</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rider Portal Access Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/rider")}
          className="bg-[#1C1917] rounded-[24px] p-4 flex-row items-center justify-between mb-4"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-10 h-10 rounded-xl bg-[#FF6000] items-center justify-center mr-3">
              <MaterialCommunityIcons name="moped" size={22} color="#ffffff" />
            </View>
            <View>
              <Text className="text-base font-black text-white">
                Rider Delivery Portal
              </Text>
              <Text className="text-xs text-[#A8A29E] font-medium">
                Switch to driver mode • Pick up orders &amp; earn GH₵
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Log Out Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogout}
          className="bg-white border border-[#FEE2E2] rounded-[24px] p-4 flex-row items-center justify-center"
        >
          <Feather name="log-out" size={19} color="#DC2626" className="mr-2" />
          <Text className="text-base font-black text-[#DC2626] ml-2">Log Out of CliqsBite</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
