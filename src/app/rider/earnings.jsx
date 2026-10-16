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

export default function RiderEarningsScreen() {
  const router = useRouter();
  const { earnings, deliveryHistory, riderProfile } = useRider();

  // Active time tab filter
  const [activeTab, setActiveTab] = useState("today"); // "today" | "week" | "month"

  // Cashout Modal state
  const [cashoutModalVisible, setCashoutModalVisible] = useState(false);
  const [cashoutNetwork, setCashoutNetwork] = useState("MTN MoMo");
  const [momoNumber, setMomoNumber] = useState(riderProfile.phone || "");
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  // Compute stats according to tab
  const currentTotal =
    activeTab === "today"
      ? earnings.today
      : activeTab === "week"
      ? earnings.week
      : earnings.month;

  const currentCount = deliveryHistory.length;
  const averagePerDrop = currentCount > 0 ? (currentTotal / currentCount).toFixed(2) : "0.00";

  const handleCashoutSubmit = () => {
    if (currentTotal <= 0) {
      Alert.alert(
        "Insufficient Balance",
        "You currently have GH₵ 0.00 to cash out. Complete deliveries to earn payouts!"
      );
      return;
    }

    if (!momoNumber || momoNumber.length < 9) {
      Alert.alert("Invalid Phone Number", "Please enter a valid Mobile Money number.");
      return;
    }

    setIsProcessingPayout(true);
    setTimeout(() => {
      setIsProcessingPayout(false);
      setCashoutModalVisible(false);
      Alert.alert(
        "Payout Dispatched! 🚀",
        `GH₵ ${currentTotal.toFixed(2)} has been sent to your ${cashoutNetwork} wallet (${momoNumber}). It will reflect in seconds.`
      );
    }, 1200);
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
          Earnings Dashboard
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCashoutModalVisible(true)}
          className="w-11 h-11 rounded-2xl bg-[#16A34A] items-center justify-center"
        >
          <MaterialCommunityIcons name="cash-fast" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
      >
        {/* Time Filter Pills */}
        <View className="bg-white border border-[#EFE5D6] rounded-2xl p-1.5 flex-row items-center justify-between mb-5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("today")}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === "today" ? "bg-[#1C1917]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-black ${
                activeTab === "today" ? "text-white" : "text-[#78716C]"
              }`}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("week")}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === "week" ? "bg-[#1C1917]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-black ${
                activeTab === "week" ? "text-white" : "text-[#78716C]"
              }`}
            >
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("month")}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === "month" ? "bg-[#1C1917]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-black ${
                activeTab === "month" ? "text-white" : "text-[#78716C]"
              }`}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Hero Earnings Card */}
        <View className="bg-[#1C1917] rounded-[28px] p-6 mb-5 border border-[#1C1917]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-black uppercase tracking-wider text-[#A8A29E]">
              {activeTab === "today"
                ? "Today's Net Payout"
                : activeTab === "week"
                ? "This Week's Gross Pay"
                : "This Month's Total Earned"}
            </Text>
            <View className="bg-[#16A34A]/20 px-2.5 py-1 rounded-full border border-[#16A34A]/40 flex-row items-center">
              <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
              <Text className="text-[11px] font-black text-[#16A34A] ml-1">Daily MoMo Settlement</Text>
            </View>
          </View>

          <Text className="text-4xl font-black text-white tracking-tight my-2">
            GH₵ {currentTotal.toFixed(2)}
          </Text>

          <Text className="text-xs text-[#A8A29E] leading-5 font-medium mb-5">
            Automatic payout transfers directly into your MoMo wallet at 11:59 PM or withdraw anytime instantly.
          </Text>

          {/* Cash Out Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setCashoutModalVisible(true)}
            className="w-full bg-[#16A34A] py-3.5 rounded-2xl items-center justify-center flex-row"
          >
            <MaterialCommunityIcons name="bank-transfer-out" size={20} color="#ffffff" />
            <Text className="text-sm font-black text-white ml-2">
              Instant Cash Out to MoMo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Performance & Revenue Breakdown Badges */}
        <View className="flex-row mb-5">
          <View className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-4 mr-2.5">
            <Text className="text-xs font-bold text-[#78716C]">Completed Drops</Text>
            <Text className="text-2xl font-black text-[#1C1917] mt-1">
              {currentCount}
            </Text>
            <Text className="text-[11px] font-semibold text-[#16A34A] mt-1">
              {currentCount > 0 ? "100% Completion rate" : "Ready for jobs"}
            </Text>
          </View>

          <View className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-4 mr-2.5">
            <Text className="text-xs font-bold text-[#78716C]">Customer Tips</Text>
            <Text className="text-2xl font-black text-[#FF6000] mt-1">
              GH₵ {earnings.tips.toFixed(2)}
            </Text>
            <Text className="text-[11px] font-semibold text-[#78716C] mt-1">
              100% goes to rider
            </Text>
          </View>

          <View className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-4">
            <Text className="text-xs font-bold text-[#78716C]">Avg. / Drop</Text>
            <Text className="text-2xl font-black text-[#16A34A] mt-1">
              GH₵ {averagePerDrop}
            </Text>
            <Text className="text-[11px] font-semibold text-[#78716C] mt-1">
              Base + Distance
            </Text>
          </View>
        </View>

        {/* Fee Breakdown Structure Details */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3">
            Compensation Structure
          </Text>

          <View className="flex-row items-center justify-between py-2.5 border-b border-[#F5EDE1]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#FAF4EB] items-center justify-center mr-2.5">
                <MaterialCommunityIcons name="moped" size={17} color="#FF6000" />
              </View>
              <Text className="text-sm font-bold text-[#1C1917]">Base Pick-up Fee</Text>
            </View>
            <Text className="text-sm font-black text-[#1C1917]">GH₵ 12.00</Text>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-[#F5EDE1]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#FAF4EB] items-center justify-center mr-2.5">
                <Feather name="navigation" size={16} color="#FF6000" />
              </View>
              <Text className="text-sm font-bold text-[#1C1917]">Distance Pay</Text>
            </View>
            <Text className="text-sm font-black text-[#1C1917]">GH₵ 2.50 / km</Text>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-[#F5EDE1]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#FAF4EB] items-center justify-center mr-2.5">
                <Feather name="clock" size={16} color="#FF6000" />
              </View>
              <Text className="text-sm font-bold text-[#1C1917]">Rush Hour Boost</Text>
            </View>
            <Text className="text-sm font-black text-[#16A34A]">+ GH₵ 4.00 (Peak)</Text>
          </View>

          <View className="flex-row items-center justify-between py-2.5">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#FAF4EB] items-center justify-center mr-2.5">
                <Ionicons name="heart" size={16} color="#FF6000" />
              </View>
              <Text className="text-sm font-bold text-[#1C1917]">Customer Tips</Text>
            </View>
            <Text className="text-sm font-black text-[#16A34A]">100% Rider Kept</Text>
          </View>
        </View>

        {/* Deliveries Activity Log for the selected period */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E]">
              Recent Payout Records ({deliveryHistory.length})
            </Text>

            {deliveryHistory.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/rider/history")}>
                <Text className="text-xs font-bold text-[#FF6000]">View Full Log &rarr;</Text>
              </TouchableOpacity>
            )}
          </View>

          {deliveryHistory.length === 0 ? (
            <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-8 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-[#FAF4EB] items-center justify-center mb-3 border border-[#EFE5D6]">
                <MaterialCommunityIcons name="cash-remove" size={30} color="#A8A29E" />
              </View>
              <Text className="text-base font-black text-[#1C1917] mb-1">
                No Delivery Earnings Yet
              </Text>
              <Text className="text-xs text-[#78716C] text-center max-w-[260px] leading-5 font-medium mb-4">
                Accept delivery orders from the dispatch hub to build up your daily earnings.
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push("/rider")}
                className="bg-[#FF6000] px-6 py-3 rounded-full"
              >
                <Text className="text-sm font-black text-white">Go to Orders Feed</Text>
              </TouchableOpacity>
            </View>
          ) : (
            deliveryHistory.map((item) => (
              <View
                key={item.id}
                className="bg-white border border-[#EFE5D6] rounded-2xl p-4 mb-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className="w-10 h-10 rounded-xl bg-[#DCFCE7] items-center justify-center mr-3 border border-[#BBF7D0]">
                    <Feather name="check-circle" size={20} color="#16A34A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-[#1C1917]">
                      Order #{item.id}
                    </Text>
                    <Text className="text-xs text-[#78716C] mt-0.5" numberOfLines={1}>
                      {item.customerAddress} • {item.completedAt}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-base font-black text-[#16A34A]">
                    + GH₵ {item.payout.toFixed(2)}
                  </Text>
                  <Text className="text-[10px] font-bold text-[#78716C]">Settled</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Instant MoMo Cashout Modal */}
      <Modal visible={cashoutModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Instant Mobile Money Cash Out
              </Text>
              <TouchableOpacity onPress={() => setCashoutModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#78716C] mb-4 font-medium leading-5">
              Cash out your available earnings balance directly into your Ghanaian Mobile Money wallet.
            </Text>

            {/* Amount Banner */}
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-4 items-center">
              <Text className="text-xs font-bold text-[#78716C]">WITHDRAWABLE BALANCE</Text>
              <Text className="text-3xl font-black text-[#16A34A] mt-1">
                GH₵ {currentTotal.toFixed(2)}
              </Text>
            </View>

            {/* Network Selector */}
            <Text className="text-xs font-black text-[#1C1917] mb-2 uppercase tracking-wider">
              Select MoMo Network
            </Text>
            <View className="flex-row mb-4">
              {["MTN MoMo", "Telecel Cash", "AT Money"].map((net) => {
                const isSelected = cashoutNetwork === net;
                return (
                  <TouchableOpacity
                    key={net}
                    activeOpacity={0.8}
                    onPress={() => setCashoutNetwork(net)}
                    className={`flex-1 py-2.5 rounded-xl border items-center mr-2 last:mr-0 ${
                      isSelected
                        ? "bg-[#FFF3EB] border-[#FF6000]"
                        : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-[#FF6000]" : "text-[#78716C]"
                      }`}
                    >
                      {net}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Phone Number Input */}
            <Text className="text-xs font-black text-[#1C1917] mb-2 uppercase tracking-wider">
              Recipient Wallet Number
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-5">
              <TextInput
                value={momoNumber}
                onChangeText={setMomoNumber}
                placeholder="e.g. 024 123 4567"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                className="text-base font-bold text-[#1C1917]"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCashoutSubmit}
              disabled={isProcessingPayout}
              className={`w-full py-4 rounded-full items-center justify-center mb-2 ${
                isProcessingPayout ? "bg-[#A8A29E]" : "bg-[#16A34A]"
              }`}
            >
              <Text className="text-sm font-black text-white">
                {isProcessingPayout ? "Dispatched Payout..." : `Transfer GH₵ ${currentTotal.toFixed(2)} Now`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCashoutModalVisible(false)}
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
            className="items-center px-2 py-1"
          >
            <MaterialCommunityIcons name="cash-multiple" size={22} color="#FF6000" />
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
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
