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
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    isAuthenticated,
  } = useCart();

  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0.0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (code === "CLIQS25") {
      setDiscount(25.0);
      setAppliedVoucher("CLIQS25 (GH₵ 25 OFF)");
      setVoucherCode("");
    } else if (code.length > 0) {
      setDiscount(10.0);
      setAppliedVoucher(`${code} (GH₵ 10 OFF)`);
      setVoucherCode("");
    }
  };

  const finalTotal = Math.max(0, total - discount);

  // AUTHENTICATION GATE: User must sign up / sign in before accessing the cart
  if (!isAuthenticated) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#FAF4EB]"
        edges={["top", "bottom", "left", "right"]}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

        {/* Top Header */}
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
              My Cart
            </Text>
            <Text className="text-xs font-semibold text-[#DC2626] mt-0.5">
              Sign In Required
            </Text>
          </View>
          <View className="w-11" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 32,
            alignItems: "center",
          }}
        >
          {/* Lock / Security Shield Illustration */}
          <View className="w-24 h-24 rounded-full bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mb-6">
            <View
              style={{ elevation: 2 }}
              className="w-16 h-16 rounded-full bg-[#FF6000] items-center justify-center"
            >
              <Feather name="lock" size={28} color="#ffffff" />
            </View>
          </View>

          {/* Heading & Information */}
          <Text className="text-2xl font-black text-[#1C1917] text-center mb-2 tracking-tight">
            Sign In to Access Your Cart
          </Text>
          <Text className="text-sm font-medium text-[#78716C] text-center leading-6 mb-8 max-w-[320px]">
            Please sign in or create a CliqsBite account to review your selected
            meals, apply voucher codes, and complete your order.
          </Text>

          {/* Value Badges */}
          <View className="w-full bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-8">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-[#DCFCE7] items-center justify-center mr-3">
                <Feather name="shield" size={16} color="#16A34A" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black text-[#1C1917]">
                  Secure Account &amp; Order Protection
                </Text>
                <Text className="text-[11px] text-[#78716C]">
                  Your meals and preferences are saved safely
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-[#EFF6FF] items-center justify-center mr-3">
                <Feather name="tag" size={16} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black text-[#1C1917]">
                  Exclusive Discounts &amp; CliqsPoints
                </Text>
                <Text className="text-[11px] text-[#78716C]">
                  Redeem MoMo coupons on checkout
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#FFF7ED] items-center justify-center mr-3">
                <Feather name="map-pin" size={16} color="#EA580C" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black text-[#1C1917]">
                  Live GPS Order &amp; Rider Tracking
                </Text>
                <Text className="text-[11px] text-[#78716C]">
                  Follow delivery in real time to your door
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }} className="w-full">
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/auth/login",
                  params: { redirect: "/cart" },
                })
              }
              style={{ elevation: 2 }}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center border border-[#EA580C] mb-3"
            >
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                Sign In to My Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/auth/register",
                  params: { redirect: "/cart" },
                })
              }
              className="w-full bg-white border border-[#EFE5D6] py-3.5 rounded-full items-center justify-center mb-3"
            >
              <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider">
                Create a Free Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/menu")}
              className="w-full py-2 items-center justify-center"
            >
              <Text className="text-xs font-bold text-[#78716C] underline">
                Continue Browsing Menu First
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAF4EB]"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Fixed Top Header */}
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
            My Cart
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
            {cart.length} item{cart.length !== 1 ? "s" : ""} selected
          </Text>
        </View>

        {cart.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={clearCart}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-sm font-bold text-[#DC2626]">Clear</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-11" />
        )}
      </View>

      {/* Cart Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 130,
        }}
      >
        {cart.length === 0 ? (
          <View className="items-center justify-center py-24">
            <View className="w-24 h-24 rounded-full bg-white border border-[#EFE5D6] items-center justify-center mb-5">
              <Feather name="shopping-bag" size={34} color="#A8A29E" />
            </View>
            <Text className="text-xl font-black text-[#1C1917] mb-2">
              Your cart is empty
            </Text>
            <Text className="text-sm text-[#78716C] text-center max-w-[280px] leading-6 mb-6 font-medium">
              Looks like you haven&apos;t added any delicious bites to your cart yet.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/menu")}
              className="bg-[#FF6000] px-7 py-3 rounded-full flex-row items-center"
            >
              <Feather name="compass" size={17} color="#ffffff" className="mr-2" />
              <Text className="text-sm font-black text-white ml-2">Explore Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <View className="mb-5">
              {cart.map((item) => {
                const details = [
                  item.portion,
                  item.spiceLevel,
                  ...(item.addons || []),
                ]
                  .filter(Boolean)
                  .join(" • ");

                return (
                  <View
                    key={item.cartItemId}
                    className="bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-3 flex-row items-center"
                  >
                    {/* Food Thumbnail */}
                    <View style={{ width: 78, height: 78, borderRadius: 18, overflow: "hidden" }} className="mr-3.5">
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={150}
                      />
                    </View>

                    {/* Title & Details */}
                    <View className="flex-1 pr-2">
                      <Text className="text-base font-black text-[#1C1917]" numberOfLines={1}>
                        {item.title}
                      </Text>
                      {details.length > 0 && (
                        <Text className="text-xs font-medium text-[#78716C] mb-1.5 leading-4" numberOfLines={2}>
                          {details}
                        </Text>
                      )}
                      <Text className="text-base font-black text-[#FF6000]">
                        GH₵ {item.price.toFixed(2)}
                      </Text>
                    </View>

                    {/* Quantity Stepper & Delete */}
                    <View className="items-end">
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.cartItemId)}
                        className="p-1 mb-2"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="trash-2" size={16} color="#DC2626" />
                      </TouchableOpacity>

                      <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-full px-2.5 py-1">
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 rounded-full items-center justify-center bg-white"
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="minus" size={13} color="#1C1917" />
                        </TouchableOpacity>
                        <Text className="mx-2.5 text-sm font-black text-[#1C1917]">
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.cartItemId, 1)}
                          className="w-6 h-6 rounded-full items-center justify-center bg-[#FF6000]"
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="plus" size={13} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Voucher Code Input */}
            <View className="bg-white border border-[#EFE5D6] rounded-[22px] p-3.5 mb-5 flex-row items-center">
              <Ionicons name="pricetag-outline" size={20} color="#FF6000" className="mr-2" />
              <TextInput
                value={voucherCode}
                onChangeText={setVoucherCode}
                placeholder={appliedVoucher ? `Applied: ${appliedVoucher}` : "Enter voucher (e.g. CLIQS25)"}
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-sm text-[#1C1917] font-semibold uppercase"
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleApplyVoucher}
                className="bg-[#1C1917] px-4 py-2.5 rounded-xl ml-2"
              >
                <Text className="text-xs font-black text-white">Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Bill Summary */}
            <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-4">
              <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-3">
                Order Summary
              </Text>

              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-[#78716C]">
                  Items Subtotal
                </Text>
                <Text className="text-sm font-bold text-[#1C1917]">
                  GH₵ {subtotal.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-[#78716C]">
                  Delivery Fee
                </Text>
                <Text className="text-sm font-bold text-[#1C1917]">
                  GH₵ {deliveryFee.toFixed(2)}
                </Text>
              </View>

              {discount > 0 && (
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-bold text-[#16A34A]">
                    Voucher Discount
                  </Text>
                  <Text className="text-sm font-bold text-[#16A34A]">
                    - GH₵ {discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View className="h-px bg-[#EFE5D6] my-2.5" />

              <View className="flex-row items-center justify-between">
                <Text className="text-base font-black text-[#1C1917]">
                  Total Amount
                </Text>
                <Text className="text-2xl font-black text-[#FF6000]">
                  GH₵ {finalTotal.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Delivery Location Note */}
            <View className="bg-[#FFF3EB] border border-[#FED7AA] rounded-[22px] p-3.5 flex-row items-center mb-6">
              <View className="w-9 h-9 rounded-full bg-[#FF6000] items-center justify-center mr-3">
                <Feather name="map-pin" size={17} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1C1917]">
                  Doorstep Delivery
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Fresh homemade meals delivered sizzling hot to you
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      {cart.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-[#FAF4EB] border-t border-[#EFE5D6] px-5 pt-3 pb-6">
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/checkout")}
            className="w-full bg-[#FF6000] py-4 rounded-full flex-row items-center justify-between px-6"
          >
            <View>
              <Text className="text-xs font-semibold text-orange-100 uppercase tracking-wider">
                Total (incl. tax)
              </Text>
              <Text className="text-lg font-black text-white">
                GH₵ {finalTotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-base font-black text-white mr-2">
                Checkout
              </Text>
              <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
                <Feather name="arrow-right" size={16} color="#FF6000" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
