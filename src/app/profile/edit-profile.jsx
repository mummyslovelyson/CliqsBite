import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function EditProfileScreen() {
  const router = useRouter();

  // User fields (clean state, no mock data)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);

  // Modals
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpTarget, setOtpTarget] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isVerified, setIsVerified] = useState({ email: false, phone: false });

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const handleSaveProfile = () => {
    Alert.alert("Profile Updated", "Your account information has been saved successfully.");
  };

  const handlePickAvatar = () => {
    Alert.alert(
      "Profile Photo",
      "Choose a source for your profile picture",
      [
        { text: "Take Photo", onPress: () => setAvatarUri("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80") },
        { text: "Choose from Gallery", onPress: () => setAvatarUri("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80") },
        { text: "Remove Photo", style: "destructive", onPress: () => setAvatarUri(null) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleTriggerOtp = (targetType) => {
    const value = targetType === "email" ? email : phone;
    if (!value || value.trim().length === 0) {
      Alert.alert("Missing Detail", `Please enter your ${targetType} before requesting verification.`);
      return;
    }
    setOtpTarget(targetType);
    setOtpCode("");
    setOtpModalVisible(true);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length < 4) {
      Alert.alert("Invalid Code", "Please enter the 4-digit code sent to your device.");
      return;
    }
    setIsVerified((prev) => ({ ...prev, [otpTarget]: true }));
    setOtpModalVisible(false);
    Alert.alert("Verified ✓", `Your ${otpTarget} has been verified successfully.`);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }
    setPasswordModalVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Alert.alert("Success", "Your password has been changed successfully.");
  };

  const handleConfirmDelete = () => {
    setDeleteModalVisible(false);
    Alert.alert(
      "Request Submitted",
      "Your account deletion request has been scheduled. Your personal records and points will be deactivated within 48 hours.",
      [{ text: "OK", onPress: () => router.replace("/auth/login") }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-[#1C1917] tracking-tight">
          Account &amp; Profile
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSaveProfile}
          className="px-4 py-2 bg-[#FF6000] rounded-xl"
        >
          <Text className="text-sm font-black text-white">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Photo Upload Section */}
        <View className="items-center mb-6">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-[#FFF3EB] border-2 border-[#FED7AA] items-center justify-center overflow-hidden">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <Feather name="user" size={46} color="#FF6000" />
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickAvatar}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#FF6000] items-center justify-center border-2 border-[#FAF4EB]"
            >
              <Feather name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handlePickAvatar} className="mt-3">
            <Text className="text-sm font-bold text-[#FF6000]">Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Details Form */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-4">
            Personal Information
          </Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-[#78716C] mb-1.5">Full Name</Text>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
              <Feather name="user" size={18} color="#78716C" />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor="#A8A29E"
                className="flex-1 ml-3 text-base font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Email Address */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-sm font-bold text-[#78716C]">Email Address</Text>
              {isVerified.email ? (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                  <Text className="text-xs font-bold text-[#16A34A] ml-1">Verified</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleTriggerOtp("email")}>
                  <Text className="text-xs font-bold text-[#FF6000]">Verify via OTP</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
              <Feather name="mail" size={18} color="#78716C" />
              <TextInput
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setIsVerified((prev) => ({ ...prev, email: false }));
                }}
                placeholder="Enter email address"
                placeholderTextColor="#A8A29E"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-base font-bold text-[#1C1917]"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-sm font-bold text-[#78716C]">Phone Number</Text>
              {isVerified.phone ? (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                  <Text className="text-xs font-bold text-[#16A34A] ml-1">Verified</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleTriggerOtp("phone")}>
                  <Text className="text-xs font-bold text-[#FF6000]">Verify via OTP</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
              <Feather name="phone" size={18} color="#78716C" />
              <TextInput
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  setIsVerified((prev) => ({ ...prev, phone: false }));
                }}
                placeholder="+233 24 000 0000"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                className="flex-1 ml-3 text-base font-bold text-[#1C1917]"
              />
            </View>
          </View>
        </View>

        {/* Security / Password Section */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-3">
            Security &amp; Credentials
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPasswordModalVisible(true)}
            className="flex-row items-center justify-between py-2.5"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                <Feather name="lock" size={18} color="#FF6000" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#1C1917]">Change Password</Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Protect your order &amp; wallet security</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#A8A29E" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone: Account Deletion */}
        <View className="bg-white border border-[#FEE2E2] rounded-[24px] p-5 mb-4">
          <Text className="text-sm font-black uppercase tracking-wider text-[#DC2626] mb-1.5">
            Account Management
          </Text>
          <Text className="text-xs text-[#78716C] mb-3 font-medium">
            Once submitted, your order history, delivery addresses, and loyalty rewards will be permanently deleted.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDeleteModalVisible(true)}
            className="flex-row items-center justify-between py-2.5"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#FEF2F2] items-center justify-center mr-3">
                <Feather name="trash-2" size={18} color="#DC2626" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#DC2626]">
                  Delete Account Request
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Permanent deactivation</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP Verification Modal */}
      <Modal visible={otpModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">
                Verify {otpTarget === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <TouchableOpacity onPress={() => setOtpModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-[#78716C] mb-4 font-medium">
              We sent a 4-digit verification code to{" "}
              <Text className="font-bold text-[#1C1917]">
                {otpTarget === "email" ? email : phone}
              </Text>
            </Text>

            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-4">
              <TextInput
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="• • • •"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
                maxLength={4}
                className="text-2xl font-black text-[#1C1917] text-center tracking-[10px]"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleVerifyOtp}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center mb-3"
            >
              <Text className="text-sm font-black text-white">Confirm OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert("Code Resent", "A new verification code has been dispatched.")}
              className="items-center py-2"
            >
              <Text className="text-xs font-bold text-[#78716C]">
                Didn&apos;t receive code? <Text className="text-[#FF6000]">Resend in 30s</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <View className="mb-3.5">
              <Text className="text-sm font-bold text-[#78716C] mb-1.5">Current Password</Text>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#A8A29E"
                  secureTextEntry={!showPassword}
                  className="text-base font-bold text-[#1C1917]"
                />
              </View>
            </View>

            <View className="mb-3.5">
              <Text className="text-sm font-bold text-[#78716C] mb-1.5">New Password</Text>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#A8A29E"
                  secureTextEntry={!showPassword}
                  className="text-base font-bold text-[#1C1917]"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-bold text-[#78716C] mb-1.5">Confirm New Password</Text>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat new password"
                  placeholderTextColor="#A8A29E"
                  secureTextEntry={!showPassword}
                  className="text-base font-bold text-[#1C1917]"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="flex-row items-center mb-5"
            >
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#78716C" />
              <Text className="text-xs text-[#78716C] ml-2 font-medium">Show passwords</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleChangePassword}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-white">Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Account Deletion Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#DC2626]">
                Confirm Account Deletion
              </Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-[#78716C] leading-6 mb-4 font-medium">
              Are you sure you want to permanently delete your CliqsBite account? All pending rewards and delivery records will be erased.
            </Text>

            <View className="mb-5">
              <Text className="text-sm font-bold text-[#78716C] mb-1.5">
                Reason for leaving (Optional)
              </Text>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                <TextInput
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  placeholder="Tell us how we can improve..."
                  placeholderTextColor="#A8A29E"
                  className="text-base font-medium text-[#1C1917]"
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmDelete}
              className="w-full bg-[#DC2626] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Permanently Delete Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              className="w-full py-3 items-center justify-center"
            >
              <Text className="text-sm font-bold text-[#78716C]">Keep My Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
