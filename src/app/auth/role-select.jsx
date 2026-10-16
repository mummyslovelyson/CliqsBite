import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const LOGO_IMG = require("../../../assets/images/logo.jpg");

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }}
      >
        {/* Brand Header */}
        <View className="items-center mt-4 mb-8">
          <View
            style={{ width: 84, height: 84, borderRadius: 42, overflow: "hidden", backgroundColor: "#EE5A05", elevation: 2 }}
            className="mb-3.5 border-2 border-white"
          >
            <Image
              source={LOGO_IMG}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <Text className="text-3xl font-black italic tracking-tight text-[#FF6000]">
            CliqsBite
          </Text>
          <Text className="text-xl font-black text-[#1C1917] mt-1 text-center">
            Welcome to CliqsBite
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] text-center mt-1 max-w-[280px]">
            Order your favourite meals or join our fast-growing delivery fleet.
          </Text>
        </View>

        {/* Role 1: Customer Card */}
        <View className="bg-white border-2 border-[#EFE5D6] rounded-[28px] p-6 mb-5">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-2xl bg-[#FFF3EB] items-center justify-center mr-3.5 border border-[#FED7AA]">
              <Feather name="shopping-bag" size={24} color="#FF6000" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-[#1C1917]">
                I&apos;m a Customer
              </Text>
              <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
                Browse meals, pay and track orders
              </Text>
            </View>
          </View>

          <Text className="text-xs text-[#78716C] leading-5 font-medium mb-5">
            Discover freshly fried crispy chicken, spicy jollof combos, and cold drinks delivered hot to your doorstep in minutes.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/auth/login")}
            className="w-full bg-[#FF6000] py-3.5 rounded-full items-center justify-center mb-2.5"
          >
            <Text className="text-sm font-black text-white">Customer Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/auth/register")}
            className="w-full bg-[#FAF4EB] border border-[#EFE5D6] py-3 rounded-full items-center justify-center"
          >
            <Text className="text-xs font-black text-[#1C1917]">Create Customer Account</Text>
          </TouchableOpacity>
        </View>

        {/* Role 2: Rider Card */}
        <View className="bg-[#1C1917] rounded-[28px] p-6 mb-6 border border-[#1C1917]">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-2xl bg-[#FF6000] items-center justify-center mr-3.5">
              <MaterialCommunityIcons name="moped" size={26} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-white">
                I&apos;m a Rider
              </Text>
              <Text className="text-xs font-semibold text-[#A8A29E] mt-0.5">
                Register to deliver orders and earn money
              </Text>
            </View>
          </View>

          <Text className="text-xs text-[#A8A29E] leading-5 font-medium mb-5">
            Earn competitive payouts with daily MoMo cashouts, flexible hours, and guaranteed tips across Accra.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/rider/auth/login")}
            className="w-full bg-[#16A34A] py-3.5 rounded-full items-center justify-center mb-2.5"
          >
            <Text className="text-sm font-black text-white">Rider Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/rider/auth/register")}
            className="w-full bg-white/10 border border-white/20 py-3 rounded-full items-center justify-center"
          >
            <Text className="text-xs font-black text-white">Become a Rider (Register)</Text>
          </TouchableOpacity>
        </View>

        {/* Guest access option */}
        <View className="items-center pb-4">
          <TouchableOpacity onPress={() => router.replace("/")} className="py-2">
            <Text className="text-xs font-bold text-[#78716C] underline">
              Browse Menu as Guest &rarr;
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
