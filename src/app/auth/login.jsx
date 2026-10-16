import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCart } from "../../context/CartContext";

const LOGO_IMG = require("../../../assets/images/logo.jpg");

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { loginUser } = useCart();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = () => {
    loginUser({
      id: "cust-1",
      name: emailOrPhone.includes("@")
        ? emailOrPhone.split("@")[0]
        : "CliqsBite Customer",
      email: emailOrPhone.includes("@")
        ? emailOrPhone
        : "customer@cliqsbite.com",
      phone: !emailOrPhone.includes("@") ? emailOrPhone : "+233 24 123 4567",
      role: "customer",
    });

    if (params.redirect) {
      router.replace(params.redirect);
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 20 }}
      >
        {/* Brand Logo & Welcome */}
        <View className="items-center mb-8">
          <View style={{ width: 88, height: 88, borderRadius: 44, overflow: "hidden", backgroundColor: "#EE5A05" }} className="mb-3.5 border-2 border-white">
            <Image
              source={LOGO_IMG}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <Text className="text-2xl font-black italic tracking-tight text-[#FF6000]">
            CliqsBite
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
            Freshly Homemade Meals, Right to Your Door
          </Text>
        </View>

        {/* Card Form */}
        <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
          <Text className="text-lg font-black text-[#1C1917] mb-1">
            Welcome Back! 👋
          </Text>
          <Text className="text-xs text-[#78716C] mb-5">
            Sign in to track orders, redeem CliqsPoints &amp; order faster.
          </Text>

          {/* Email or Phone Input */}
          <View className="mb-4">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Email or Phone Number
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-3">
              <Feather name="mail" size={17} color="#78716C" />
              <TextInput
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                placeholder="Enter your email or phone number"
                placeholderTextColor="#A8A29E"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-xs font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-3">
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
                className="flex-1 ml-3 text-xs font-bold text-[#1C1917]"
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

          {/* Remember Me & Forgot Password */}
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center"
            >
              <View
                className={`w-4 h-4 rounded border items-center justify-center mr-2 ${
                  rememberMe ? "bg-[#FF6000] border-[#FF6000]" : "border-[#A8A29E] bg-white"
                }`}
              >
                {rememberMe && <Feather name="check" size={11} color="#ffffff" />}
              </View>
              <Text className="text-xs text-[#78716C] font-semibold">Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text className="text-xs font-bold text-[#FF6000]">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Sign In Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleLogin}
            className="w-full bg-[#FF6000] py-3.5 rounded-full items-center justify-center mb-4"
          >
            <Text className="text-sm font-black text-white">Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-[1px] bg-[#EFE5D6]" />
            <Text className="mx-3 text-[10px] uppercase font-bold text-[#A8A29E]">
              Or continue with
            </Text>
            <View className="flex-1 h-[1px] bg-[#EFE5D6]" />
          </View>

          {/* Social Logins */}
          <View className="flex-row mt-3">
            <TouchableOpacity
              activeOpacity={0.75}
              className="flex-1 flex-row items-center justify-center py-2.5 rounded-2xl bg-[#FAF4EB] border border-[#EFE5D6] mr-2"
            >
              <FontAwesome5 name="google" size={14} color="#EA4335" />
              <Text className="text-xs font-bold text-[#1C1917] ml-2">Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              className="flex-1 flex-row items-center justify-center py-2.5 rounded-2xl bg-[#FAF4EB] border border-[#EFE5D6]"
            >
              <FontAwesome5 name="apple" size={16} color="#1C1917" />
              <Text className="text-xs font-bold text-[#1C1917] ml-2">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer: Register & Guest */}
        <View className="items-center">
          <View className="flex-row items-center mb-2">
            <Text className="text-xs text-[#78716C]">Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/auth/register",
                  params: params.redirect ? { redirect: params.redirect } : {},
                })
              }
            >
              <Text className="text-xs font-black text-[#FF6000]">Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.replace("/")} className="py-1 mb-2">
            <Text className="text-xs font-semibold text-[#78716C] underline">
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/rider/auth/login")}
            className="bg-[#1C1917] px-4 py-2 rounded-full mt-1 flex-row items-center"
          >
            <Text className="text-xs font-black text-white mr-1.5">Are you a Rider?</Text>
            <Text className="text-xs font-bold text-[#FF6000]">Rider Sign In &rarr;</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
