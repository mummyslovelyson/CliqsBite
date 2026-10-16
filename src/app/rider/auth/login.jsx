import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRider } from "../../../context/RiderContext";

const LOGO_IMG = require("../../../../assets/images/logo.jpg");

export default function RiderLoginScreen() {
  const router = useRouter();
  const { riderProfile } = useRider();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRiderLogin = () => {
    if (!emailOrPhone.trim()) {
      Alert.alert("Missing Input", "Please enter your registered rider phone or email.");
      return;
    }

    if (riderProfile.verificationStatus === "pending_verification") {
      Alert.alert(
        "Application Under Review ⏳",
        "Your rider registration is awaiting administrator verification. You cannot accept deliveries until approved.",
        [
          { text: "View Application Status", onPress: () => router.push("/rider/auth/status") },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }

    if (riderProfile.verificationStatus === "rejected") {
      Alert.alert(
        "Application Requires Attention",
        "An administrator rejected one or more submitted documents. Please check your status to resubmit.",
        [
          { text: "Review Issues", onPress: () => router.push("/rider/auth/status") },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    // Approved: enter rider portal
    router.replace("/rider");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 20 }}
      >
        {/* Brand Logo & Rider Badge */}
        <View className="items-center mb-8">
          <View style={{ width: 84, height: 84, borderRadius: 42, overflow: "hidden", backgroundColor: "#1C1917", elevation: 2 }} className="mb-3.5 border-2 border-white items-center justify-center">
            <Image
              source={LOGO_IMG}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <View className="bg-[#1C1917] px-3.5 py-1 rounded-full flex-row items-center mb-1">
            <MaterialCommunityIcons name="moped" size={16} color="#FF6000" />
            <Text className="text-xs font-black text-white ml-1.5 uppercase tracking-wider">
              RIDER WORKSPACE
            </Text>
          </View>
          <Text className="text-xl font-black text-[#1C1917] text-center">
            Sign In to Start Delivering
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5 text-center">
            CliqsBite Fleet Operations • Accra Dispatch Hub
          </Text>
        </View>

        {/* Card Form */}
        <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
          <Text className="text-lg font-black text-[#1C1917] mb-1">
            Welcome, Rider! 🛵
          </Text>
          <Text className="text-xs text-[#78716C] mb-5">
            Log in to your delivery workspace to view orders and earn daily payouts.
          </Text>

          {/* Email or Phone Input */}
          <View className="mb-4">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Rider Phone or Email
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-3">
              <Feather name="phone" size={17} color="#78716C" />
              <TextInput
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                placeholder="e.g. 024 111 2233"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                autoCapitalize="none"
                className="flex-1 ml-3 text-sm font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Password
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-3">
              <Feather name="lock" size={17} color="#78716C" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#A8A29E"
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 text-sm font-bold text-[#1C1917]"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={16}
                  color="#78716C"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Check application status link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/auth/status")}
            className="mb-5 self-end"
          >
            <Text className="text-xs font-bold text-[#FF6000]">
              Check Application Status &rarr;
            </Text>
          </TouchableOpacity>

          {/* Submit Sign In Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleRiderLogin}
            className="w-full bg-[#16A34A] py-4 rounded-full items-center justify-center mb-3"
          >
            <Text className="text-sm font-black text-white">Sign In to Rider Portal</Text>
          </TouchableOpacity>
        </View>

        {/* Footer: Register as Rider or Switch to Customer */}
        <View className="items-center">
          <View className="flex-row items-center mb-3">
            <Text className="text-xs text-[#78716C]">New to the fleet? </Text>
            <TouchableOpacity onPress={() => router.push("/rider/auth/register")}>
              <Text className="text-xs font-black text-[#FF6000]">Become a Rider</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/auth/role-select")}
            className="py-1"
          >
            <Text className="text-xs font-bold text-[#78716C] underline">
              Switch to Customer Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
