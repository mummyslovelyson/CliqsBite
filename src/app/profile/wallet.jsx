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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function WalletAndPaymentsScreen() {
  const router = useRouter();

  // State cleared of mock data
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [cliqsPoints] = useState(0);
  const [topupModal, setTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [addPaymentModal, setAddPaymentModal] = useState(false);

  // New payment method fields
  const [paymentType, setPaymentType] = useState("momo");
  const [momoProvider, setMomoProvider] = useState("mtn");
  const [accountNumber, setAccountNumber] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions] = useState([]);
  const [vouchers] = useState([]);

  const handleTopup = () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid top-up amount in Ghanaian Cedis.");
      return;
    }
    setWalletBalance((prev) => prev + amt);
    setTopupAmount("");
    setTopupModal(false);
    Alert.alert("Top-up Successful 🎉", `GH₵ ${amt.toFixed(2)} has been credited to your CliqsPay wallet.`);
  };

  const handleAddPaymentMethod = () => {
    if (!accountNumber.trim()) {
      Alert.alert("Missing Detail", "Please enter your phone or card number.");
      return;
    }
    const newPm = {
      id: `pm-${Date.now()}`,
      type: paymentType,
      provider: paymentType === "momo" ? `${momoProvider.toUpperCase()} MoMo` : "Bank Card",
      number: accountNumber.trim(),
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods((prev) => [...prev, newPm]);
    setAccountNumber("");
    setAddPaymentModal(false);
    Alert.alert("Payment Method Added", "New payment method is ready for fast 1-click checkout.");
  };

  const handleDeletePaymentMethod = (id) => {
    Alert.alert("Remove Payment", "Are you sure you want to remove this payment method?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setPaymentMethods((prev) => prev.filter((p) => p.id !== id)) },
    ]);
  };

  const handleCopyVoucher = (code) => {
    Alert.alert("Voucher Copied ✓", `Promo code "${code}" is ready to paste at checkout.`);
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
          Payments &amp; Rewards
        </Text>

        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Wallet Balance Hero Card */}
        <View className="bg-[#1C1917] rounded-[28px] p-6 mb-5 relative overflow-hidden">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#FF6000] items-center justify-center mr-3">
                <MaterialCommunityIcons name="wallet" size={22} color="#ffffff" />
              </View>
              <View>
                <Text className="text-base font-black text-white">CliqsPay Wallet</Text>
                <Text className="text-xs text-[#A8A29E] font-medium">Instant fast-food payments</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setTopupModal(true)}
              className="bg-[#FF6000] px-4 py-2 rounded-xl flex-row items-center"
            >
              <Feather name="plus" size={15} color="#ffffff" />
              <Text className="text-sm font-black text-white ml-1.5">Top Up</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-2">
            <Text className="text-xs text-[#A8A29E] font-bold uppercase tracking-wider mb-1">
              Available Balance
            </Text>
            <Text className="text-3xl font-black text-white">
              GH₵ {walletBalance.toFixed(2)}
            </Text>
          </View>

          <View className="border-t border-white/10 pt-3 mt-3 flex-row items-center justify-between">
            <Text className="text-xs text-[#A8A29E] font-semibold">Accepted via MoMo &amp; Cards</Text>
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
              <Text className="text-xs text-[#16A34A] font-bold ml-1.5">Bank-Grade Secure</Text>
            </View>
          </View>
        </View>

        {/* Loyalty Points Banner */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-12 h-12 rounded-2xl bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mr-3.5">
              <MaterialCommunityIcons name="star-circle" size={26} color="#FF6000" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-black text-[#1C1917] mr-2">
                  {cliqsPoints} Points
                </Text>
                <View className="bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                  <Text className="text-xs font-black text-[#D97706] uppercase">Bronze</Text>
                </View>
              </View>
              <Text className="text-xs text-[#78716C] mt-1 font-medium">
                Earn 1 point for every GH₵ 2 spent. Redeem for free burgers!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert("CliqsRewards", "You need 150 points to unlock your first GH₵ 15 meal voucher. Keep biting!")}
            className="bg-[#FAF4EB] border border-[#EFE5D6] px-3.5 py-2 rounded-xl"
          >
            <Text className="text-xs font-bold text-[#FF6000]">Rewards &rarr;</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Payment Methods Section */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Feather name="credit-card" size={18} color="#FF6000" />
              <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] ml-2.5">
                Saved Payment Methods
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAddPaymentModal(true)}
              className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] px-3 py-1.5 rounded-xl"
            >
              <Feather name="plus" size={14} color="#FF6000" />
              <Text className="text-xs font-bold text-[#FF6000] ml-1">Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length === 0 ? (
            <View className="bg-[#FAF4EB] border border-dashed border-[#EFE5D6] rounded-2xl p-4 items-center justify-center my-1">
              <Feather name="credit-card" size={26} color="#A8A29E" />
              <Text className="text-sm font-bold text-[#1C1917] mt-2">
                No payment methods saved
              </Text>
              <Text className="text-xs text-[#78716C] text-center mt-1 font-medium">
                Add your MTN/Telecel/AT MoMo or bank card for fast 1-tap checkout.
              </Text>
            </View>
          ) : (
            paymentMethods.map((pm) => (
              <View
                key={pm.id}
                className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-2.5 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-white border border-[#EFE5D6] items-center justify-center mr-3">
                    <Feather
                      name={pm.type === "momo" ? "smartphone" : "credit-card"}
                      size={18}
                      color="#FF6000"
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-sm font-bold text-[#1C1917] mr-2">
                        {pm.provider}
                      </Text>
                      {pm.isDefault && (
                        <View className="bg-[#FFF3EB] px-2 py-0.5 rounded-full border border-[#FED7AA]">
                          <Text className="text-xs font-black text-[#FF6000]">DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-[#78716C] mt-0.5 font-medium">{pm.number}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeletePaymentMethod(pm.id)}
                  className="p-2"
                >
                  <Feather name="trash-2" size={17} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* 2. Promo Vouchers Section */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <View className="flex-row items-center mb-1">
            <Ionicons name="pricetag-outline" size={18} color="#FF6000" />
            <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] ml-2.5">
              Available Promo Vouchers
            </Text>
          </View>
          <Text className="text-xs text-[#78716C] mb-3.5 font-medium">
            Tap code to copy and apply directly at checkout
          </Text>

          {vouchers.length === 0 ? (
            <View className="items-center justify-center py-6">
              <Ionicons name="pricetag-outline" size={26} color="#A8A29E" />
              <Text className="text-sm font-bold text-[#1C1917] mt-2">
                No active vouchers
              </Text>
              <Text className="text-xs text-[#78716C] text-center mt-1 font-medium max-w-[260px]">
                Promotional coupons and discounts from CliqsBite campaigns will appear here.
              </Text>
            </View>
          ) : (
            vouchers.map((v) => (
              <View
                key={v.code}
                className="bg-[#FFF8F3] border border-dashed border-[#FF6000]/50 rounded-2xl p-3.5 mb-2.5 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-black text-[#FF6000]">{v.code}</Text>
                  <Text className="text-sm font-bold text-[#1C1917] mt-0.5">{v.discount}</Text>
                  <Text className="text-xs text-[#78716C] mt-1 font-medium">
                    Min spend: {v.minSpend} • {v.expiry}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCopyVoucher(v.code)}
                  className="bg-[#FF6000] px-4 py-2 rounded-xl"
                >
                  <Text className="text-xs font-bold text-white">Copy</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* 3. Transaction & Refund History */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-3">
            Transaction &amp; Refund History
          </Text>

          {transactions.length === 0 ? (
            <View className="items-center justify-center py-6">
              <Feather name="clock" size={26} color="#A8A29E" />
              <Text className="text-sm font-bold text-[#1C1917] mt-2">
                No transactions yet
              </Text>
              <Text className="text-xs text-[#78716C] text-center mt-1 font-medium max-w-[260px]">
                Your wallet top-ups, meal order receipts, and instant refunds will appear here.
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View
                key={tx.id}
                className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1] last:border-b-0"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                      tx.type === "order"
                        ? "bg-[#FFF3EB]"
                        : tx.type === "refund"
                        ? "bg-[#F0FDF4]"
                        : "bg-[#EFF6FF]"
                    }`}
                  >
                    <Feather
                      name={tx.type === "order" ? "shopping-bag" : tx.type === "refund" ? "rotate-ccw" : "plus"}
                      size={15}
                      color={tx.type === "order" ? "#FF6000" : tx.type === "refund" ? "#16A34A" : "#2563EB"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-[#1C1917]" numberOfLines={1}>{tx.title}</Text>
                    <Text className="text-xs text-[#78716C] mt-0.5">{tx.date}</Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-sm font-black ${
                      tx.amount > 0 ? "text-[#16A34A]" : "text-[#1C1917]"
                    }`}
                  >
                    {tx.amount > 0 ? `+GH₵ ${tx.amount.toFixed(2)}` : `-GH₵ ${Math.abs(tx.amount).toFixed(2)}`}
                  </Text>
                  <Text
                    className={`text-xs font-bold mt-0.5 ${
                      tx.status === "Refunded"
                        ? "text-[#16A34A]"
                        : tx.status === "Completed"
                        ? "text-[#78716C]"
                        : "text-[#D97706]"
                    }`}
                  >
                    {tx.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={topupModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">
                Top Up CliqsPay Wallet
              </Text>
              <TouchableOpacity onPress={() => setTopupModal(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-[#78716C] mb-3.5 font-medium">
              Enter amount in Ghanaian Cedis (GH₵)
            </Text>

            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-3.5 flex-row items-center mb-3">
              <Text className="text-base font-black text-[#FF6000] mr-2.5">GH₵</Text>
              <TextInput
                value={topupAmount}
                onChangeText={setTopupAmount}
                placeholder="0.00"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
                className="flex-1 text-lg font-black text-[#1C1917]"
              />
            </View>

            {/* Quick amount chips */}
            <View className="flex-row justify-between mb-5">
              {[20, 50, 100, 200].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setTopupAmount(val.toString())}
                  className="bg-[#FAF4EB] border border-[#EFE5D6] px-4 py-2 rounded-xl"
                >
                  <Text className="text-xs font-bold text-[#1C1917]">+GH₵ {val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleTopup}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-white">Top Up Instantly</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal visible={addPaymentModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">
                Add Payment Method
              </Text>
              <TouchableOpacity onPress={() => setAddPaymentModal(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={() => setPaymentType("momo")}
                className={`flex-1 py-3 rounded-2xl items-center mr-2 border ${
                  paymentType === "momo"
                    ? "bg-[#FFF3EB] border-[#FF6000]"
                    : "bg-[#FAF4EB] border-[#EFE5D6]"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    paymentType === "momo" ? "text-[#FF6000]" : "text-[#78716C]"
                  }`}
                >
                  Mobile Money
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentType("card")}
                className={`flex-1 py-3 rounded-2xl items-center border ${
                  paymentType === "card"
                    ? "bg-[#FFF3EB] border-[#FF6000]"
                    : "bg-[#FAF4EB] border-[#EFE5D6]"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    paymentType === "card" ? "text-[#FF6000]" : "text-[#78716C]"
                  }`}
                >
                  Debit / Credit Card
                </Text>
              </TouchableOpacity>
            </View>

            {paymentType === "momo" && (
              <View className="flex-row mb-4">
                {[
                  { id: "mtn", label: "MTN" },
                  { id: "telecel", label: "Telecel" },
                  { id: "at", label: "ATMoney" },
                ].map((prov) => (
                  <TouchableOpacity
                    key={prov.id}
                    onPress={() => setMomoProvider(prov.id)}
                    className={`px-4 py-2 rounded-full mr-2.5 border ${
                      momoProvider === prov.id ? "bg-[#1C1917] border-[#1C1917]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${momoProvider === prov.id ? "text-white" : "text-[#78716C]"}`}>
                      {prov.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-bold text-[#78716C] mb-1.5">
                {paymentType === "momo" ? "MoMo Phone Number" : "Card Number"}
              </Text>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                <TextInput
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder={paymentType === "momo" ? "Enter phone number" : "16-digit card number"}
                  placeholderTextColor="#A8A29E"
                  keyboardType="numeric"
                  className="text-sm font-bold text-[#1C1917]"
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleAddPaymentMethod}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-white">Save Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
