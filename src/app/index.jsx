import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCart } from "../context/CartContext";
import { MENU_ITEMS, SORT_OPTIONS } from "../data/menuData";
import OnboardingScreen from "./onboarding";

// Local static assets
const LOGO_IMG = require("../../assets/images/logo.jpg");
const BANNER_IMG = require("../../assets/images/banner.jpg");
const BANNER_DEAL_IMG = require("../../assets/images/banner-deal.jpg");

// Curated high-res food images
const IMAGES = {
  bucket:
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80",
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
  wings:
    "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80",
  sides:
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80",
  drinks:
    "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80",
  dessert:
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80",
};

const CATEGORIES = [
  { id: "all", name: "All", image: IMAGES.bucket },
  { id: "rice", name: "Rice & Local", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&auto=format&fit=crop&q=80" },
  { id: "buckets", name: "Buckets", image: IMAGES.wings },
  { id: "fish", name: "Fish & Seafood", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80" },
  { id: "burgers", name: "Burgers", image: IMAGES.burger },
  { id: "pizza", name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80" },
  { id: "drinks", name: "Drinks", image: IMAGES.drinks },
  { id: "desserts", name: "Desserts", image: IMAGES.dessert },
];

const BANNERS = [
  {
    id: "banner-wings",
    tag: "SPECIAL OFFER",
    tagBg: "#FF6000",
    title: "Weekend Wings",
    subtitle: "Free Extra Shito with every 8-Pcs Bucket",
    code: "Code: SHITO8",
    image: BANNER_IMG,
    dealCategory: "Buckets",
  },
  {
    id: "banner-deal",
    tag: "HOT PROMO",
    tagBg: "#16A34A",
    title: "Family Feast Combo",
    subtitle: "Save GH₵ 25 with promo code CLIQS25",
    code: "Code: CLIQS25",
    image: BANNER_DEAL_IMG,
    dealCategory: "Buckets",
  },
  {
    id: "banner-delivery",
    tag: "FREE DELIVERY",
    tagBg: "#2563EB",
    title: "Express Delivery Drop",
    subtitle: "Free delivery on orders above GH₵ 100 in East Legon",
    code: "Auto Applied",
    image: IMAGES.wings,
    dealCategory: "Buckets",
  },
  {
    id: "banner-zinger",
    tag: "SUPER CRUNCH",
    tagBg: "#D97706",
    title: "Crispy Zinger Combos",
    subtitle: "Double spicy chicken fillet + large seasoned fries",
    code: "Popular Choice",
    image: IMAGES.burger,
    dealCategory: "Burgers",
  },
];

const HOME_SEARCH_CHIPS = [
  "Jollof Rice",
  "Waakye",
  "Banku & Tilapia",
  "Fufu",
  "Kenkey",
  "Chicken Wings",
  "Burgers",
  "Sobolo",
];

// Pure sorting helper outside component (React 19 hook purity)
function sortHomeMeals(items, sortKey) {
  const cloned = [...items];
  switch (sortKey) {
    case "price_asc":
      return cloned.sort((a, b) => a.price - b.price);
    case "price_desc":
      return cloned.sort((a, b) => b.price - a.price);
    case "rating":
      return cloned.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "fastest":
      return cloned.sort(
        (a, b) => (a.prepTimeMinutes || 30) - (b.prepTimeMinutes || 30)
      );
    case "discount":
      return cloned.sort(
        (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0)
      );
    case "newest":
      return cloned.reverse();
    case "popular":
    default:
      return cloned.sort(
        (a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0)
      );
  }
}

export default function HomeScreen() {
  const {
    cartCount,
    addToCart,
    notifications,
    orders,
    hasCompletedOnboarding,
    completeOnboarding,
  } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState({});
  const notificationCount = (notifications || []).filter((n) => !n.read).length;

  // Search & Sorting state on Home
  const [searchQuery, setSearchQuery] = useState("");
  const [homeSort, setHomeSort] = useState("popular");
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Sliding Banners State & Dimensions
  const bannerScrollRef = useRef(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const bannerCardWidth = screenWidth - 40;
  const bannerGap = 12;

  // Auto-sliding interval
  useEffect(() => {
    if (BANNERS.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNERS.length;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * (bannerCardWidth + bannerGap),
          animated: true,
        });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [bannerCardWidth]);

  const handleBannerScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (bannerCardWidth + bannerGap));
    if (index >= 0 && index < BANNERS.length && index !== activeBannerIndex) {
      setActiveBannerIndex(index);
    }
  };

  const activeOrder = orders?.find((o) => o.statusCode === "active");

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (item) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  // Filter & sort dishes for Home feed dynamically
  const filteredAndSortedMeals = useMemo(() => {
    let result = MENU_ITEMS;

    // Filter by category if selected
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter(
        (m) =>
          m.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(m.category.toLowerCase())
      );
    }

    // Filter by search query if user types on Home
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          (Array.isArray(m.ingredients) &&
            m.ingredients.some((ing) => ing.toLowerCase().includes(q)))
      );
    }

    return sortHomeMeals(result, homeSort);
  }, [selectedCategory, searchQuery, homeSort]);

  const currentSortObj =
    SORT_OPTIONS.find((s) => s.id === homeSort) || SORT_OPTIONS[0];

  // Initial launch gate: Onboarding displays before the app home opens
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAF4EB]"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* FIXED TOP HEADER */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-2.5 border-b border-[#EFE5D6]">
        <View className="flex-row items-center justify-between">
          {/* Menu Drawer Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/menu")}
            className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
          >
            <Feather name="menu" size={20} color="#1C1917" />
          </TouchableOpacity>

          {/* Center Brand Identity with Official CliqsBite Logo */}
          <View className="flex-row items-center">
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                overflow: "hidden",
                marginRight: 8,
                backgroundColor: "#EE5A05",
              }}
            >
              <Image
                source={LOGO_IMG}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <View>
              <Text className="text-xl font-black italic tracking-tight text-[#FF6000]">
                CliqsBite
              </Text>
              <Text className="text-[10px] font-semibold text-[#78716C] -mt-0.5">
                Freshly Homemade
              </Text>
            </View>
          </View>

          {/* Notification & Cart Buttons */}
          <View className="flex-row items-center">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/notifications")}
              className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center relative"
            >
              <Feather name="bell" size={19} color="#1C1917" />
              {notificationCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6000] items-center justify-center border-2 border-[#FAF4EB]">
                  <Text className="text-[10px] font-black text-white">
                    {notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/cart")}
              className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center relative ml-2"
            >
              <Feather name="shopping-bag" size={19} color="#1C1917" />
              {cartCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6000] items-center justify-center border-2 border-[#FAF4EB]">
                  <Text className="text-[10px] font-black text-white">
                    {cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* SCROLLABLE FEED */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ENHANCED LIVE SEARCH BAR */}
        <View className="px-5 pt-3 pb-1">
          <View className="flex-row items-center bg-white border border-[#EFE5D6] rounded-2xl px-4 py-3">
            <Feather name="search" size={19} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  router.push({
                    pathname: "/menu",
                    params: { q: searchQuery.trim() },
                  });
                }
              }}
              placeholder="Search jollof, waakye, banku, burgers..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-[#1C1917] font-semibold"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1 mr-1"
              >
                <Feather name="x" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setSortModalVisible(true)}
              className="bg-[#FFF3EB] p-1.5 rounded-xl border border-[#FED7AA]"
            >
              <Feather name="sliders" size={16} color="#FF6000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* QUICK SEARCH SUGGESTION CHIPS */}
        <View className="py-2 px-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {HOME_SEARCH_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip}
                onPress={() => {
                  setSearchQuery(chip);
                }}
                className={`px-3 py-1.5 rounded-full mr-2 border ${
                  searchQuery.toLowerCase() === chip.toLowerCase()
                    ? "bg-[#FF6000] border-[#FF6000]"
                    : "bg-white border-[#EFE5D6]"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    searchQuery.toLowerCase() === chip.toLowerCase()
                      ? "text-white"
                      : "text-[#78716C]"
                  }`}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Order Live Tracker */}
        {activeOrder && (
          <View className="px-5 pt-1 pb-2">
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/profile/orders")}
              className="bg-[#1C1917] rounded-[22px] p-4 flex-row items-center justify-between border border-[#FF6000]"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-10 h-10 rounded-xl bg-[#FF6000] items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="moped"
                    size={22}
                    color="#ffffff"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-0.5">
                    <Text className="text-xs font-black text-white mr-2">
                      Order #{activeOrder.id}
                    </Text>
                    <View className="bg-[#16A34A] px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-black text-white uppercase">
                        {activeOrder.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-[#A8A29E] font-medium leading-4">
                    ETA: {activeOrder.eta} • Tap to view live map, OTP &amp;
                    manage
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#FF6000" />
            </TouchableOpacity>
          </View>
        )}

        {/* PROMO SLIDING BANNERS (shown when not actively searching) */}
        {!searchQuery && (
          <View className="my-2">
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled={false}
              snapToInterval={bannerCardWidth + bannerGap}
              snapToAlignment="start"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScroll={handleBannerScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {BANNERS.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  activeOpacity={0.9}
                  onPress={() => router.push("/menu")}
                  style={{ width: bannerCardWidth, marginRight: bannerGap }}
                  className="h-44 rounded-[28px] overflow-hidden relative bg-[#1C1917] border border-[#EFE5D6]"
                >
                  <Image
                    source={banner.image}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View className="absolute inset-0 bg-black/40 p-5 justify-between">
                    <View className="flex-row items-center justify-between">
                      <View
                        style={{ backgroundColor: banner.tagBg }}
                        className="px-3 py-1 rounded-full self-start"
                      >
                        <Text className="text-[10px] font-black text-white tracking-wider">
                          {banner.tag}
                        </Text>
                      </View>
                      <View className="bg-black/60 px-2.5 py-1 rounded-full border border-white/20">
                        <Text className="text-[10px] font-bold text-white">
                          {banner.code}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text className="text-xl font-black text-white leading-6 mb-1">
                        {banner.title}
                      </Text>
                      <Text className="text-xs text-stone-200 font-medium">
                        {banner.subtitle}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Slider Dots Indicator */}
            <View className="flex-row justify-center items-center mt-3">
              {BANNERS.map((banner, index) => {
                const isActive = activeBannerIndex === index;
                return (
                  <TouchableOpacity
                    key={`dot-${banner.id}`}
                    onPress={() => {
                      setActiveBannerIndex(index);
                      bannerScrollRef.current?.scrollTo({
                        x: index * (bannerCardWidth + bannerGap),
                        animated: true,
                      });
                    }}
                    className={`mx-1 rounded-full ${
                      isActive ? "w-6 h-2 bg-[#FF6000]" : "w-2 h-2 bg-[#D6CEBF]"
                    }`}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Categories Section */}
        {!searchQuery && (
          <>
            <View className="px-5 mb-3 mt-3 flex-row items-center justify-between">
              <Text className="text-lg font-black text-[#1C1917] tracking-tight">
                Categories
              </Text>
              <TouchableOpacity onPress={() => router.push("/menu")}>
                <Text className="text-xs font-bold text-[#FF6000]">
                  Explore All &rarr;
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedCategory(
                          isSelected && cat.name !== "All" ? "All" : cat.name
                        );
                      }}
                      className="items-center mr-4"
                    >
                      <View
                        className={`w-16 h-16 rounded-2xl items-center justify-center p-1 border mb-1.5 ${
                          isSelected
                            ? "bg-[#FFF3EB] border-[#FF6000] border-2"
                            : "bg-white border-[#EFE5D6]"
                        }`}
                      >
                        <Image
                          source={{ uri: cat.image }}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 12,
                          }}
                          contentFit="cover"
                        />
                      </View>
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? "text-[#FF6000]" : "text-[#78716C]"
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        )}

        {/* SECTION HEADER: DYNAMIC DISHES & SORTING SELECTOR */}
        <View className="px-5 mb-3 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-black text-[#1C1917] tracking-tight">
              {searchQuery ? "Search Results" : "Featured Dishes"}
            </Text>
            <Text className="text-xs text-[#78716C] font-semibold -mt-0.5">
              {filteredAndSortedMeals.length} Ghanaian &amp; Fast Food Dishes
            </Text>
          </View>

          {/* Quick Sort Trigger Pill */}
          <TouchableOpacity
            onPress={() => setSortModalVisible(true)}
            className="flex-row items-center bg-white border border-[#EFE5D6] px-3 py-1.5 rounded-full"
          >
            <Feather name="bar-chart-2" size={13} color="#FF6000" />
            <Text className="text-xs font-bold text-[#1C1917] ml-1.5 mr-1">
              {currentSortObj.label}
            </Text>
            <Feather name="chevron-down" size={13} color="#78716C" />
          </TouchableOpacity>
        </View>

        {/* FOOD CARDS HORIZONTAL SCROLL OR EMPTY STATE */}
        {filteredAndSortedMeals.length === 0 ? (
          <View className="items-center justify-center py-12 px-6">
            <View className="w-16 h-16 rounded-full bg-white border border-[#EFE5D6] items-center justify-center mb-3">
              <Feather name="search" size={24} color="#A8A29E" />
            </View>
            <Text className="text-base font-black text-[#1C1917] mb-1">
              No dishes found
            </Text>
            <Text className="text-xs text-[#78716C] text-center mb-4">
              Try searching for jollof, waakye, banku, or reset filters.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="bg-[#FF6000] px-5 py-2 rounded-full"
            >
              <Text className="text-xs font-black text-white">
                Reset Search
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {filteredAndSortedMeals.map((item) => {
                const isFav = !!favorites[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.92}
                    onPress={() => router.push(`/food/${item.id}`)}
                    className="w-64 bg-white border border-[#EFE5D6] rounded-[26px] p-4 mr-4"
                  >
                    {/* Header: Tag & Favorite */}
                    <View className="flex-row items-center justify-between mb-2">
                      <View
                        style={{
                          backgroundColor: item.tagColor || "#FF6000",
                        }}
                        className="px-2.5 py-0.5 rounded-full"
                      >
                        <Text className="text-[9px] font-black tracking-wider text-white uppercase">
                          {item.tag || "BESTSELLER"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleFavorite(item.id)}
                        className="w-8 h-8 rounded-full bg-[#FAF4EB] items-center justify-center border border-[#EFE5D6]"
                      >
                        <Ionicons
                          name={isFav ? "heart" : "heart-outline"}
                          size={16}
                          color={isFav ? "#FF6000" : "#78716C"}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Image */}
                    <View
                      style={{
                        width: "100%",
                        height: 135,
                        borderRadius: 18,
                        overflow: "hidden",
                      }}
                      className="mb-2.5"
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 18,
                        }}
                        contentFit="cover"
                        transition={200}
                      />
                    </View>

                    {/* Title & Description */}
                    <Text
                      className="text-base font-black text-[#1C1917] mb-0.5"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-xs font-medium text-[#78716C] mb-2 leading-4"
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>

                    {/* Rating & Prep Time */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text className="text-xs font-bold text-[#1C1917] ml-1">
                          {item.rating}{" "}
                          <Text className="font-normal text-[#A8A29E]">
                            ({item.reviews})
                          </Text>
                        </Text>
                      </View>
                      <Text className="text-[11px] font-semibold text-[#A8A29E]">
                        {item.prepTime}
                      </Text>
                    </View>

                    {/* Price & Quick Add Button */}
                    <View className="flex-row items-center justify-between pt-2 border-t border-[#F5EDE1]">
                      <Text className="text-base font-black text-[#FF6000]">
                        GH₵ {item.price.toFixed(2)}
                      </Text>

                      {item.isAvailable ? (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(item);
                          }}
                          className="w-9 h-9 rounded-full bg-[#FF6000] items-center justify-center"
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Feather name="plus" size={18} color="#ffffff" />
                        </TouchableOpacity>
                      ) : (
                        <View className="bg-[#FEE2E2] px-2 py-1 rounded-lg">
                          <Text className="text-[9px] font-black text-[#DC2626]">
                            SOLD OUT
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* SORTING MODAL */}
      <Modal
        visible={sortModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
          className="flex-1 justify-end bg-black/50"
        >
          <View
            onStartShouldSetResponder={() => true}
            className="bg-[#FAF4EB] rounded-t-[32px] p-5 border-t border-[#EFE5D6]"
          >
            <View className="flex-row items-center justify-between pb-3 mb-2 border-b border-[#EFE5D6]">
              <Text className="text-base font-black text-[#1C1917]">
                Sort Home Dishes By
              </Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Feather name="x" size={20} color="#1C1917" />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((opt) => {
              const isSelected = homeSort === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setHomeSort(opt.id);
                    setSortModalVisible(false);
                  }}
                  className={`py-3.5 px-4 rounded-2xl mb-2 flex-row items-center justify-between border ${
                    isSelected
                      ? "bg-white border-[#FF6000]"
                      : "bg-[#FAF4EB] border-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-black ${
                      isSelected ? "text-[#FF6000]" : "text-[#1C1917]"
                    }`}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={18} color="#FF6000" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* BOTTOM FLOATING NAVIGATION (with AI Bot Tab) */}
      <View className="absolute bottom-4 left-5 right-5">
        <View className="bg-white border border-[#EFE5D6] rounded-full py-2.5 px-6 flex-row items-center justify-between">
          {/* Home (Active) */}
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1"
          >
            <Feather name="home" size={20} color="#FF6000" />
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
              Home
            </Text>
          </TouchableOpacity>

          {/* Menu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/menu")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1"
          >
            <Feather name="grid" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Menu
            </Text>
          </TouchableOpacity>

          {/* Elevated Orders Center Action */}
          <View className="items-center -mt-6">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/cart")}
              className="w-14 h-14 rounded-full bg-[#FF6000] items-center justify-center border-4 border-[#FAF4EB]"
            >
              <Feather name="shopping-bag" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Cart
            </Text>
          </View>

          {/* AI Bot Tab (Chatbot & Voice Agent for Orders) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/ai-bot")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1 relative"
          >
            <View className="relative">
              <MaterialCommunityIcons
                name="robot-excited-outline"
                size={22}
                color="#A8A29E"
              />
              <View className="absolute -top-1 -right-2 bg-[#FF6000] px-1 rounded-full">
                <Text className="text-[7px] font-black text-white">AI</Text>
              </View>
            </View>
            <Text className="text-xs mt-0.5 font-semibold text-[#A8A29E]">
              AI Bot
            </Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/profile")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1"
          >
            <Feather name="user" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-semibold text-[#A8A29E]">
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
