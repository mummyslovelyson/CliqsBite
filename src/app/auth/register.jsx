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
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCart } from "../../context/CartContext";

const LOGO_IMG = require("../../../assets/images/logo.jpg");

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signupUser } = useCart();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const handleRegister = () => {
    signupUser({
      id: `cust-${Date.now()}`,
      name: fullName.trim() || "CliqsBite Customer",
      email: email.trim() || "customer@cliqsbite.com",
      phone: phone.trim() || "+233 24 000 0000",
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
        {/* Header Branding */}
        <View className="items-center mb-6">
          <View style={{ width: 72, height: 72, borderRadius: 36, overflow: "hidden", backgroundColor: "#EE5A05" }} className="mb-2.5 border-2 border-white">
            <Image
              source={LOGO_IMG}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <Text className="text-2xl font-black italic tracking-tight text-[#FF6000]">
            CliqsBite
          </Text>
          <Text className="text-xs font-semibold text-[#78716C]">
            Create an Account to Start Ordering
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
          <Text className="text-lg font-black text-[#1C1917] mb-4">
            Sign Up 🚀
          </Text>

          {/* Full Name */}
          <View className="mb-3.5">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Full Name
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5">
              <Feather name="user" size={16} color="#78716C" />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#A8A29E"
                className="flex-1 ml-3 text-xs font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-3.5">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Phone Number
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5">
              <Feather name="phone" size={16} color="#78716C" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                className="flex-1 ml-3 text-xs font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-3.5">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Email Address
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5">
              <Feather name="mail" size={16} color="#78716C" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#A8A29E"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-xs font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-3.5">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Password
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5">
              <Feather name="lock" size={16} color="#78716C" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password (min 6 characters)"
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

          {/* Confirm Password */}
          <View className="mb-4">
            <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5">
              <Feather name="check-circle" size={16} color="#78716C" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor="#A8A29E"
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 text-xs font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Terms Agreement Checkbox */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAgreed(!agreed)}
            className="flex-row items-center mb-5"
          >
            <View
              className={`w-4 h-4 rounded border items-center justify-center mr-2.5 ${
                agreed ? "bg-[#FF6000] border-[#FF6000]" : "border-[#A8A29E] bg-white"
              }`}
            >
              {agreed && <Feather name="check" size={11} color="#ffffff" />}
            </View>
            <Text className="text-[11px] text-[#78716C] flex-1 leading-4">
              I agree to the <Text className="font-bold text-[#1C1917]">Terms of Service</Text> &amp; <Text className="font-bold text-[#1C1917]">Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleRegister}
            className="w-full bg-[#FF6000] py-3.5 rounded-full items-center justify-center"
          >
            <Text className="text-sm font-black text-white">Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center">
          <Text className="text-xs text-[#78716C]">Already have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth/login",
                params: params.redirect ? { redirect: params.redirect } : {},
              })
            }
          >
            <Text className="text-xs font-black text-[#FF6000]">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
