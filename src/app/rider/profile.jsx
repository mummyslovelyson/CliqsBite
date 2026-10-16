import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRider } from "../../context/RiderContext";

export default function RiderProfileScreen() {
  const router = useRouter();
  const { riderProfile, updateProfile } = useRider();

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(riderProfile.name);
  const [phoneInput, setPhoneInput] = useState(riderProfile.phone);
  const [vehicleModelInput, setVehicleModelInput] = useState(riderProfile.vehicleModel);
  const [plateNumberInput, setPlateNumberInput] = useState(riderProfile.plateNumber);

  const handleSaveProfile = () => {
    if (!nameInput.trim() || !phoneInput.trim()) {
      Alert.alert("Missing Information", "Please enter your full name and phone number.");
      return;
    }

    updateProfile({
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      vehicleModel: vehicleModelInput.trim(),
      plateNumber: plateNumberInput.trim(),
    });

    setEditModalVisible(false);
    Alert.alert("Profile Updated", "Your rider details have been saved.");
  };

  const handleCallSupport = () => {
    Alert.alert(
      "CliqsBite Dispatch Control",
      "Calling 24/7 Rider Hotline (+233 30 200 9988)...",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call Now", onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/rider")}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-[#1C1917] tracking-tight">
          Rider Profile
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setEditModalVisible(true)}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="edit-2" size={18} color="#1C1917" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
      >
        {/* Profile Identity Card */}
        <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-5 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-16 h-16 rounded-full bg-[#1C1917] items-center justify-center mr-4 border-2 border-[#FAF4EB]">
              <MaterialCommunityIcons name="moped" size={32} color="#FF6000" />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center mb-0.5">
                <Text className="text-lg font-black text-[#1C1917] mr-2">
                  {riderProfile.name}
                </Text>
              </View>

              <Text className="text-sm text-[#78716C] font-semibold">
                {riderProfile.phone}
              </Text>

              {/* Status Pill */}
              <View className="mt-2 flex-row items-center">
                <View className="bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#BBF7D0] flex-row items-center">
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text className="text-[11px] font-black text-[#16A34A] ml-1 uppercase">
                    {riderProfile.isApproved ? "Approved by Admin" : "Pending Verification"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Rider Ratings & Satisfaction Section */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3">
            Customer Ratings &amp; Trust
          </Text>

          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-[#F5EDE1]">
            <View className="items-center mr-6">
              <Text className="text-4xl font-black text-[#1C1917]">
                {riderProfile.rating}
              </Text>
              <View className="flex-row items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={14} color="#F59E0B" />
                ))}
              </View>
              <Text className="text-xs font-bold text-[#78716C] mt-1">
                {riderProfile.totalReviews} customer ratings
              </Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-[#1C1917]">On-Time Speed</Text>
                <Text className="text-xs font-black text-[#16A34A]">98%</Text>
              </View>
              <View className="w-full h-2 rounded-full bg-[#FAF4EB] mb-2.5 overflow-hidden">
                <View className="w-[98%] h-full bg-[#16A34A] rounded-full" />
              </View>

              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-[#1C1917]">Food Temperature</Text>
                <Text className="text-xs font-black text-[#16A34A]">100%</Text>
              </View>
              <View className="w-full h-2 rounded-full bg-[#FAF4EB] mb-2.5 overflow-hidden">
                <View className="w-[100%] h-full bg-[#16A34A] rounded-full" />
              </View>

              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-[#1C1917]">Customer Politeness</Text>
                <Text className="text-xs font-black text-[#16A34A]">99%</Text>
              </View>
              <View className="w-full h-2 rounded-full bg-[#FAF4EB] overflow-hidden">
                <View className="w-[99%] h-full bg-[#16A34A] rounded-full" />
              </View>
            </View>
          </View>

          <Text className="text-xs text-[#78716C] italic">
            Customer feedback is monitored in real-time by CliqsBite dispatch to calculate priority order assignments.
          </Text>
        </View>

        {/* Vehicle & Equipment Details */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E]">
              Vehicle &amp; Gear
            </Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
              <Text className="text-xs font-bold text-[#FF6000]">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-[#F5EDE1]">
            <Text className="text-xs font-bold text-[#78716C]">Vehicle Type</Text>
            <Text className="text-sm font-bold text-[#1C1917]">{riderProfile.vehicleType}</Text>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-[#F5EDE1]">
            <Text className="text-xs font-bold text-[#78716C]">Make &amp; Model</Text>
            <Text className="text-sm font-bold text-[#1C1917]">{riderProfile.vehicleModel}</Text>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-[#F5EDE1]">
            <Text className="text-xs font-bold text-[#78716C]">Plate Number</Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] px-2.5 py-0.5 rounded">
              <Text className="text-xs font-black text-[#1C1917]">{riderProfile.plateNumber}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-2.5">
            <Text className="text-xs font-bold text-[#78716C]">Thermal Bag Inspected</Text>
            <Text className="text-sm font-black text-[#16A34A]">Passed ✓</Text>
          </View>
        </View>

        {/* Admin Verification & Document Checklist */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3">
            Admin Verification Checklist
          </Text>

          <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#DCFCE7] items-center justify-center mr-3">
                <Ionicons name="checkmark-done" size={18} color="#16A34A" />
              </View>
              <View>
                <Text className="text-sm font-bold text-[#1C1917]">Ghana Card (NIA)</Text>
                <Text className="text-xs text-[#78716C]">{riderProfile.ghanaCard}</Text>
              </View>
            </View>
            <Text className="text-xs font-black text-[#16A34A]">VERIFIED</Text>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#DCFCE7] items-center justify-center mr-3">
                <Ionicons name="checkmark-done" size={18} color="#16A34A" />
              </View>
              <View>
                <Text className="text-sm font-bold text-[#1C1917]">Driver&apos;s License (DVLA)</Text>
                <Text className="text-xs text-[#78716C]">{riderProfile.licenseNumber}</Text>
              </View>
            </View>
            <Text className="text-xs font-black text-[#16A34A]">ACTIVE</Text>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#DCFCE7] items-center justify-center mr-3">
                <Ionicons name="checkmark-done" size={18} color="#16A34A" />
              </View>
              <View>
                <Text className="text-sm font-bold text-[#1C1917]">Police Background Clearance</Text>
                <Text className="text-xs text-[#78716C]">CID Headquarters, Accra</Text>
              </View>
            </View>
            <Text className="text-xs font-black text-[#16A34A]">PASSED</Text>
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#DCFCE7] items-center justify-center mr-3">
                <Ionicons name="checkmark-done" size={18} color="#16A34A" />
              </View>
              <View>
                <Text className="text-sm font-bold text-[#1C1917]">Food Hygiene &amp; Safety</Text>
                <Text className="text-xs text-[#78716C]">Certified Delivery Partner</Text>
              </View>
            </View>
            <Text className="text-xs font-black text-[#16A34A]">PASSED</Text>
          </View>
        </View>

        {/* Emergency SOS & Dispatch Support */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCallSupport}
          className="bg-white border border-[#FEE2E2] rounded-[24px] p-4 flex-row items-center justify-between mb-3"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-10 h-10 rounded-xl bg-[#FEF2F2] items-center justify-center mr-3">
              <Feather name="phone-call" size={20} color="#DC2626" />
            </View>
            <View>
              <Text className="text-base font-black text-[#DC2626]">
                Rider Dispatch SOS Hotline
              </Text>
              <Text className="text-xs text-[#78716C] font-medium">
                Live accident, flat tyre or route support
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color="#A8A29E" />
        </TouchableOpacity>

        {/* Switch back to Customer mode button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/")}
          className="bg-[#1C1917] rounded-[24px] p-4 flex-row items-center justify-center"
        >
          <Feather name="shopping-bag" size={18} color="#ffffff" className="mr-2" />
          <Text className="text-sm font-black text-white ml-2">Switch to Customer Storefront</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">
                Edit Rider Details
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1 uppercase tracking-wider">
              Full Name
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-3">
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1 uppercase tracking-wider">
              Phone Number
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-3">
              <TextInput
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1 uppercase tracking-wider">
              Motorcycle / Vehicle Model
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-3">
              <TextInput
                value={vehicleModelInput}
                onChangeText={setVehicleModelInput}
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1 uppercase tracking-wider">
              Plate Number
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-5">
              <TextInput
                value={plateNumberInput}
                onChangeText={setPlateNumberInput}
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSaveProfile}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Save Rider Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              className="w-full py-2.5 items-center justify-center"
            >
              <Text className="text-sm font-bold text-[#78716C]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Bottom Navigation */}
      <View className="absolute bottom-4 left-5 right-5">
        <View className="bg-white border border-[#EFE5D6] rounded-full py-2.5 px-6 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider")}
            className="items-center px-2 py-1"
          >
            <MaterialCommunityIcons name="moped" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/earnings")}
            className="items-center px-2 py-1"
          >
            <MaterialCommunityIcons name="cash-multiple" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Earnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/history")}
            className="items-center px-2 py-1"
          >
            <Feather name="clock" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/support")}
            className="items-center px-2 py-1"
          >
            <Feather name="shield" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="items-center px-2 py-1"
          >
            <Feather name="user" size={20} color="#FF6000" />
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
