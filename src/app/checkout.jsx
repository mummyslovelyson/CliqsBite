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
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    placeOrder,
    savedAddresses,
    currentUser,
    isAuthenticated,
    validateCoupon,
    liveSettings,
  } = useCart();
  const [deliveryType, setDeliveryType] = useState("delivery"); // 'delivery' or 'pickup'
  const [deliveryAddress, setDeliveryAddress] = useState(
    savedAddresses && savedAddresses.length > 0 ? savedAddresses[0].address : ""
  );
  const [paymentMethod, setPaymentMethod] = useState("momo"); // 'momo', 'card', 'cash'
  const [momoProvider, setMomoProvider] = useState("mtn"); // 'mtn', 'telecel', 'airteltigo'
  const [momoNumber, setMomoNumber] = useState(currentUser?.phone || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0.0);

  // Pricing based on real cart and Admin Settings
  const settingFee =
    liveSettings?.baseDeliveryFee !== undefined
      ? Number(liveSettings.baseDeliveryFee)
      : 15.0;
  const baseDeliveryFee =
    deliveryType === "delivery" ? (cart.length > 0 ? settingFee : 0.0) : 0.0;
  const deliveryFee =
    appliedPromo?.freeDelivery || appliedPromo?.code === "FREESHIP"
      ? 0.0
      : baseDeliveryFee;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      Alert.alert("Enter Code", "Please enter a promo or voucher code.");
      return;
    }

    const result = validateCoupon ? validateCoupon(code, subtotal) : null;
    if (result && result.valid) {
      setAppliedPromo(result);
      setDiscountAmount(result.discountAmount || 0);
      Alert.alert(
        "Promo Applied! 🎉",
        result.discountAmount > 0
          ? `GH₵ ${result.discountAmount.toFixed(
              2
            )} discount applied to your order!`
          : "Free delivery applied to your order!"
      );
    } else {
      Alert.alert(
        "Invalid Coupon",
        result?.message || "This voucher code is invalid or expired."
      );
    }
    setPromoInput("");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0.0);
  };

  const handlePlaceOrder = () => {
    if (liveSettings?.isKitchenOpen === false) {
      Alert.alert(
        "Kitchen Closed",
        "The CliqsBite kitchen is currently closed for incoming orders as set by admin. Please check back shortly."
      );
      return;
    }
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add meals to your cart before proceeding to checkout.", [
        { text: "Browse Menu", onPress: () => router.push("/menu") },
      ]);
      return;
    }

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      Alert.alert("Address Required", "Please enter your delivery street or apartment address.");
      return;
    }

    if (paymentMethod === "momo") {
      const cleanPhone = momoNumber.replace(/[\s-]/g, "");
      if (!cleanPhone || cleanPhone.length < 10) {
        Alert.alert("Valid Phone Required", "Please enter a valid 10-digit Ghanaian Mobile Money number (e.g. 0244123456).");
        return;
      }
    }

    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/[\s-]/g, "");
      if (!cleanCard || cleanCard.length < 16) {
        Alert.alert("Valid Card Required", "Please enter your 16-digit debit/credit card number.");
        return;
      }
    }

    const orderObj = placeOrder({
      items: [...cart],
      subtotal,
      deliveryFee,
      discount: discountAmount + (appliedPromo?.code === "FREESHIP" ? baseDeliveryFee : 0),
      total,
      deliveryType,
      deliveryAddress: deliveryType === "delivery" ? deliveryAddress.trim() : "CliqsBite Kitchen - East Legon Hub",
      customerName: currentUser?.fullName || "Valued Customer",
      customerPhone: currentUser?.phone || momoNumber || "N/A",
      paymentMethod:
        paymentMethod === "momo"
          ? `${momoProvider.toUpperCase()} MoMo (${momoNumber})`
          : paymentMethod === "card"
          ? `Card (**** ${cardNumber.slice(-4) || "4092"})`
          : "Cash on Delivery",
      notes: orderNotes.trim(),
    });

    setPlacedOrder(orderObj);
    setOrderSuccess(true);
  };

  // ECC Security Lens: Guard checkout from unauthenticated access
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "bottom", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

        <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
          >
            <Feather name="arrow-left" size={20} color="#1C1917" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-xl font-black text-[#1C1917] tracking-tight">Checkout</Text>
            <Text className="text-xs font-semibold text-[#DC2626] mt-0.5">Authentication Required</Text>
          </View>
          <View className="w-11" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 40, alignItems: "center" }}
        >
          <View className="w-24 h-24 rounded-full bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mb-6">
            <View
              style={{ elevation: 2 }}
              className="w-16 h-16 rounded-full bg-[#FF6000] items-center justify-center"
            >
              <Feather name="shield" size={28} color="#ffffff" />
            </View>
          </View>

          <Text className="text-2xl font-black text-[#1C1917] text-center mb-2 tracking-tight">
            Sign In to Complete Checkout
          </Text>
          <Text className="text-sm font-medium text-[#78716C] text-center leading-5 mb-8 px-2">
            Please log in or create an account so we can link your meal order, deliver updates via SMS, and track your rider in real time.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: "/auth/login", params: { redirect: "/checkout" } })}
            style={{ elevation: 2 }}
            className="w-full bg-[#FF6000] py-4 rounded-2xl flex-row items-center justify-center mb-3.5"
          >
            <Feather name="log-in" size={19} color="#ffffff" />
            <Text className="text-white text-base font-black ml-2.5">Sign In to Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: "/auth/register", params: { redirect: "/checkout" } })}
            style={{ elevation: 1 }}
            className="w-full bg-white border-2 border-[#FF6000] py-4 rounded-2xl flex-row items-center justify-center mb-6"
          >
            <Feather name="user-plus" size={19} color="#FF6000" />
            <Text className="text-[#FF6000] text-base font-black ml-2.5">Create New Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => router.push("/menu")}
            className="py-2"
          >
            <Text className="text-sm font-bold text-[#78716C]">Continue Browsing Menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

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

        <View className="items-center">
          <Text className="text-xl font-black text-[#1C1917] tracking-tight">
            Checkout
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
            Finalize Your Meal Order
          </Text>
        </View>

        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 130 }}
      >
        {/* 1. Fulfillment Option (Delivery vs Pickup) */}
        <View className="bg-white border border-[#EFE5D6] rounded-[22px] p-2 mb-4 flex-row">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDeliveryType("delivery")}
            className={`flex-1 py-3.5 rounded-2xl items-center flex-row justify-center ${
              deliveryType === "delivery" ? "bg-[#FF6000]" : "bg-transparent"
            }`}
          >
            <MaterialCommunityIcons
              name="moped"
              size={20}
              color={deliveryType === "delivery" ? "#ffffff" : "#78716C"}
            />
            <Text
              className={`text-sm font-bold ml-2 ${
                deliveryType === "delivery" ? "text-white" : "text-[#78716C]"
              }`}
            >
              Door Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDeliveryType("pickup")}
            className={`flex-1 py-3.5 rounded-2xl items-center flex-row justify-center ${
              deliveryType === "pickup" ? "bg-[#FF6000]" : "bg-transparent"
            }`}
          >
            <Feather
              name="shopping-bag"
              size={18}
              color={deliveryType === "pickup" ? "#ffffff" : "#78716C"}
            />
            <Text
              className={`text-sm font-bold ml-2 ${
                deliveryType === "pickup" ? "text-white" : "text-[#78716C]"
              }`}
            >
              Pick Up at Branch
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Delivery Address */}
        {deliveryType === "delivery" ? (
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2 px-1">
              <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917]">
                Delivery Address
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setDeliveryAddress("Boundary Road, East Legon, Accra")}
              >
                <Text className="text-xs font-bold text-[#FF6000]">Use GPS Location</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4">
              {savedAddresses && savedAddresses.length > 0 && (
                <View className="mb-3">
                  <Text className="text-xs font-bold text-[#78716C] mb-1.5">Select Saved Address:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {savedAddresses.map((addr) => (
                      <TouchableOpacity
                        key={addr.id}
                        onPress={() => setDeliveryAddress(addr.address)}
                        className={`px-3 py-1.5 rounded-full mr-2 border ${
                          deliveryAddress === addr.address
                            ? "bg-[#FF6000] border-[#FF6000]"
                            : "bg-[#FAF4EB] border-[#EFE5D6]"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            deliveryAddress === addr.address ? "text-white" : "text-[#1C1917]"
                          }`}
                        >
                          {addr.label}: {addr.address}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View className="flex-row items-center mb-2.5">
                <View className="w-8 h-8 rounded-full bg-[#FFF3EB] items-center justify-center mr-2.5">
                  <Feather name="map-pin" size={15} color="#FF6000" />
                </View>
                <Text className="text-sm font-bold text-[#1C1917]">
                  Delivery Location
                </Text>
              </View>
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter street name, house number, area or city"
                placeholderTextColor="#A8A29E"
                className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 text-base text-[#1C1917] font-semibold"
              />
            </View>
          </View>
        ) : (
          <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-4">
            <View className="flex-row items-center mb-1.5">
              <Feather name="map-pin" size={18} color="#FF6000" />
              <Text className="text-base font-black text-[#1C1917] ml-2">
                CliqsBite Kitchen - East Legon Hub
              </Text>
            </View>
            <Text className="text-sm text-[#78716C] ml-6 leading-5 font-medium">
              Lagos Avenue, Opposite A&amp;C Mall, East Legon, Accra
            </Text>
            <Text className="text-xs font-bold text-[#16A34A] ml-6 mt-1.5">
              Estimated Ready Time: 15 - 20 mins
            </Text>
          </View>
        )}

        {/* 3. Apply Promo Code Section */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-4">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-2.5">
            Promo / Discount Voucher
          </Text>

          {appliedPromo ? (
            <View className="bg-[#FFF8F3] border border-[#FED7AA] rounded-2xl p-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="pricetag" size={18} color="#FF6000" />
                <View className="ml-2.5">
                  <Text className="text-sm font-black text-[#FF6000]">{appliedPromo.code}</Text>
                  <Text className="text-xs text-[#78716C]">{appliedPromo.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemovePromo} className="p-1">
                <Feather name="x-circle" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center">
              <View className="flex-1 bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-3.5 py-2.5 mr-2">
                <TextInput
                  value={promoInput}
                  onChangeText={setPromoInput}
                  placeholder="Enter code (e.g. CLIQS25, FREESHIP)"
                  placeholderTextColor="#A8A29E"
                  autoCapitalize="characters"
                  className="text-sm font-bold text-[#1C1917]"
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleApplyPromo}
                className="bg-[#1C1917] px-4 py-3 rounded-xl"
              >
                <Text className="text-xs font-black text-white">Apply</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4. Payment Method & Online Pay */}
        <View className="mb-4">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-2.5 px-1">
            Payment Method
          </Text>

          {/* MoMo Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("momo")}
            className={`bg-white rounded-[24px] p-4 mb-2.5 border ${
              paymentMethod === "momo" ? "border-2 border-[#FF6000]" : "border-[#EFE5D6]"
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-[#FEF08A] items-center justify-center mr-3">
                  <MaterialCommunityIcons name="cellphone-check" size={20} color="#854D0E" />
                </View>
                <View>
                  <Text className="text-base font-black text-[#1C1917]">
                    Mobile Money (MoMo)
                  </Text>
                  <Text className="text-xs text-[#78716C] font-medium">
                    Instant prompt sent to your phone
                  </Text>
                </View>
              </View>
              {paymentMethod === "momo" && (
                <Ionicons name="checkmark-circle" size={20} color="#FF6000" />
              )}
            </View>

            {paymentMethod === "momo" && (
              <View className="pt-2 border-t border-[#F5EDE1]">
                <View className="flex-row mb-3">
                  {[
                    { id: "mtn", label: "MTN MoMo" },
                    { id: "telecel", label: "Telecel Cash" },
                    { id: "airteltigo", label: "ATMoney" },
                  ].map((prov) => (
                    <TouchableOpacity
                      key={prov.id}
                      onPress={() => setMomoProvider(prov.id)}
                      className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                        momoProvider === prov.id
                          ? "bg-[#FF6000] border-[#FF6000]"
                          : "bg-[#FAF4EB] border-[#EFE5D6]"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          momoProvider === prov.id ? "text-white" : "text-[#78716C]"
                        }`}
                      >
                        {prov.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 flex-row items-center">
                  <Feather name="phone" size={16} color="#78716C" />
                  <TextInput
                    value={momoNumber}
                    onChangeText={setMomoNumber}
                    placeholder="Enter Mobile Money phone number"
                    placeholderTextColor="#A8A29E"
                    keyboardType="phone-pad"
                    className="flex-1 ml-2.5 text-base font-bold text-[#1C1917]"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Card Payment Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("card")}
            className={`bg-white rounded-[24px] p-4 mb-2.5 border ${
              paymentMethod === "card" ? "border-2 border-[#FF6000]" : "border-[#EFE5D6]"
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <FontAwesome5 name="credit-card" size={16} color="#1D4ED8" />
                </View>
                <View>
                  <Text className="text-base font-black text-[#1C1917]">
                    Debit / Credit Card
                  </Text>
                  <Text className="text-xs text-[#78716C] font-medium">
                    Visa, Mastercard &amp; GhLink
                  </Text>
                </View>
              </View>
              {paymentMethod === "card" && (
                <Ionicons name="checkmark-circle" size={20} color="#FF6000" />
              )}
            </View>

            {paymentMethod === "card" && (
              <View className="pt-2 border-t border-[#F5EDE1]">
                <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 mb-2 flex-row items-center">
                  <Feather name="credit-card" size={16} color="#78716C" />
                  <TextInput
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="Card Number (16 digits)"
                    placeholderTextColor="#A8A29E"
                    keyboardType="numeric"
                    maxLength={19}
                    className="flex-1 ml-2.5 text-base font-bold text-[#1C1917]"
                  />
                </View>
                <View className="flex-row">
                  <View className="flex-1 bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 mr-2">
                    <TextInput
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      placeholder="MM/YY"
                      placeholderTextColor="#A8A29E"
                      keyboardType="numeric"
                      maxLength={5}
                      className="text-base font-bold text-[#1C1917]"
                    />
                  </View>
                  <View className="flex-1 bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                    <TextInput
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      placeholder="CVV"
                      placeholderTextColor="#A8A29E"
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      className="text-base font-bold text-[#1C1917]"
                    />
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Cash / Counter Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("cash")}
            className={`bg-white rounded-[24px] p-4 border ${
              paymentMethod === "cash" ? "border-2 border-[#FF6000]" : "border-[#EFE5D6]"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center mr-3">
                  <MaterialCommunityIcons name="cash" size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-base font-black text-[#1C1917]">
                    {deliveryType === "delivery" ? "Cash on Delivery" : "Pay at Pickup Counter"}
                  </Text>
                  <Text className="text-xs text-[#78716C] font-medium">
                    Pay upon meal handover
                  </Text>
                </View>
              </View>
              {paymentMethod === "cash" && (
                <Ionicons name="checkmark-circle" size={20} color="#FF6000" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Delivery Instructions */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-4">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-2 px-1">
            Order Notes / Instructions
          </Text>
          <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 min-h-[75px]">
            <TextInput
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Add gate code, dietary requests or directions..."
              placeholderTextColor="#A8A29E"
              multiline
              numberOfLines={2}
              className="text-base text-[#1C1917] font-medium"
            />
          </View>
        </View>

        {/* 6. Payment Summary in Cedis */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-4">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-3">
            Payment Summary
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-[#78716C]">Items Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</Text>
            <Text className="text-sm font-bold text-[#1C1917]">GH₵ {subtotal.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-[#78716C]">Delivery Fee</Text>
            <Text className="text-sm font-bold text-[#1C1917]">
              {deliveryFee === 0 ? "FREE" : `GH₵ ${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {(discountAmount > 0 || appliedPromo?.code === "FREESHIP") && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-[#16A34A] font-bold">Voucher Discount</Text>
              <Text className="text-sm font-bold text-[#16A34A]">
                - GH₵ {(discountAmount + (appliedPromo?.code === "FREESHIP" ? baseDeliveryFee : 0)).toFixed(2)}
              </Text>
            </View>
          )}

          <View className="border-t border-[#F5EDE1] pt-3 mt-1 flex-row justify-between items-center">
            <Text className="text-base font-black text-[#1C1917]">Total to Pay</Text>
            <Text className="text-2xl font-black text-[#FF6000]">
              GH₵ {total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Order Confirmation Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#FAF4EB] border-t border-[#EFE5D6] px-5 pt-3 pb-6">
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handlePlaceOrder}
          className="w-full bg-[#FF6000] py-4 rounded-full flex-row items-center justify-between px-6"
        >
          <View>
            <Text className="text-xs font-semibold text-orange-100 uppercase tracking-wider">
              Total Amount
            </Text>
            <Text className="text-lg font-black text-white">
              GH₵ {total.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-base font-black text-white mr-2">
              Confirm &amp; Place Order
            </Text>
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
              <Feather name="check" size={16} color="#FF6000" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Order Success Modal */}
      <Modal visible={orderSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-[32px] p-6 w-full max-w-sm items-center border border-[#EFE5D6]">
            <View className="w-20 h-20 rounded-full bg-[#F0FDF4] border-4 border-[#DCFCE7] items-center justify-center mb-4">
              <Ionicons name="checkmark" size={42} color="#16A34A" />
            </View>

            <Text className="text-2xl font-black text-[#1C1917] text-center mb-1">
              Order Confirmed! 🎉
            </Text>
            <Text className="text-sm text-[#78716C] text-center mb-5 leading-5 font-medium">
              Order #{placedOrder?.id} has been transmitted to CliqsBite kitchen! Frying has begun.
            </Text>

            <View className="w-full bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-5">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-sm text-[#78716C]">Payment</Text>
                <Text className="text-sm font-bold text-[#1C1917]">{placedOrder?.paymentMethod}</Text>
              </View>
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-sm text-[#78716C]">Fulfillment</Text>
                <Text className="text-sm font-bold text-[#1C1917] capitalize">{placedOrder?.deliveryType}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-[#78716C]">Total Charged</Text>
                <Text className="text-base font-black text-[#FF6000]">GH₵ {placedOrder?.total.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setOrderSuccess(false);
                router.push("/profile/orders");
              }}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center mb-3"
            >
              <Text className="text-sm font-black text-white">Track Order Status &amp; Map &rarr;</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setOrderSuccess(false);
                router.push("/");
              }}
              className="py-2"
            >
              <Text className="text-sm font-bold text-[#78716C]">Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
