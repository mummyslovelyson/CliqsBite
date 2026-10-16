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
import { useCart } from "../../context/CartContext";

export default function OrderManagementScreen() {
  const router = useRouter();
  const {
    orders,
    placeOrder,
    cancelOrder,
    advanceOrderStatus,
    tipRider,
    rateOrder,
    addToCart,
  } = useCart();

  // Filter tabs: "all" | "active" | "completed" | "cancelled"
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [tipModalOrder, setTipModalOrder] = useState(null);
  const [selectedTip, setSelectedTip] = useState(10);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [foodStars, setFoodStars] = useState(5);
  const [riderStars, setRiderStars] = useState(5);
  const [reviewNote, setReviewNote] = useState("");

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? order.statusCode === "active"
        : filter === "completed"
        ? order.statusCode === "delivered"
        : order.statusCode === "cancelled";

    if (!matchesFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = (order.id || "").toLowerCase().includes(q);
      const itemsMatch = (order.items || []).some((item) =>
        (item.name || item.title || "").toLowerCase().includes(q)
      );
      return idMatch || itemsMatch;
    }

    return true;
  });

  const activeOrdersCount = orders.filter((o) => o.statusCode === "active").length;

  // Handle reorder
  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart({
        id: item.id || `reorder-${item.title}`,
        title: item.name || item.title,
        price: item.price,
        quantity: item.qty || item.quantity || 1,
        portion: item.portion,
        spiceLevel: item.spice || item.spiceLevel,
      });
    });
    Alert.alert("Items Added to Cart", "The meals from this order have been placed back into your cart.", [
      { text: "View Cart", onPress: () => router.push("/cart") },
      { text: "Keep Browsing" },
    ]);
  };

  // Handle cancellation
  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    cancelOrder(cancelModalOrder.id, cancelReason);
    setCancelModalOrder(null);
    Alert.alert("Order Cancelled", "Your order has been cancelled. Any Mobile Money payment has been refunded to your wallet.");
  };

  // Handle tipping
  const handleConfirmTip = () => {
    if (!tipModalOrder) return;
    tipRider(tipModalOrder.id, selectedTip);
    setTipModalOrder(null);
    Alert.alert("Tip Sent! 🌟", `GH₵ ${selectedTip.toFixed(2)} has been added to your rider's earnings. Thank you!`);
  };

  // Handle rating
  const handleSubmitRating = () => {
    if (!ratingOrder) return;
    rateOrder(ratingOrder.id, foodStars, reviewNote, riderStars);
    setRatingOrder(null);
    Alert.alert("Thank You! ⭐", "Your rating and feedback have been shared with our kitchen and delivery team.");
  };

  // Helper to place a demo order for instant testing
  const handlePlaceDemoOrder = () => {
    placeOrder({
      deliveryType: "delivery",
      deliveryAddress: "House 14, Lagos Avenue, East Legon, Accra",
      paymentMethod: "MTN Mobile Money",
      subtotal: 145.0,
      deliveryFee: 15.0,
      discount: 0.0,
      total: 160.0,
      notes: "Please pack extra shito and napkins.",
      items: [
        {
          id: "bucket-8",
          title: "8 Pcs Chicken Bucket",
          price: 145.0,
          quantity: 1,
          portion: "Standard Bucket",
          spiceLevel: "Hot & Crispy",
        },
      ],
    });
    Alert.alert("Active Order Created! 🎉", "Order #CB-5201 placed in kitchen. You can now track rider, advance milestones, or test cancellation!");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/")}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-xl font-black text-[#1C1917] tracking-tight">
            Order Management
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
            {activeOrdersCount > 0 ? `${activeOrdersCount} active tracking` : `${orders.length} total orders`}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePlaceDemoOrder}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="plus" size={18} color="#FF6000" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View className="px-5 pt-3 pb-2">
        <View className="flex-row items-center bg-white border border-[#EFE5D6] rounded-2xl px-3.5 py-2.5">
          <Feather name="search" size={16} color="#A8A29E" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by order ID (e.g. 5201) or meal name..."
            placeholderTextColor="#A8A29E"
            className="flex-1 ml-2.5 text-xs font-bold text-[#1C1917]"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color="#A8A29E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 py-2">
        {[
          { key: "all", label: "All Orders" },
          { key: "active", label: `Active (${activeOrdersCount})` },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
        ].map((tab) => {
          const active = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                active ? "bg-[#FF6000] border-[#FF6000]" : "bg-white border-[#EFE5D6]"
              }`}
            >
              <Text className={`text-xs font-bold ${active ? "text-white" : "text-[#78716C]"}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {filteredOrders.length === 0 ? (
          <View className="items-center justify-center py-20 bg-white border border-[#EFE5D6] rounded-[28px] p-6 mt-2">
            <View className="w-20 h-20 rounded-full bg-[#FAF4EB] border border-[#EFE5D6] items-center justify-center mb-4">
              <Feather name="shopping-bag" size={32} color="#A8A29E" />
            </View>
            <Text className="text-lg font-black text-[#1C1917] mb-1">
              No Orders in This View
            </Text>
            <Text className="text-xs text-[#78716C] text-center max-w-[260px] leading-5 mb-5 font-medium">
              {filter === "active"
                ? "You have no orders currently in kitchen or in transit."
                : "Explore our freshly fried chicken buckets, combos and cold drinks."}
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/menu")}
                className="bg-[#FF6000] px-5 py-3 rounded-full mr-2"
              >
                <Text className="text-xs font-black text-white">Browse Menu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePlaceDemoOrder}
                className="bg-[#FAF4EB] border border-[#EFE5D6] px-4 py-3 rounded-full"
              >
                <Text className="text-xs font-bold text-[#1C1917]">Place Test Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const isActive = order.statusCode === "active";
            const isCancelled = order.statusCode === "cancelled";
            const isCompleted = order.statusCode === "delivered";

            return (
              <View
                key={order.id}
                style={{ elevation: 2 }}
                className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-4"
              >
                {/* Header Row: ID, Date, Status */}
                <View className="flex-row items-start justify-between mb-3 border-b border-[#F5EDE1] pb-3">
                  <View>
                    <Text className="text-base font-black text-[#1C1917]">
                      Order #{order.id}
                    </Text>
                    <Text className="text-xs text-[#78716C] font-semibold mt-0.5">
                      {order.date}
                    </Text>
                  </View>

                  <View
                    style={{ backgroundColor: order.statusBg }}
                    className="px-3 py-1 rounded-full flex-row items-center border border-[#FED7AA]"
                  >
                    {isActive ? (
                      <MaterialCommunityIcons name="progress-clock" size={13} color={order.statusColor} />
                    ) : isCancelled ? (
                      <Feather name="x-circle" size={13} color={order.statusColor} />
                    ) : (
                      <Ionicons name="checkmark-circle" size={13} color={order.statusColor} />
                    )}
                    <Text
                      style={{ color: order.statusColor }}
                      className="text-xs font-black uppercase tracking-wider ml-1"
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>

                {/* Items Summary */}
                <View className="mb-3">
                  {order.items.map((it, idx) => (
                    <View key={idx} className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-xs text-[#57534E] font-bold">
                        {it.qty || it.quantity || 1}x {it.name || it.title}
                      </Text>
                      <Text className="text-xs font-bold text-[#1C1917]">
                        GH₵ {((it.price || 0) * (it.qty || it.quantity || 1)).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* ACTIVE ORDER: Real-time progress bar & Drop-off OTP Banner */}
                {isActive && (
                  <View className="bg-[#FFF8F3] border border-[#FED7AA] rounded-2xl p-3.5 mb-3.5">
                    {/* ETA & Map Button */}
                    <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-[#FED7AA]/60">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="moped" size={18} color="#FF6000" />
                        <Text className="text-xs font-black text-[#FF6000] ml-1.5">
                          ETA: {order.eta}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setSelectedTracking(order)}>
                        <Text className="text-xs font-bold text-[#FF6000]">
                          Open Map &rarr;
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Handover OTP Notice */}
                    <View className="flex-row items-center justify-between bg-white px-3 py-2 rounded-xl mb-2.5 border border-[#FED7AA]">
                      <Text className="text-xs font-bold text-[#78716C]">
                        Your Delivery Handover OTP:
                      </Text>
                      <Text className="text-base font-black text-[#1C1917] tracking-widest">
                        5824
                      </Text>
                    </View>

                    {/* Step Advance Simulator (for testing) */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => advanceOrderStatus(order.id)}
                      className="bg-[#1C1917] py-2 rounded-xl items-center"
                    >
                      <Text className="text-[11px] font-black text-white">
                        Simulate Next Milestone: {order.step === 2 ? "Rider Pickup" : order.step === 3 ? "Arrived at Doorstep" : "Delivered"} &rarr;
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* CANCELLED ORDER: Reason Banner */}
                {isCancelled && (
                  <View className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 mb-3">
                    <Text className="text-xs font-bold text-[#DC2626]">
                      Cancellation Reason: {order.cancelReason || "Cancelled by customer"}
                    </Text>
                    <Text className="text-[11px] text-[#78716C] mt-0.5">
                      Refund status: <Text className="font-bold text-[#16A34A]">Refunded to Mobile Money</Text>
                    </Text>
                  </View>
                )}

                {/* COMPLETED ORDER: Rating feedback display */}
                {isCompleted && order.rating && (
                  <View className="bg-[#FEF3C7] rounded-xl px-3 py-2 mb-3 flex-row items-center justify-between border border-[#FDE68A]">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#D97706" />
                      <Text className="text-xs font-black text-[#92400E] ml-1">
                        Rated {order.rating}/5 Stars
                      </Text>
                    </View>
                    {order.riderTip ? (
                      <Text className="text-xs font-bold text-[#16A34A]">
                        + GH₵ {order.riderTip.toFixed(2)} Tip
                      </Text>
                    ) : null}
                  </View>
                )}

                {/* Total & Action Buttons */}
                <View className="flex-row items-center justify-between pt-3 border-t border-[#F5EDE1]">
                  <View>
                    <Text className="text-[11px] font-bold text-[#78716C]">Total Charged</Text>
                    <Text className="text-base font-black text-[#FF6000]">
                      GH₵ {order.total.toFixed(2)}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    {/* Receipt button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedReceipt(order)}
                      className="bg-[#FAF4EB] border border-[#EFE5D6] px-3 py-2 rounded-xl mr-1.5"
                    >
                      <Text className="text-xs font-bold text-[#1C1917]">Receipt</Text>
                    </TouchableOpacity>

                    {/* Reorder button */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleReorder(order)}
                      className="bg-[#FAF4EB] border border-[#EFE5D6] px-3 py-2 rounded-xl mr-1.5 flex-row items-center"
                    >
                      <Feather name="refresh-cw" size={12} color="#FF6000" />
                      <Text className="text-xs font-bold text-[#FF6000] ml-1">Reorder</Text>
                    </TouchableOpacity>

                    {/* Active Order: Cancel button */}
                    {isActive && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setCancelModalOrder(order)}
                        className="bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 rounded-xl"
                      >
                        <Text className="text-xs font-bold text-[#DC2626]">Cancel</Text>
                      </TouchableOpacity>
                    )}

                    {/* Completed Order: Rate / Tip button */}
                    {isCompleted && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          setRatingOrder(order);
                          setFoodStars(order.rating || 5);
                          setRiderStars(order.riderRating || 5);
                          setReviewNote(order.review || "");
                        }}
                        className="bg-[#FF6000] px-3 py-2 rounded-xl flex-row items-center"
                      >
                        <Feather name="star" size={12} color="#ffffff" />
                        <Text className="text-xs font-black text-white ml-1">
                          {order.rating ? "Edit Review" : "Rate"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Cancel Order Modal */}
      <Modal visible={!!cancelModalOrder} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Cancel Order #{cancelModalOrder?.id}
              </Text>
              <TouchableOpacity onPress={() => setCancelModalOrder(null)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#78716C] mb-4 font-medium leading-5">
              Please choose a reason for cancelling. GH₵ {cancelModalOrder?.total.toFixed(2)} will be refunded immediately to your Mobile Money account.
            </Text>

            {[
              "Ordered by mistake / Change of mind",
              "Selected wrong delivery address",
              "Preparation time taking too long",
              "Need to change items in order",
            ].map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setCancelReason(reason)}
                className={`p-3.5 rounded-2xl mb-2 border ${
                  cancelReason === reason ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                }`}
              >
                <Text className="text-xs font-bold text-[#1C1917]">{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmCancel}
              className="w-full bg-[#DC2626] py-4 rounded-full items-center justify-center mt-3 mb-2"
            >
              <Text className="text-sm font-black text-white">Confirm Cancellation &amp; Refund</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCancelModalOrder(null)}
              className="w-full py-2 items-center justify-center"
            >
              <Text className="text-xs font-bold text-[#78716C]">Keep My Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tip Delivery Rider Modal */}
      <Modal visible={!!tipModalOrder} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Tip Your Rider 🛵
              </Text>
              <TouchableOpacity onPress={() => setTipModalOrder(null)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#78716C] mb-4 font-medium leading-5">
              100% of your tip goes directly to Kwame Asante for fast, careful food delivery.
            </Text>

            <View className="flex-row mb-5">
              {[5, 10, 20].map((amt) => {
                const isSelected = selectedTip === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setSelectedTip(amt)}
                    className={`flex-1 py-3 rounded-2xl border items-center mr-2.5 last:mr-0 ${
                      isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text className={`text-base font-black ${isSelected ? "text-[#FF6000]" : "text-[#1C1917]"}`}>
                      GH₵ {amt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmTip}
              className="w-full bg-[#16A34A] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Send GH₵ {selectedTip.toFixed(2)} Tip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Itemized Receipt & Tax Invoice Modal */}
      <Modal visible={!!selectedReceipt} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6] max-h-[85%]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-lg font-black text-[#1C1917]">
                  Tax Invoice #{selectedReceipt?.id}
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5">{selectedReceipt?.date}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedReceipt(null)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-4">
                <Text className="text-xs font-black uppercase tracking-wider text-[#1C1917] mb-3">
                  Itemized Meals
                </Text>
                {selectedReceipt?.items.map((it, idx) => (
                  <View key={idx} className="flex-row justify-between mb-2.5 pb-2.5 border-b border-[#EFE5D6]/60">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs font-bold text-[#1C1917]">
                        {it.qty || it.quantity || 1}x {it.name || it.title}
                      </Text>
                      {it.portion ? (
                        <Text className="text-[11px] text-[#78716C] mt-0.5">Portion: {it.portion}</Text>
                      ) : null}
                    </View>
                    <Text className="text-xs font-black text-[#1C1917]">
                      GH₵ {((it.price || 0) * (it.qty || it.quantity || 1)).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View className="pt-1">
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-xs text-[#78716C]">Subtotal</Text>
                    <Text className="text-xs font-bold text-[#1C1917]">
                      GH₵ {selectedReceipt?.subtotal?.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-xs text-[#78716C]">Delivery Fee</Text>
                    <Text className="text-xs font-bold text-[#1C1917]">
                      GH₵ {selectedReceipt?.deliveryFee?.toFixed(2)}
                    </Text>
                  </View>
                  {selectedReceipt?.discount > 0 ? (
                    <View className="flex-row justify-between mb-1.5">
                      <Text className="text-xs text-[#16A34A] font-bold">Promo Discount</Text>
                      <Text className="text-xs font-bold text-[#16A34A]">
                        - GH₵ {selectedReceipt?.discount?.toFixed(2)}
                      </Text>
                    </View>
                  ) : null}
                  <View className="border-t border-[#EFE5D6] pt-2 mt-1 flex-row justify-between items-center">
                    <Text className="text-sm font-black text-[#1C1917]">Total Paid</Text>
                    <Text className="text-base font-black text-[#FF6000]">
                      GH₵ {selectedReceipt?.total?.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white border border-[#EFE5D6] rounded-2xl p-4 mb-5">
                <View className="flex-row items-center mb-2">
                  <Feather name="credit-card" size={15} color="#78716C" />
                  <Text className="text-xs font-bold text-[#1C1917] ml-2">
                    Payment: {selectedReceipt?.paymentMethod}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Feather name="map-pin" size={15} color="#78716C" />
                  <Text className="text-xs text-[#78716C] ml-2 flex-1 font-medium">
                    Delivered to: {selectedReceipt?.deliveryAddress}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => Alert.alert("Invoice Downloaded", "PDF tax invoice has been saved to device downloads.")}
                className="w-full bg-[#1C1917] py-4 rounded-full items-center justify-center flex-row mb-3"
              >
                <Feather name="download" size={16} color="#ffffff" />
                <Text className="text-sm font-black text-white ml-2">Download PDF Tax Invoice</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Live Order Tracking on Visual Map Modal */}
      <Modal visible={!!selectedTracking} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6] max-h-[90%]">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-lg font-black text-[#1C1917]">
                  Live Rider Tracker #{selectedTracking?.id}
                </Text>
                <Text className="text-xs font-bold text-[#FF6000] mt-0.5">
                  ETA: {selectedTracking?.eta} • 1.8 km to doorstep
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTracking(null)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Visual Map Simulator */}
              <View className="w-full h-52 bg-[#CBD5E1] rounded-[24px] mb-4 relative overflow-hidden items-center justify-center">
                <View className="absolute inset-0 opacity-40">
                  <View className="w-full h-2 bg-white my-6" />
                  <View className="w-full h-2 bg-white my-10" />
                  <View className="h-full w-2 bg-white absolute left-20" />
                  <View className="h-full w-2 bg-white absolute right-24" />
                </View>

                <View className="absolute left-20 top-14 right-24 bottom-12 border-b-4 border-l-4 border-dashed border-[#FF6000]" />

                <View className="absolute left-16 top-8 items-center">
                  <View className="w-8 h-8 rounded-full bg-[#1C1917] items-center justify-center border-2 border-white">
                    <Feather name="home" size={14} color="#ffffff" />
                  </View>
                  <Text className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded mt-0.5">Kitchen</Text>
                </View>

                <View className="absolute top-20 left-32 items-center">
                  <View className="w-10 h-10 rounded-full bg-[#FF6000] items-center justify-center border-2 border-white">
                    <MaterialCommunityIcons name="moped" size={20} color="#ffffff" />
                  </View>
                  <Text className="text-[9px] font-black text-white bg-[#1C1917] px-2 py-0.5 rounded-full mt-0.5">
                    Speed: 38 km/h
                  </Text>
                </View>

                <View className="absolute right-16 bottom-6 items-center">
                  <View className="w-8 h-8 rounded-full bg-[#16A34A] items-center justify-center border-2 border-white">
                    <Feather name="map-pin" size={14} color="#ffffff" />
                  </View>
                  <Text className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded mt-0.5">Doorstep</Text>
                </View>
              </View>

              {/* Handover OTP Pill */}
              <View className="bg-[#FFF8F3] border border-[#FED7AA] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-black uppercase tracking-wider text-[#FF6000]">
                    Drop-off Handover Code
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5">
                    Give this 4-digit code to rider upon arrival:
                  </Text>
                </View>
                <View className="bg-[#1C1917] px-4 py-2 rounded-xl">
                  <Text className="text-xl font-black text-white tracking-widest">
                    5824
                  </Text>
                </View>
              </View>

              {/* Rider Contact Card */}
              {selectedTracking?.rider && (
                <View className="bg-white border border-[#EFE5D6] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 rounded-full bg-[#FFF3EB] items-center justify-center mr-3 border border-[#FED7AA]">
                      <MaterialCommunityIcons name="moped" size={22} color="#FF6000" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-[#1C1917]">
                        {selectedTracking.rider.name}
                      </Text>
                      <Text className="text-xs text-[#78716C] mt-0.5">
                        {selectedTracking.rider.vehicle}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => Alert.alert("SMS Rider", `Opening messaging to ${selectedTracking.rider.name}...`)}
                      className="w-10 h-10 rounded-full bg-[#1C1917] items-center justify-center mr-2"
                    >
                      <Feather name="message-square" size={16} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => Alert.alert("Calling Rider", `Dialing ${selectedTracking.rider.phone}...`)}
                      className="w-10 h-10 rounded-full bg-[#16A34A] items-center justify-center"
                    >
                      <Feather name="phone" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Advance order milestone button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  advanceOrderStatus(selectedTracking.id);
                  setSelectedTracking((prev) => ({
                    ...prev,
                    step: (prev.step || 2) + 1,
                    status: (prev.step || 2) + 1 >= 5 ? "Delivered" : "Arrived at Doorstep",
                  }));
                }}
                className="w-full bg-[#FF6000] py-3.5 rounded-full items-center justify-center mb-2"
              >
                <Text className="text-sm font-black text-white">Simulate Next Delivery Milestone &rarr;</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Ratings & Reviews Modal */}
      <Modal visible={!!ratingOrder} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Rate Meal &amp; Delivery #{ratingOrder?.id}
              </Text>
              <TouchableOpacity onPress={() => setRatingOrder(null)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#78716C] mb-4 font-medium">
              Rate food crispiness, taste and delivery rider speed:
            </Text>

            {/* Food Stars */}
            <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-1">
              Food Quality &amp; Taste
            </Text>
            <View className="flex-row mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setFoodStars(star)} className="mr-3">
                  <Ionicons name={star <= foodStars ? "star" : "star-outline"} size={30} color="#FF6000" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Rider Stars */}
            <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-1">
              Rider Politeness &amp; Speed
            </Text>
            <View className="flex-row mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRiderStars(star)} className="mr-3">
                  <Ionicons name={star <= riderStars ? "star" : "star-outline"} size={26} color="#F59E0B" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Review feedback */}
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3.5 mb-5">
              <TextInput
                value={reviewNote}
                onChangeText={setReviewNote}
                placeholder="Share your thoughts about crispiness, packaging or temperature..."
                placeholderTextColor="#A8A29E"
                multiline
                numberOfLines={3}
                className="text-xs font-bold text-[#1C1917] h-16"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSubmitRating}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Save Review &amp; Rating</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
