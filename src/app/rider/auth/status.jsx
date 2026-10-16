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
import { useRider } from "../../../context/RiderContext";

export default function RiderStatusScreen() {
  const router = useRouter();
  const { riderProfile, setAdminApprovalStatus } = useRider();

  const status = riderProfile.verificationStatus || (riderProfile.isApproved ? "approved" : "pending_verification");

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/rider/auth/login")}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-[#1C1917] tracking-tight">
          Application Status
        </Text>

        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Status Card Banner */}
        <View className={`rounded-[28px] p-6 mb-5 border ${
          status === "approved"
            ? "bg-[#16A34A] border-[#16A34A]"
            : status === "rejected"
            ? "bg-[#DC2626] border-[#DC2626]"
            : "bg-[#1C1917] border-[#1C1917]"
        }`}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                {status === "approved" ? (
                  <Ionicons name="checkmark-done-circle" size={24} color="#ffffff" />
                ) : status === "rejected" ? (
                  <Feather name="alert-triangle" size={22} color="#ffffff" />
                ) : (
                  <Feather name="clock" size={22} color="#ffffff" />
                )}
              </View>
              <View>
                <Text className="text-xs font-black uppercase tracking-wider text-white/80">
                  VERIFICATION STATUS
                </Text>
                <Text className="text-xl font-black text-white">
                  {status === "approved"
                    ? "Approved & Verified"
                    : status === "rejected"
                    ? "Action Required"
                    : "Under Review ⏳"}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-xs text-white/90 leading-5 font-medium mb-4">
            {status === "approved"
              ? "Congratulations! Your background checks, documents and vehicle inspection have been verified by CliqsBite Operations."
              : status === "rejected"
              ? riderProfile.approvalNotes || "Your application was not approved. Please review the missing requirements below and resubmit."
              : "Your documents are currently undergoing review by the CliqsBite safety team. Approvals usually take 2 to 24 hours."}
          </Text>

          {status === "approved" ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.replace("/rider")}
              className="w-full bg-white py-3.5 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-[#16A34A]">
                Launch Rider Workspace &rarr;
              </Text>
            </TouchableOpacity>
          ) : status === "rejected" ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/rider/auth/register")}
              className="w-full bg-white py-3.5 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-[#DC2626]">
                Resubmit Rejected Documents
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Verification Checklist */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3">
            Admin Verification Checklist
          </Text>

          {/* 1. Ghana Card */}
          <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
            <View className="flex-row items-center flex-1 mr-2">
              <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
                status === "approved" ? "bg-[#DCFCE7]" : "bg-[#FFF3EB]"
              }`}>
                <Ionicons
                  name={status === "approved" ? "checkmark-circle" : "time"}
                  size={18}
                  color={status === "approved" ? "#16A34A" : "#FF6000"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1C1917]">Ghana Card (NIA PIN)</Text>
                <Text className="text-xs text-[#78716C]">{riderProfile.ghanaCard || "GHA-718293041-9"}</Text>
              </View>
            </View>
            <Text className={`text-xs font-black ${status === "approved" ? "text-[#16A34A]" : "text-[#FF6000]"}`}>
              {status === "approved" ? "PASSED" : "VERIFYING"}
            </Text>
          </View>

          {/* 2. Driver's License */}
          <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
            <View className="flex-row items-center flex-1 mr-2">
              <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
                status === "approved" ? "bg-[#DCFCE7]" : "bg-[#FFF3EB]"
              }`}>
                <Ionicons
                  name={status === "approved" ? "checkmark-circle" : "time"}
                  size={18}
                  color={status === "approved" ? "#16A34A" : "#FF6000"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1C1917]">DVLA Driver&apos;s License</Text>
                <Text className="text-xs text-[#78716C]">{riderProfile.licenseNumber || "DL-GH-890214"}</Text>
              </View>
            </View>
            <Text className={`text-xs font-black ${status === "approved" ? "text-[#16A34A]" : "text-[#FF6000]"}`}>
              {status === "approved" ? "PASSED" : "VERIFYING"}
            </Text>
          </View>

          {/* 3. Police CID Check */}
          <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
            <View className="flex-row items-center flex-1 mr-2">
              <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
                status === "approved" ? "bg-[#DCFCE7]" : "bg-[#FFF3EB]"
              }`}>
                <Ionicons
                  name={status === "approved" ? "checkmark-circle" : "time"}
                  size={18}
                  color={status === "approved" ? "#16A34A" : "#FF6000"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1C1917]">Police Criminal Clearance</Text>
                <Text className="text-xs text-[#78716C]">CID HQ Background check</Text>
              </View>
            </View>
            <Text className={`text-xs font-black ${status === "approved" ? "text-[#16A34A]" : "text-[#FF6000]"}`}>
              {status === "approved" ? "PASSED" : "IN REVIEW"}
            </Text>
          </View>

          {/* 4. Thermal Bag & Gear */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
                status === "approved" ? "bg-[#DCFCE7]" : "bg-[#FFF3EB]"
              }`}>
                <Ionicons
                  name={status === "approved" ? "checkmark-circle" : "time"}
                  size={18}
                  color={status === "approved" ? "#16A34A" : "#FF6000"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1C1917]">Thermal Bag &amp; Helmet Check</Text>
                <Text className="text-xs text-[#78716C]">East Legon Dispatch Hub visit</Text>
              </View>
            </View>
            <Text className={`text-xs font-black ${status === "approved" ? "text-[#16A34A]" : "text-[#FF6000]"}`}>
              {status === "approved" ? "PASSED" : "PENDING"}
            </Text>
          </View>
        </View>

        {/* Administrator Approval Testing Control Panel */}
        <View className="bg-white border-2 border-dashed border-[#FF6000] rounded-[24px] p-5 mb-5">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="shield-account" size={20} color="#FF6000" />
            <Text className="text-sm font-black text-[#1C1917] ml-2">
              Platform Admin Simulation Controls
            </Text>
          </View>
          <Text className="text-xs text-[#78716C] mb-4 font-medium leading-5">
            Test how the mobile interface behaves when an administrator approves, rejects, or puts this rider on hold:
          </Text>

          <View className="flex-row mb-2.5">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setAdminApprovalStatus("approved");
                Alert.alert("Admin Approved", "Rider has been approved! Dashboard and live requests unlocked.");
              }}
              className="flex-1 bg-[#16A34A] py-3 rounded-2xl items-center mr-2"
            >
              <Text className="text-xs font-black text-white">Approve Rider ✓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setAdminApprovalStatus("rejected");
                Alert.alert("Admin Rejected", "Rider status set to rejected (requires resubmission).");
              }}
              className="flex-1 bg-[#DC2626] py-3 rounded-2xl items-center"
            >
              <Text className="text-xs font-black text-white">Reject Rider ✗</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setAdminApprovalStatus("pending_verification");
              Alert.alert("Reset to Pending", "Rider application reset to waiting for admin review.");
            }}
            className="w-full bg-[#FAF4EB] border border-[#EFE5D6] py-2.5 rounded-2xl items-center"
          >
            <Text className="text-xs font-bold text-[#1C1917]">Reset to Pending Review</Text>
          </TouchableOpacity>
        </View>

        {/* Support or assistance */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Alert.alert("Rider Onboarding Help", "Call CliqsBite Onboarding Team (+233 30 200 1122) for fast-track verification.")}
          className="items-center py-2"
        >
          <Text className="text-xs font-bold text-[#78716C]">
            Questions about verification? <Text className="text-[#FF6000]">Contact Onboarding Support</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
