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
import { useLocalSearchParams, useRouter } from "expo-router";
import { MENU_ITEMS } from "../../data/menuData";
import { useCart } from "../../context/CartContext";

export default function FoodDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart, liveMenu } = useCart();

  // Find item by ID from Admin Dashboard liveMenu or default
  const source =
    liveMenu && Array.isArray(liveMenu) && liveMenu.length > 0
      ? liveMenu
      : MENU_ITEMS;
  const item = source.find((food) => food.id === id) || source[0];
  const isAvailable = item.inStock !== false && item.isAvailable !== false;

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0); // Index of portionSizes
  const [selectedSpicy, setSelectedSpicy] = useState(0); // Index of spicyLevels
  const [selectedAddons, setSelectedAddons] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [addedMessage, setAddedMessage] = useState(false);

  // Calculate dynamic price
  const sizeExtra = item.portionSizes ? item.portionSizes[selectedSize]?.extra || 0 : 0;
  const addonsTotal = (item.availableAddons || []).reduce((sum, addon) => {
    return sum + (selectedAddons[addon.id] ? addon.price : 0);
  }, 0);

  const unitPrice = item.price + sizeExtra + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    const selectedPortion = item.portionSizes ? item.portionSizes[selectedSize]?.name : null;
    const spiceLevel = item.spicyLevels ? item.spicyLevels[selectedSpicy] : null;
    const addons = (item.availableAddons || [])
      .filter((addon) => selectedAddons[addon.id])
      .map((addon) => addon.name);

    addToCart({
      id: item.id,
      title: item.title,
      price: unitPrice,
      quantity: quantity,
      portion: selectedPortion,
      spiceLevel: spiceLevel,
      addons: addons,
      image: item.image,
      notes: specialInstructions,
    });

    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
      router.push("/cart");
    }, 600);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1917" />

      {/* Main Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* 1. Hero Food Image Header */}
        <View className="relative w-full h-80 bg-zinc-900">
          <Image
            source={{ uri: item.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />

          {/* Navigation Overlay Buttons */}
          <View className="absolute top-4 left-5 right-5 flex-row items-center justify-between">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-white/95 items-center justify-center border border-white/40"
            >
              <Feather name="arrow-left" size={20} color="#1C1917" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsFavorite(!isFavorite)}
              className="w-11 h-11 rounded-full bg-white/95 items-center justify-center border border-white/40"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#FF6000" : "#1C1917"}
              />
            </TouchableOpacity>
          </View>

          {/* Floating Rating Pill */}
          <View className="absolute bottom-4 left-5 bg-black/70 px-3.5 py-1.5 rounded-full flex-row items-center border border-white/20">
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text className="text-xs font-black text-white ml-1.5">
              {item.rating}{" "}
              <Text className="text-xs text-zinc-300 font-normal">
                ({item.reviews} reviews)
              </Text>
            </Text>
          </View>

          {/* Availability Badge */}
          <View className="absolute bottom-4 right-5 bg-[#F0FDF4] px-3.5 py-1.5 rounded-full flex-row items-center border border-[#BBF7D0]">
            <View className="w-2 h-2 rounded-full bg-[#16A34A] mr-1.5" />
            <Text className="text-xs font-black text-[#16A34A]">In Stock • Ready to Fry</Text>
          </View>
        </View>

        {/* 2. Content Body */}
        <View className="px-5 pt-5">
          {/* Title & Base Price in Cedis */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 pr-3">
              <Text className="text-2xl font-black text-[#1C1917] tracking-tight leading-7">
                {item.title}
              </Text>
              <Text className="text-sm font-bold text-[#FF6000] mt-1">
                {item.category} Specialty
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-2xl font-black text-[#FF6000]">
                GH₵ {item.price.toFixed(2)}
              </Text>
              <Text className="text-xs text-[#A8A29E] font-semibold">
                Base price
              </Text>
            </View>
          </View>

          {/* Key Specs: Prep Time & Calories */}
          <View className="flex-row items-center py-3 my-2 border-y border-[#EFE5D6] justify-between">
            <View className="flex-row items-center">
              <Feather name="clock" size={16} color="#78716C" />
              <Text className="text-sm font-semibold text-[#78716C] ml-2">
                {item.prepTime}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Feather name="zap" size={16} color="#78716C" />
              <Text className="text-sm font-semibold text-[#78716C] ml-2">
                {item.calories}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Feather name="check-circle" size={16} color="#16A34A" />
              <Text className="text-sm font-bold text-[#16A34A] ml-2">
                100% Halal Poultry
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2">
              Description
            </Text>
            <Text className="text-sm text-[#57534E] leading-6 font-medium">
              {item.description}
            </Text>
          </View>

          {/* 3. Portion / Size Selection */}
          {item.portionSizes && item.portionSizes.length > 0 && (
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917]">
                  Portion Size
                </Text>
                <Text className="text-xs font-semibold text-[#FF6000]">
                  Required
                </Text>
              </View>

              <View>
                {item.portionSizes.map((size, index) => {
                  const selected = selectedSize === index;
                  return (
                    <TouchableOpacity
                      key={size.name}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSize(index)}
                      className={`p-4 rounded-2xl border flex-row items-center justify-between mb-2.5 ${
                        selected
                          ? "bg-white border-[#FF6000] border-2"
                          : "bg-white border-[#EFE5D6]"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-5 h-5 rounded-full items-center justify-center mr-3 border ${
                            selected
                              ? "border-[#FF6000] bg-[#FF6000]"
                              : "border-[#D6D3D1] bg-white"
                          }`}
                        >
                          {selected && (
                            <View className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </View>
                        <Text
                          className={`text-sm font-bold ${
                            selected ? "text-[#1C1917]" : "text-[#57534E]"
                          }`}
                        >
                          {size.name}
                        </Text>
                      </View>

                      <Text
                        className={`text-sm font-black ${
                          selected ? "text-[#FF6000]" : "text-[#78716C]"
                        }`}
                      >
                        {size.extra === 0
                          ? "Included"
                          : `+ GH₵ ${size.extra.toFixed(2)}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 4. Spicy Level Selection */}
          {item.spicyLevels && item.spicyLevels.length > 0 && (
            <View className="mb-5">
              <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-2.5">
                Pepper &amp; Spice Level
              </Text>

              <View className="flex-row flex-wrap">
                {item.spicyLevels.map((spice, index) => {
                  const selected = selectedSpicy === index;
                  return (
                    <TouchableOpacity
                      key={spice}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSpicy(index)}
                      className={`px-4 py-2.5 rounded-full mr-2 mb-2 border ${
                        selected
                          ? "bg-[#FF6000] border-[#FF6000]"
                          : "bg-white border-[#EFE5D6]"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          selected ? "text-white" : "text-[#57534E]"
                        }`}
                      >
                        {spice}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 5. Add-ons & Extra Dips */}
          {item.availableAddons && item.availableAddons.length > 0 && (
            <View className="mb-5">
              <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-2.5">
                Optional Dips &amp; Extras
              </Text>

              <View>
                {item.availableAddons.map((addon) => {
                  const checked = !!selectedAddons[addon.id];
                  return (
                    <TouchableOpacity
                      key={addon.id}
                      activeOpacity={0.8}
                      onPress={() => toggleAddon(addon.id)}
                      className={`p-4 rounded-2xl border flex-row items-center justify-between mb-2.5 ${
                        checked
                          ? "bg-[#FFF3EB] border-[#FED7AA]"
                          : "bg-white border-[#EFE5D6]"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-5 h-5 rounded-md items-center justify-center mr-3 border ${
                            checked
                              ? "bg-[#FF6000] border-[#FF6000]"
                              : "bg-white border-[#D6D3D1]"
                          }`}
                        >
                          {checked && (
                            <Feather name="check" size={13} color="#ffffff" />
                          )}
                        </View>
                        <Text
                          className={`text-sm font-bold ${
                            checked ? "text-[#1C1917]" : "text-[#57534E]"
                          }`}
                        >
                          {addon.name}
                        </Text>
                      </View>

                      <Text className="text-sm font-black text-[#FF6000]">
                        + GH₵ {addon.price.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 6. Special Instructions */}
          <View className="mb-6">
            <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-2">
              Special Kitchen Instructions
            </Text>
            <View className="bg-white border border-[#EFE5D6] rounded-2xl p-4 min-h-[85px]">
              <TextInput
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="Add special instructions (e.g. extra crispy skin, sauce on the side)..."
                placeholderTextColor="#A8A29E"
                multiline
                numberOfLines={3}
                className="text-base text-[#1C1917] font-medium"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Cart Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EFE5D6] px-5 pt-3 pb-6 flex-row items-center justify-between">
        {/* Quantity Stepper */}
        <View className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-full px-3 py-2 mr-4">
          <TouchableOpacity
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-full items-center justify-center bg-white border border-[#EFE5D6]"
          >
            <Feather name="minus" size={15} color="#1C1917" />
          </TouchableOpacity>

          <Text className="mx-3.5 text-base font-black text-[#1C1917]">
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={() => setQuantity((q) => q + 1)}
            className="w-8 h-8 rounded-full items-center justify-center bg-[#FF6000]"
          >
            <Feather name="plus" size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Add to Cart CTA */}
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={!isAvailable}
          onPress={handleAddToCart}
          className={`flex-1 py-4 rounded-full flex-row items-center justify-between px-6 ${
            isAvailable ? "bg-[#FF6000]" : "bg-[#A8A29E]"
          }`}
        >
          <Text className="text-sm font-black text-white">
            {!isAvailable
              ? "Sold Out"
              : addedMessage
              ? "Added to Cart! ✓"
              : "Add to Cart"}
          </Text>

          <Text className="text-base font-black text-white">
            GH₵ {totalPrice.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
