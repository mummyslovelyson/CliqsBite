import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRider, ACCRA_DELIVERY_ZONES } from "../../context/RiderContext";

export default function RiderDashboardScreen() {
  const router = useRouter();
  const {
    isOnline,
    toggleOnline,
    operatingZone,
    setOperatingZone,
    riderProfile,
    activeDelivery,
    availableRequests,
    setAvailableRequests,
    acceptDelivery,
    rejectDelivery,
    advanceDeliveryStep,
    reportDeliveryException,
    completeDelivery,
    cancelActiveDelivery,
    earnings,
    deliveryHistory,
  } = useRider();

  // Zone Selector Modal
  const [zoneModalVisible, setZoneModalVisible] = useState(false);

  // Decline Reason Modal
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [orderToDecline, setOrderToDecline] = useState(null);

  // OTP & Proof of Delivery Modal
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [proofPhotoCaptured, setProofPhotoCaptured] = useState(false);

  // Map Navigation Modal
  const [navMapVisible, setNavMapVisible] = useState(false);

  // Delay / Issue Report Modal
  const [delayModalVisible, setDelayModalVisible] = useState(false);
  const [delayReason, setDelayReason] = useState("Kitchen extra prep time (> 15m)");

  // Countdown simulation for incoming requests
  const [requestCountdown, setRequestCountdown] = useState(45);

  useEffect(() => {
    if (availableRequests.length > 0) {
      const interval = setInterval(() => {
        setRequestCountdown((prev) => {
          if (prev <= 1) {
            // Auto expire first request
            setAvailableRequests((r) => r.slice(1));
            return 45;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [availableRequests.length, setAvailableRequests]);

  // Handle Online Toggle with verification gate check
  const handleToggleOnline = () => {
    const result = toggleOnline();
    if (!result.success) {
      Alert.alert("Admin Approval Required 🔒", result.message, [
        { text: "Check Approval Status", onPress: () => router.push("/rider/auth/status") },
        { text: "OK", style: "cancel" },
      ]);
    }
  };



  const handleDeclineWithReason = (reason) => {
    if (orderToDecline) {
      rejectDelivery(orderToDecline.id, reason);
      setDeclineModalVisible(false);
      setOrderToDecline(null);
      Alert.alert("Request Declined", `Order has been reassigned to another nearby rider. Reason: ${reason}`);
    }
  };

  const handleConfirmOtpSubmit = () => {
    if (enteredOtp.length < 4) {
      Alert.alert("Missing OTP", "Please enter the 4-digit code given to you by the customer.");
      return;
    }

    const result = completeDelivery(enteredOtp, proofPhotoCaptured ? "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500" : null);
    if (result.success) {
      setOtpModalVisible(false);
      setEnteredOtp("");
      setProofPhotoCaptured(false);
      Alert.alert("Delivery Completed! 🎉", result.message);
    } else {
      Alert.alert("Verification Failed", result.message);
    }
  };

  const handleReportDelaySubmit = () => {
    reportDeliveryException(delayReason, "Reported via active job milestone screen");
    setDelayModalVisible(false);
    Alert.alert("Report Sent to Dispatch", `Dispatch logged: ${delayReason}. Customer delivery ETA updated.`);
  };

  const isApproved = riderProfile.verificationStatus === "approved" || riderProfile.isApproved;

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/auth/role-select")}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-xl font-black text-[#1C1917] tracking-tight">
            Rider Workspace
          </Text>
          <TouchableOpacity
            onPress={() => setZoneModalVisible(true)}
            className="flex-row items-center mt-0.5"
          >
            <Feather name="map-pin" size={11} color="#FF6000" />
            <Text className="text-xs font-bold text-[#78716C] ml-1">
              {operatingZone}
            </Text>
            <Feather name="chevron-down" size={12} color="#78716C" className="ml-0.5" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/rider/profile")}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center relative"
        >
          <Feather name="user" size={19} color="#1C1917" />
          {isApproved && (
            <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#16A34A] items-center justify-center border border-white">
              <Ionicons name="checkmark" size={10} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
      >
        {/* Verification Warning Card (Shown when Rider is NOT approved) */}
        {!isApproved && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/rider/auth/status")}
            style={{ elevation: 2 }}
            className="bg-[#DC2626] rounded-[28px] p-5 mb-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                <Feather name="alert-circle" size={22} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-white">
                  Admin Verification Pending 🔒
                </Text>
                <Text className="text-xs text-white/90 mt-0.5 font-medium leading-4">
                  You cannot accept deliveries until verified by CliqsBite Operations. Tap to check status.
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}

        {/* Online / Offline Status Hero Card */}
        <View className={`rounded-[28px] p-5 mb-5 border ${
          isOnline
            ? "bg-[#1C1917] border-[#1C1917]"
            : "bg-white border-[#EFE5D6]"
        }`}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className={`w-3.5 h-3.5 rounded-full mr-2.5 ${
                isOnline ? "bg-[#16A34A]" : "bg-[#A8A29E]"
              }`} />
              <Text className={`text-lg font-black ${
                isOnline ? "text-white" : "text-[#1C1917]"
              }`}>
                {isOnline ? "You are Online" : "You are Offline"}
              </Text>
            </View>

            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
              thumbColor="#ffffff"
            />
          </View>

          <Text className={`text-xs leading-5 font-medium ${
            isOnline ? "text-[#A8A29E]" : "text-[#78716C]"
          }`}>
            {isOnline
              ? `Live GPS broadcasting in ${operatingZone}. Ready for automated order matching from kitchen dispatch.`
              : "Toggle online when you have your helmet fastened and thermal insulated bag ready."}
          </Text>

          {/* Verification Badge */}
          <View className="mt-4 pt-3 border-t border-white/10 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={16} color={isApproved ? "#16A34A" : "#F59E0B"} />
              <Text className={`text-xs font-bold ml-1.5 ${isOnline ? "text-white" : "text-[#1C1917]"}`}>
                {isApproved ? "Approved & Verified Fleet Partner" : "Pending Administrator Review"}
              </Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/rider/auth/status")}>
              <Text className="text-xs font-bold text-[#FF6000]">Status &rarr;</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Rider Performance Metrics Badges */}
        <View className="flex-row mb-5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/rider/earnings")}
            className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-3.5 items-center mr-2.5"
          >
            <Text className="text-xl font-black text-[#16A34A]">
              GH₵ {earnings.today.toFixed(2)}
            </Text>
            <Text className="text-xs font-bold text-[#78716C] mt-1">
              Today&apos;s Pay
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/rider/history")}
            className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-3.5 items-center mr-2.5"
          >
            <Text className="text-xl font-black text-[#FF6000]">
              {deliveryHistory.length}
            </Text>
            <Text className="text-xs font-bold text-[#78716C] mt-1">
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/rider/profile")}
            className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-3.5 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-lg font-black text-[#1C1917] ml-1">
                {riderProfile.rating}
              </Text>
            </View>
            <Text className="text-xs font-bold text-[#78716C] mt-1">
              Rating
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE DELIVERY JOB CARD (When Rider has accepted an order) */}
        {activeDelivery ? (
          <View
            style={{ elevation: 2 }}
            className="bg-white border-2 border-[#FF6000] rounded-[28px] p-5 mb-5"
          >
            {/* Header / Payout */}
            <View className="flex-row items-center justify-between pb-3.5 border-b border-[#F5EDE1] mb-3.5">
              <View>
                <Text className="text-xs font-black uppercase tracking-wider text-[#FF6000]">
                  ACTIVE DELIVERY JOB
                </Text>
                <Text className="text-lg font-black text-[#1C1917]">
                  Order #{activeDelivery.id}
                </Text>
              </View>

              <View className="bg-[#F0FDF4] px-3.5 py-1.5 rounded-full border border-[#BBF7D0]">
                <Text className="text-sm font-black text-[#16A34A]">
                  Earn GH₵ {activeDelivery.payout.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Current Step Status Banner */}
            <View className="bg-[#FFF8F3] border border-[#FED7AA] rounded-2xl p-3.5 mb-4">
              <Text className="text-xs font-bold text-[#FF6000]">LIFECYCLE STAGE ({activeDelivery.step} OF 5):</Text>
              <Text className="text-base font-black text-[#1C1917] mt-0.5">
                {activeDelivery.status}
              </Text>
            </View>

            {/* Pickup Location Info */}
            <View className="mb-3.5">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                  <Feather name="home" size={16} color="#78716C" />
                  <Text className="text-sm font-bold text-[#1C1917] ml-2">
                    Kitchen Pickup
                  </Text>
                </View>

                {activeDelivery.pickupCode && (
                  <View className="bg-[#1C1917] px-2.5 py-0.5 rounded">
                    <Text className="text-xs font-black text-white">
                      Code: {activeDelivery.pickupCode}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-[#57534E] leading-5 font-medium ml-6">
                {activeDelivery.pickupAddress}
              </Text>
              <Text className="text-xs text-[#78716C] italic ml-6 mt-0.5">
                Instructions: {activeDelivery.pickupInstructions}
              </Text>

              {/* Action: Report Kitchen Delay */}
              {activeDelivery.step <= 2 && (
                <TouchableOpacity
                  onPress={() => setDelayModalVisible(true)}
                  className="mt-2 ml-6 flex-row items-center"
                >
                  <Feather name="clock" size={13} color="#DC2626" />
                  <Text className="text-xs font-bold text-[#DC2626] ml-1">
                    Food not ready? Report Kitchen Delay &rarr;
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Customer Drop-off Info */}
            <View className="mb-4 pt-3 border-t border-[#F5EDE1]">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                  <Feather name="map-pin" size={16} color="#FF6000" />
                  <Text className="text-sm font-bold text-[#1C1917] ml-2">
                    Customer Drop-off
                  </Text>
                </View>

                {/* Call Customer Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert("Calling Customer", `Dialing ${activeDelivery.customerName} (${activeDelivery.customerPhone})...`)}
                  className="bg-[#16A34A] px-3 py-1 rounded-full flex-row items-center"
                >
                  <Feather name="phone" size={12} color="#ffffff" />
                  <Text className="text-xs font-bold text-white ml-1">Call</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-bold text-[#1C1917] ml-6">
                {activeDelivery.customerName}
              </Text>
              <Text className="text-xs text-[#57534E] leading-5 font-medium ml-6">
                {activeDelivery.customerAddress || activeDelivery.deliveryAddress}
              </Text>
              {activeDelivery.deliveryInstructions ? (
                <Text className="text-xs text-[#DC2626] font-semibold ml-6 mt-1">
                  Note: {activeDelivery.deliveryInstructions}
                </Text>
              ) : null}
            </View>

            {/* Turn-by-Turn GPS Map Trigger */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setNavMapVisible(true)}
              className="bg-[#1C1917] py-3.5 rounded-2xl items-center justify-center flex-row mb-3"
            >
              <Feather name="navigation" size={16} color="#ffffff" />
              <Text className="text-sm font-black text-white ml-2">Open Turn-by-Turn GPS Map</Text>
            </TouchableOpacity>

            {/* Step Action Progress Buttons */}
            {activeDelivery.step < 4 ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={advanceDeliveryStep}
                className="bg-[#FF6000] py-4 rounded-full items-center justify-center flex-row"
              >
                <Feather name="check-circle" size={17} color="#ffffff" />
                <Text className="text-sm font-black text-white ml-2">
                  {activeDelivery.step === 1
                    ? "Confirm Arrived at Kitchen"
                    : activeDelivery.step === 2
                    ? "Order Picked Up • Thermal Bag Sealed"
                    : "Confirm Arrived at Customer"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setOtpModalVisible(true)}
                className="bg-[#16A34A] py-4 rounded-full items-center justify-center flex-row"
              >
                <Ionicons name="key" size={17} color="#ffffff" />
                <Text className="text-sm font-black text-white ml-2">
                  Verify Customer OTP &amp; Complete Drop
                </Text>
              </TouchableOpacity>
            )}

            {/* Emergency Cancel Action */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Cancel Delivery?", "Are you sure you need to cancel? This will be escalated to dispatch control.", [
                  { text: "No", style: "cancel" },
                  { text: "Cancel Job", style: "destructive", onPress: () => cancelActiveDelivery("Cancelled by rider in active job") },
                ]);
              }}
              className="mt-3 items-center py-1"
            >
              <Text className="text-xs font-bold text-[#A8A29E]">Emergency Cancel / Reassign &rarr;</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* AVAILABLE DELIVERY REQUESTS SECTION */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E]">
              Available Requests ({availableRequests.length})
            </Text>
          </View>

          {availableRequests.length === 0 ? (
            <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-8 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-[#FAF4EB] items-center justify-center mb-3 border border-[#EFE5D6]">
                <MaterialCommunityIcons name="moped" size={30} color="#A8A29E" />
              </View>
              <Text className="text-base font-black text-[#1C1917] mb-1">
                No Orders in {operatingZone}
              </Text>
              <Text className="text-xs text-[#78716C] text-center max-w-[260px] leading-5 font-medium">
                {isOnline
                  ? "Stay online and keep your GPS active. New customer orders will chime here instantly."
                  : "You are currently offline. Turn your toggle switch online above to receive delivery requests."}
              </Text>
            </View>
          ) : (
            availableRequests.map((req) => (
              <View
                key={req.id}
                style={{ elevation: 2 }}
                className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-3.5"
              >
                {/* Header with 45s Countdown */}
                <View className="flex-row items-start justify-between mb-3 border-b border-[#F5EDE1] pb-3">
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-base font-black text-[#1C1917] mr-2">
                        Order #{req.id}
                      </Text>
                      <View className="bg-[#FFF3EB] px-2 py-0.5 rounded-full border border-[#FED7AA] flex-row items-center">
                        <Feather name="clock" size={10} color="#FF6000" />
                        <Text className="text-[10px] font-black text-[#FF6000] ml-1">
                          {requestCountdown}s left
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-[#78716C] font-semibold mt-0.5">
                      Est. Trip: {req.distance} • ~{req.estTime}
                    </Text>
                  </View>

                  <View className="bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#BBF7D0]">
                    <Text className="text-sm font-black text-[#16A34A]">
                      + GH₵ {req.payout.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Pickup & Drop Summary */}
                <View className="mb-3.5">
                  <View className="flex-row items-center mb-1.5">
                    <Feather name="home" size={14} color="#78716C" />
                    <Text className="text-xs text-[#57534E] font-bold ml-2">
                      From: {req.kitchenName}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Feather name="map-pin" size={14} color="#FF6000" />
                    <Text className="text-xs text-[#1C1917] font-bold ml-2 flex-1">
                      To: {req.customerAddress}
                    </Text>
                  </View>
                </View>

                {/* Package */}
                <Text className="text-xs text-[#78716C] mb-4 font-medium" numberOfLines={1}>
                  Package: {req.itemsSummary}
                </Text>

                {/* Accept / Decline actions */}
                <View className="flex-row items-center">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setOrderToDecline(req);
                      setDeclineModalVisible(true);
                    }}
                    className="flex-1 bg-[#FAF4EB] border border-[#EFE5D6] py-3 rounded-2xl items-center mr-2.5"
                  >
                    <Text className="text-sm font-bold text-[#DC2626]">Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => acceptDelivery(req)}
                    className="flex-1 bg-[#FF6000] py-3.5 rounded-2xl items-center"
                  >
                    <Text className="text-sm font-black text-white">Accept Job &rarr;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Operations Nav Links */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-6">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3 px-1">
            Rider Operations
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/earnings")}
            className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                <MaterialCommunityIcons name="wallet-outline" size={20} color="#FF6000" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#1C1917]">
                  Earnings Dashboard
                </Text>
                <Text className="text-xs text-[#78716C] font-medium">Daily, weekly &amp; monthly payouts</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#A8A29E" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/history")}
            className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                <Feather name="clock" size={18} color="#FF6000" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#1C1917]">
                  Completed Deliveries History
                </Text>
                <Text className="text-xs text-[#78716C] font-medium">Delivered order logs &amp; proof records</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#A8A29E" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/support")}
            className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                <Feather name="shield" size={18} color="#FF6000" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#1C1917]">
                  Safety &amp; Support Tickets
                </Text>
                <Text className="text-xs text-[#78716C] font-medium">Emergency SOS, delays &amp; appeals</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#A8A29E" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/auth/status")}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={18} color="#FF6000" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#1C1917]">
                  Admin Approval &amp; Verification
                </Text>
                <Text className="text-xs text-[#78716C] font-medium">Check status &amp; test admin approval</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#A8A29E" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Decline Reason Modal */}
      <Modal visible={declineModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Decline Delivery Offer
              </Text>
              <TouchableOpacity onPress={() => setDeclineModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-[#78716C] mb-4 font-medium leading-5">
              Select a reason for declining. This helps dispatch assign orders accurately.
            </Text>

            {[
              "Delivery destination is too far",
              "Motorcycle maintenance / Low battery",
              "Heavy rain or poor road conditions",
              "Taking scheduled rider break",
              "Package exceeds thermal box size",
            ].map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => handleDeclineWithReason(reason)}
                className="bg-[#FAF4EB] border border-[#EFE5D6] p-3.5 rounded-2xl mb-2"
              >
                <Text className="text-xs font-bold text-[#1C1917]">{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setDeclineModalVisible(false)}
              className="w-full py-2.5 items-center justify-center mt-2"
            >
              <Text className="text-sm font-bold text-[#78716C]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Operating Delivery Zone Selector Modal */}
      <Modal visible={zoneModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6] max-h-[80%]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Select Operating Delivery Zone
              </Text>
              <TouchableOpacity onPress={() => setZoneModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-[#78716C] mb-4 font-medium leading-5">
              Choose the Accra sector where you want to receive delivery requests today:
            </Text>

            <ScrollView className="max-h-72 mb-4">
              {ACCRA_DELIVERY_ZONES.map((zone) => {
                const isSelected = operatingZone === zone;
                return (
                  <TouchableOpacity
                    key={zone}
                    onPress={() => {
                      setOperatingZone(zone);
                      setZoneModalVisible(false);
                      Alert.alert("Zone Updated", `You are now receiving orders in ${zone}.`);
                    }}
                    className={`p-3.5 rounded-2xl mb-2 border flex-row items-center justify-between ${
                      isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-[#FF6000]" : "text-[#1C1917]"}`}>
                      {zone}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color="#FF6000" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Report Kitchen Delay Modal */}
      <Modal visible={delayModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Report Kitchen Prep Delay
              </Text>
              <TouchableOpacity onPress={() => setDelayModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            {[
              "Kitchen extra prep time (> 15m)",
              "Kitchen frying chicken in batch",
              "Item currently out of stock",
              "Long queue at pickup counter #2",
            ].map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setDelayReason(reason)}
                className={`p-3.5 rounded-2xl mb-2 border ${
                  delayReason === reason ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                }`}
              >
                <Text className="text-xs font-bold text-[#1C1917]">{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleReportDelaySubmit}
              className="w-full bg-[#FF6000] py-3.5 rounded-full items-center justify-center mt-3 mb-2"
            >
              <Text className="text-sm font-black text-white">Send Delay Notice to Dispatch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Turn-by-Turn GPS Navigation Map Modal */}
      <Modal visible={navMapVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6] max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-lg font-black text-[#1C1917]">
                  Live Rider Navigation
                </Text>
                <Text className="text-xs text-[#FF6000] font-bold">
                  Navigating to {activeDelivery?.step < 3 ? "Kitchen Hub" : "Customer Address"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setNavMapVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            {/* Visual Simulated Map Display */}
            <View className="w-full h-64 bg-[#CBD5E1] rounded-[24px] mb-4 relative overflow-hidden items-center justify-center">
              {/* Grid Roads */}
              <View className="absolute inset-0 opacity-40">
                <View className="w-full h-3 bg-white my-8" />
                <View className="w-full h-2 bg-white my-12" />
                <View className="h-full w-3 bg-white absolute left-20" />
                <View className="h-full w-2 bg-white absolute right-24" />
              </View>

              {/* Transit Route */}
              <View className="absolute left-20 top-16 right-24 bottom-14 border-b-4 border-l-4 border-dashed border-[#FF6000]" />

              {/* Kitchen Pin */}
              <View className="absolute left-16 top-10 items-center">
                <View className="w-9 h-9 rounded-full bg-[#1C1917] items-center justify-center border-2 border-white">
                  <Feather name="home" size={16} color="#ffffff" />
                </View>
                <Text className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded mt-0.5">Kitchen</Text>
              </View>

              {/* Rider Marker */}
              <View className="absolute top-28 left-36 items-center">
                <View className="w-12 h-12 rounded-full bg-[#FF6000] items-center justify-center border-2 border-white">
                  <MaterialCommunityIcons name="moped" size={24} color="#ffffff" />
                </View>
                <Text className="text-[10px] font-black text-white bg-[#1C1917] px-2 py-0.5 rounded-full mt-1">
                  Speed: 38 km/h
                </Text>
              </View>

              {/* Destination Pin */}
              <View className="absolute right-16 bottom-8 items-center">
                <View className="w-9 h-9 rounded-full bg-[#16A34A] items-center justify-center border-2 border-white">
                  <Feather name="map-pin" size={16} color="#ffffff" />
                </View>
                <Text className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded mt-0.5">Customer</Text>
              </View>
            </View>

            {/* Turn by turn direction card */}
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-4 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#1C1917] items-center justify-center mr-3">
                <Feather name="corner-up-right" size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-[#1C1917]">
                  In 250m, Turn Right onto Boundary Road
                </Text>
                <Text className="text-xs text-[#78716C] font-medium">
                  Follow straight for 1.2 km towards American House
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setNavMapVisible(false)}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-white">Back to Delivery Job</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* OTP & Proof of Delivery Modal */}
      <Modal visible={otpModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Customer Drop-off Verification
              </Text>
              <TouchableOpacity onPress={() => setOtpModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-[#78716C] mb-4 font-medium leading-5">
              Ask customer for their 4-digit order confirmation OTP code shown on their tracking screen (Test code: <Text className="font-black text-[#1C1917]">5824</Text>).
            </Text>

            {/* OTP Input */}
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-4">
              <TextInput
                value={enteredOtp}
                onChangeText={setEnteredOtp}
                placeholder="• • • •"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
                maxLength={4}
                className="text-3xl font-black text-[#1C1917] text-center tracking-[12px]"
              />
            </View>

            {/* Proof of Delivery / Photo Confirmation */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setProofPhotoCaptured(!proofPhotoCaptured);
                Alert.alert(
                  proofPhotoCaptured ? "Photo Removed" : "Proof Photo Captured 📸",
                  proofPhotoCaptured ? "Drop-off photo proof removed." : "Doorstep handover photo captured and timestamped."
                );
              }}
              className={`p-3.5 rounded-2xl border mb-5 flex-row items-center justify-between ${
                proofPhotoCaptured
                  ? "bg-[#F0FDF4] border-[#BBF7D0]"
                  : "bg-[#FAF4EB] border-[#EFE5D6]"
              }`}
            >
              <View className="flex-row items-center">
                <Feather
                  name="camera"
                  size={18}
                  color={proofPhotoCaptured ? "#16A34A" : "#78716C"}
                />
                <Text
                  className={`text-sm font-bold ml-2.5 ${
                    proofPhotoCaptured ? "text-[#16A34A]" : "text-[#1C1917]"
                  }`}
                >
                  {proofPhotoCaptured ? "Drop Photo Proof Attached ✓" : "Take Doorstep Photo Proof (Optional)"}
                </Text>
              </View>

              <Feather
                name={proofPhotoCaptured ? "check" : "chevron-right"}
                size={16}
                color={proofPhotoCaptured ? "#16A34A" : "#78716C"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmOtpSubmit}
              className="w-full bg-[#16A34A] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Confirm OTP &amp; Complete Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOtpModalVisible(false)}
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
            className="items-center px-2 py-1"
          >
            <MaterialCommunityIcons name="moped" size={22} color="#FF6000" />
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
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
