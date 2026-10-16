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
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSendCode = () => {
    if (contact.trim().length > 0) {
      setCodeSent(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between border-b border-[#EFE5D6]">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <Text className="text-lg font-black text-[#1C1917]">
          Reset Password
        </Text>
        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 20 }}
      >
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mb-3">
            <Feather name="key" size={28} color="#FF6000" />
          </View>
          <Text className="text-xl font-black text-[#1C1917] text-center mb-1">
            Forgot Password?
          </Text>
          <Text className="text-xs text-[#78716C] text-center max-w-[260px] leading-5">
            Enter your registered email address or phone number, and we will send you a verification code.
          </Text>
        </View>

        <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
          {!codeSent ? (
            <>
              <View className="mb-5">
                <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Email or Phone Number
                </Text>
                <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-3">
                  <Feather name="mail" size={16} color="#78716C" />
                  <TextInput
                    value={contact}
                    onChangeText={setContact}
                    placeholder="Enter email or phone number"
                    placeholderTextColor="#A8A29E"
                    className="flex-1 ml-3 text-xs font-bold text-[#1C1917]"
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSendCode}
                className="w-full bg-[#FF6000] py-3.5 rounded-full items-center justify-center"
              >
                <Text className="text-sm font-black text-white">Send Reset Code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mb-3 self-center">
                <Ionicons name="checkmark" size={20} color="#16A34A" />
              </View>
              <Text className="text-xs text-[#16A34A] font-bold text-center mb-4">
                Code sent to {contact}!
              </Text>

              <View className="mb-4">
                <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Enter 6-Digit OTP Code
                </Text>
                <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-3">
                  <Feather name="shield" size={16} color="#78716C" />
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#A8A29E"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="flex-1 ml-3 text-base font-black tracking-widest text-[#1C1917]"
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.replace("/auth/login")}
                className="w-full bg-[#FF6000] py-3.5 rounded-full items-center justify-center mb-2.5"
              >
                <Text className="text-sm font-black text-white">Verify &amp; Set New Password</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCodeSent(false)} className="items-center py-1">
                <Text className="text-xs text-[#78716C]">Resend Code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/auth/login")}
          className="items-center py-2"
        >
          <Text className="text-xs font-bold text-[#FF6000]">Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
