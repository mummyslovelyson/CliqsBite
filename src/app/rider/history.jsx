import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRider } from "../../context/RiderContext";

export default function RiderHistoryScreen() {
  const router = useRouter();
  const { deliveryHistory } = useRider();

  // Selected delivery for proof & details modal
  const [selectedDelivery, setSelectedDelivery] = useState(null);

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
          Delivery History
        </Text>

        <View className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center">
          <Text className="text-sm font-black text-[#FF6000]">
            {deliveryHistory.length}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
      >
        {/* Summary Card */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-xs font-black uppercase tracking-wider text-[#A8A29E]">
              COMPLETED ORDERS
            </Text>
            <Text className="text-2xl font-black text-[#1C1917] mt-1">
              {deliveryHistory.length} Delivered
            </Text>
            <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
              100% Customer OTP Verification rate
            </Text>
          </View>

          <View className="w-14 h-14 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] items-center justify-center">
            <Ionicons name="shield-checkmark" size={28} color="#16A34A" />
          </View>
        </View>

        {/* History List or Clean Empty State */}
        {deliveryHistory.length === 0 ? (
          <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-8 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-[#FAF4EB] items-center justify-center mb-4 border border-[#EFE5D6]">
              <Feather name="clock" size={32} color="#A8A29E" />
            </View>
            <Text className="text-lg font-black text-[#1C1917] mb-1">
              No Completed Deliveries Yet
            </Text>
            <Text className="text-xs text-[#78716C] text-center max-w-[280px] leading-5 font-medium mb-5">
              Completed food drop-offs, customer OTP confirmations, and proof photos will be safely archived here.
            </Text>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/rider")}
              className="bg-[#FF6000] px-6 py-3.5 rounded-full"
            >
              <Text className="text-sm font-black text-white">Find Active Requests</Text>
            </TouchableOpacity>
          </View>
        ) : (
          deliveryHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => setSelectedDelivery(item)}
              className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-4"
            >
              {/* Header */}
              <View className="flex-row items-center justify-between pb-3 border-b border-[#F5EDE1] mb-3">
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-base font-black text-[#1C1917] mr-2">
                      Order #{item.id}
                    </Text>
                    <View className="bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                      <Text className="text-[10px] font-black text-[#16A34A] uppercase">
                        DELIVERED
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                    Delivered at {item.completedAt}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-base font-black text-[#16A34A]">
                    + GH₵ {item.payout.toFixed(2)}
                  </Text>
                  <Text className="text-[10px] font-bold text-[#78716C]">Settled</Text>
                </View>
              </View>

              {/* Customer info & Address */}
              <View className="mb-3">
                <View className="flex-row items-center mb-1">
                  <Feather name="user" size={14} color="#78716C" />
                  <Text className="text-xs font-bold text-[#1C1917] ml-2">
                    {item.customerName}
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Feather name="map-pin" size={14} color="#FF6000" className="mt-0.5" />
                  <Text className="text-xs text-[#57534E] ml-2 flex-1 font-medium leading-4">
                    {item.customerAddress}
                  </Text>
                </View>
              </View>

              {/* Badges footer */}
              <View className="flex-row items-center justify-between pt-2.5 border-t border-[#F5EDE1]">
                <View className="flex-row items-center">
                  <View className="flex-row items-center bg-[#FAF4EB] px-2.5 py-1 rounded-full mr-2">
                    <Ionicons name="key" size={12} color="#16A34A" />
                    <Text className="text-[11px] font-bold text-[#16A34A] ml-1">
                      OTP Verified
                    </Text>
                  </View>

                  {item.proofPhoto && (
                    <View className="flex-row items-center bg-[#FAF4EB] px-2.5 py-1 rounded-full">
                      <Feather name="camera" size={12} color="#FF6000" />
                      <Text className="text-[11px] font-bold text-[#FF6000] ml-1">
                        Photo Attached
                      </Text>
                    </View>
                  )}
                </View>

                <Text className="text-xs font-bold text-[#FF6000]">
                  Inspect Proof &rarr;
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Proof of Delivery Details Modal */}
      <Modal visible={!!selectedDelivery} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6] max-h-[85%]">
            {selectedDelivery && (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-lg font-black text-[#1C1917]">
                      Proof of Delivery
                    </Text>
                    <Text className="text-xs text-[#78716C] font-semibold">
                      Order #{selectedDelivery.id} • Completed at {selectedDelivery.completedAt}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedDelivery(null)} className="p-1">
                    <Feather name="x" size={22} color="#78716C" />
                  </TouchableOpacity>
                </View>

                {/* Delivery Verification Badges */}
                <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-[#EFE5D6]">
                    <Text className="text-xs font-bold text-[#78716C]">Customer Name</Text>
                    <Text className="text-sm font-bold text-[#1C1917]">{selectedDelivery.customerName}</Text>
                  </View>

                  <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-[#EFE5D6]">
                    <Text className="text-xs font-bold text-[#78716C]">4-Digit OTP Code</Text>
                    <Text className="text-sm font-black text-[#16A34A]">{selectedDelivery.customerOtp || "5824"} (Verified)</Text>
                  </View>

                  <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-[#EFE5D6]">
                    <Text className="text-xs font-bold text-[#78716C]">Payout Credited</Text>
                    <Text className="text-sm font-black text-[#16A34A]">GH₵ {selectedDelivery.payout.toFixed(2)}</Text>
                  </View>

                  <View className="flex-row items-start justify-between">
                    <Text className="text-xs font-bold text-[#78716C]">Drop-off Address</Text>
                    <Text className="text-xs font-bold text-[#1C1917] text-right flex-1 ml-4">{selectedDelivery.customerAddress}</Text>
                  </View>
                </View>

                {/* Photo Proof */}
                {selectedDelivery.proofPhoto ? (
                  <View className="mb-4">
                    <Text className="text-xs font-black uppercase tracking-wider text-[#A8A29E] mb-2">
                      Doorstep Handover Photo Proof
                    </Text>
                    <Image
                      source={{ uri: selectedDelivery.proofPhoto }}
                      className="w-full h-44 rounded-2xl bg-neutral-200"
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-4 items-center">
                    <Feather name="check-circle" size={24} color="#16A34A" className="mb-1" />
                    <Text className="text-xs font-bold text-[#1C1917]">
                      Direct Handover Confirmed via OTP
                    </Text>
                    <Text className="text-[11px] text-[#78716C] text-center mt-0.5">
                      No photo required when customer personally provides 4-digit verification code.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => setSelectedDelivery(null)}
                  className="w-full bg-[#1C1917] py-4 rounded-full items-center justify-center"
                >
                  <Text className="text-sm font-black text-white">Close Record</Text>
                </TouchableOpacity>
              </>
            )}
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
            className="items-center px-2 py-1"
          >
            <Feather name="clock" size={20} color="#FF6000" />
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
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
            onPress={() => router.push("/rider/profile")}
            className="items-center px-2 py-1"
          >
            <Feather name="user" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
