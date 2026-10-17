import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  MENU_ITEMS,
  CATEGORIES_LIST,
  RESTAURANT_LOCATIONS,
  FOOD_TYPES_LIST,
  SORT_OPTIONS,
} from "../data/menuData";
import { useCart } from "../context/CartContext";

// Ghanaian Dish Common Query Suggestions
const GHANAIAN_SEARCH_TERMS = [
  "Jollof Rice",
  "Waakye",
  "Banku",
  "Fufu",
  "Kenkey",
  "Red Red",
  "Chicken Wings",
  "Chicken Bucket",
  "Zinger Burger",
  "Suya Pizza",
  "Sobolo",
  "French Fries",
  "Avocado Salad",
];

// Levenshtein distance for spelling correction suggestions
function levenshteinDistance(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => []);
  for (let i = 0; i <= bn; ++i) matrix[i][0] = i;
  for (let j = 0; j <= an; ++j) matrix[0][j] = j;
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bn][an];
}

// Check spelling suggestions against known dishes and ingredients
function findSpellingSuggestion(query, items) {
  if (!query || query.trim().length < 3) return null;
  const cleanQ = query.trim().toLowerCase();

  const candidateSet = new Set(GHANAIAN_SEARCH_TERMS);
  items.forEach((item) => {
    candidateSet.add(item.title);
    if (Array.isArray(item.ingredients)) {
      item.ingredients.forEach((ing) => candidateSet.add(ing));
    }
  });

  let bestMatch = null;
  let minDistance = Infinity;

  candidateSet.forEach((candidate) => {
    const candLower = candidate.toLowerCase();
    if (candLower === cleanQ) return;

    // Check individual words
    const words = candLower.split(/\s+/);
    for (const w of words) {
      if (Math.abs(w.length - cleanQ.length) <= 2 && w.length >= 3) {
        const dist = levenshteinDistance(cleanQ, w);
        if (dist > 0 && dist <= 2 && dist < minDistance) {
          minDistance = dist;
          bestMatch = candidate;
        }
      }
    }

    // Check full string
    if (Math.abs(candLower.length - cleanQ.length) <= 2) {
      const dist = levenshteinDistance(cleanQ, candLower);
      if (dist > 0 && dist <= 2 && dist < minDistance) {
        minDistance = dist;
        bestMatch = candidate;
      }
    }
  });

  return bestMatch;
}

// Multi-facet matching engine
function matchMenuItem(item, query, filters) {
  // 1. Text Search matching across Title, Description, Category, Ingredients, Tags
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(q);
    const descMatch = item.description?.toLowerCase().includes(q);
    const catMatch = item.category?.toLowerCase().includes(q);
    const tagMatch = item.tag?.toLowerCase().includes(q);
    const ingredientMatch = Array.isArray(item.ingredients)
      ? item.ingredients.some((ing) => ing.toLowerCase().includes(q))
      : false;

    if (!titleMatch && !descMatch && !catMatch && !tagMatch && !ingredientMatch) {
      return false;
    }
  }

  // 2. Category Filter
  if (filters.category && filters.category !== "All") {
    if (item.category?.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
  }

  // 3. Price Range (in GH₵)
  if (filters.minPrice !== null && filters.minPrice !== "" && !isNaN(Number(filters.minPrice))) {
    if (item.price < Number(filters.minPrice)) return false;
  }
  if (filters.maxPrice !== null && filters.maxPrice !== "" && !isNaN(Number(filters.maxPrice))) {
    if (item.price > Number(filters.maxPrice)) return false;
  }

  // 4. Food Types (Spicy, Halal, Vegetarian, Vegan)
  if (filters.foodTypes && filters.foodTypes.length > 0) {
    const itemTypes = Array.isArray(item.foodType)
      ? item.foodType.map((t) => t.toLowerCase())
      : [];
    const hasAllSelected = filters.foodTypes.every((ft) =>
      itemTypes.includes(ft.toLowerCase())
    );
    if (!hasAllSelected) return false;
  }

  // 5. Minimum Rating
  if (filters.minRating !== null && filters.minRating > 0) {
    if ((item.rating || 0) < filters.minRating) return false;
  }

  // 6. Availability Filter (Order Now)
  if (filters.availableOnly) {
    if (item.isAvailable === false || item.inStock === false) return false;
  }

  // 7. Preparation Time Max
  if (filters.prepTimeMax !== null && filters.prepTimeMax > 0) {
    if ((item.prepTimeMinutes || 25) > filters.prepTimeMax) return false;
  }

  // 8. Restaurant Branch
  if (filters.restaurant && filters.restaurant !== "All Locations") {
    if (item.restaurant !== filters.restaurant) return false;
  }

  // 9. Special Offers / Discounts
  if (filters.discountOnly) {
    if (!item.discountPercent || item.discountPercent <= 0) return false;
  }

  return true;
}

// Sorting comparator
function sortMenuItems(items, sortKey) {
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

// Initial filter state constant
const DEFAULT_FILTERS = {
  category: "All",
  minPrice: null,
  maxPrice: null,
  foodTypes: [],
  minRating: null,
  availableOnly: false,
  prepTimeMax: null,
  restaurant: "All Locations",
  discountOnly: false,
};

const PRICE_TIERS = [
  { label: "All Prices", min: null, max: null },
  { label: "Under GH₵ 50", min: null, max: 50 },
  { label: "GH₵ 50 - 90", min: 50, max: 90 },
  { label: "GH₵ 90 - 130", min: 90, max: 130 },
  { label: "Above GH₵ 130", min: 130, max: null },
];

const PREP_TIME_OPTIONS = [
  { label: "Any Time", max: null },
  { label: "< 15 Mins ⚡", max: 15 },
  { label: "15 - 25 Mins ⏱️", max: 25 },
  { label: "Under 35 Mins", max: 35 },
];

const RATING_OPTIONS = [
  { label: "Any Rating", value: null },
  { label: "4.5+ ★", value: 4.5 },
  { label: "4.7+ ★", value: 4.7 },
  { label: "4.8+ ★", value: 4.8 },
];

export default function MenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    addToCart,
    cartCount,
    recentSearches = [],
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    liveMenu,
    liveCategories,
  } = useCart();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(params.q || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(
    params.filter === "1"
  );
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [currentSort, setCurrentSort] = useState("popular");
  const [addedToast, setAddedToast] = useState(null);

  // Pagination / Load more state
  const [visibleCount, setVisibleCount] = useState(8);

  // Record initial query parameter if passed from Home
  useEffect(() => {
    if (params.q && addRecentSearch) {
      addRecentSearch(params.q);
    }
  }, [params.q, addRecentSearch]);

  // Source menu from Admin Dashboard liveMenu or fallback
  const catalogSource = useMemo(() => {
    return liveMenu && Array.isArray(liveMenu) && liveMenu.length > 0
      ? liveMenu
      : MENU_ITEMS;
  }, [liveMenu]);

  // Categories list driven by Admin Dashboard
  const activeCategoriesList = useMemo(() => {
    if (
      liveCategories &&
      Array.isArray(liveCategories) &&
      liveCategories.length > 0
    ) {
      const enabled = liveCategories.filter((c) => c.isEnabled !== false);
      return ["All", ...enabled.map((c) => c.name)];
    }
    return CATEGORIES_LIST;
  }, [liveCategories]);

  // Compute matching items
  const filteredAndSortedItems = useMemo(() => {
    const matched = catalogSource.filter((item) =>
      matchMenuItem(item, searchQuery, filters)
    );
    return sortMenuItems(matched, currentSort);
  }, [catalogSource, searchQuery, filters, currentSort]);

  // Draft match count for the Filter Modal button
  const draftMatchCount = useMemo(() => {
    return catalogSource.filter((item) =>
      matchMenuItem(item, searchQuery, draftFilters)
    ).length;
  }, [catalogSource, searchQuery, draftFilters]);

  // Spelling suggestions when 0 or few items match
  const spellingSuggestion = useMemo(() => {
    if (filteredAndSortedItems.length === 0 && searchQuery.trim().length >= 3) {
      return findSpellingSuggestion(searchQuery, catalogSource);
    }
    return null;
  }, [filteredAndSortedItems.length, searchQuery, catalogSource]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== "All") count++;
    if (filters.minPrice !== null || filters.maxPrice !== null) count++;
    if (filters.foodTypes && filters.foodTypes.length > 0)
      count += filters.foodTypes.length;
    if (filters.minRating !== null) count++;
    if (filters.availableOnly) count++;
    if (filters.prepTimeMax !== null) count++;
    if (filters.restaurant && filters.restaurant !== "All Locations") count++;
    if (filters.discountOnly) count++;
    return count;
  }, [filters]);

  // Execute a search query and record to history
  const handlePerformSearch = useCallback(
    (term) => {
      setSearchQuery(term);
      setIsSearchFocused(false);
      if (term.trim() && addRecentSearch) {
        addRecentSearch(term.trim());
      }
    },
    [addRecentSearch]
  );

  // Quick Add with real-time price & availability verification
  const handleQuickAdd = useCallback(
    (foodItem) => {
      // Recheck availability before adding to cart
      if (!foodItem.isAvailable) {
        Alert.alert(
          "Item Unavailable",
          `We're sorry, ${foodItem.title} is currently sold out for today. Please select another meal.`,
          [{ text: "OK" }]
        );
        return;
      }

      addToCart({
        id: foodItem.id,
        title: foodItem.title,
        price: foodItem.price,
        quantity: 1,
        image: foodItem.image,
      });

      // Show temporary confirmation toast
      setAddedToast(`Added ${foodItem.title} to cart`);
      setTimeout(() => {
        setAddedToast(null);
      }, 2400);
    },
    [addToCart]
  );

  // Open Filter Modal and copy current filters to draft
  const handleOpenFilterModal = useCallback(() => {
    setDraftFilters({ ...filters });
    setFilterModalVisible(true);
  }, [filters]);

  // Apply draft filters
  const handleApplyFilters = useCallback(() => {
    setFilters({ ...draftFilters });
    setFilterModalVisible(false);
  }, [draftFilters]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDraftFilters(DEFAULT_FILTERS);
  }, []);

  // Individual filter dismiss handlers for chips
  const removeCategoryFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, category: "All" }));
  }, []);

  const removePriceFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, minPrice: null, maxPrice: null }));
  }, []);

  const removeFoodTypeFilter = useCallback((typeToRemove) => {
    setFilters((prev) => ({
      ...prev,
      foodTypes: prev.foodTypes.filter((t) => t !== typeToRemove),
    }));
  }, []);

  const removeRatingFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, minRating: null }));
  }, []);

  const removeAvailabilityFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, availableOnly: false }));
  }, []);

  const removePrepTimeFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, prepTimeMax: null }));
  }, []);

  const removeRestaurantFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, restaurant: "All Locations" }));
  }, []);

  const removeDiscountFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, discountOnly: false }));
  }, []);

  // Get current sort label
  const currentSortObj =
    SORT_OPTIONS.find((s) => s.id === currentSort) || SORT_OPTIONS[0];

  // Paginated slice
  const displayedItems = filteredAndSortedItems.slice(0, visibleCount);
  const hasMoreItems = visibleCount < filteredAndSortedItems.length;

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAF4EB]"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* FIXED TOP HEADER */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-2.5 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-xl font-black text-[#1C1917] tracking-tight">
            Food Search & Menu
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] -mt-0.5">
            {filteredAndSortedItems.length} Dishes Found
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/cart")}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center relative"
        >
          <Feather name="shopping-bag" size={20} color="#1C1917" />
          {cartCount > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6000] items-center justify-center border-2 border-[#FAF4EB]">
              <Text className="text-[10px] font-black text-white">
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* FLOATING SUCCESS TOAST */}
      {addedToast && (
        <View className="absolute top-20 left-6 right-6 z-50 bg-[#1C1917] px-4 py-3 rounded-2xl flex-row items-center justify-between border border-[#FF6000]/60">
          <View className="flex-row items-center flex-1 mr-2">
            <Feather name="check-circle" size={18} color="#22C55E" />
            <Text
              className="text-white text-xs font-bold ml-2.5 flex-1"
              numberOfLines={1}
            >
              {addedToast}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/cart")}>
            <Text className="text-xs font-black text-[#FF6000]">VIEW CART</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DYNAMIC SEARCH & FILTER CONTROL BAR */}
      <View className="px-5 pt-3 pb-2 bg-[#FAF4EB] z-10">
        <View style={{ gap: 8 }} className="flex-row items-center">
          {/* Real-Time Search Input */}
          <View className="flex-1 flex-row items-center bg-white border border-[#EFE5D6] rounded-2xl px-3.5 py-2.5">
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onSubmitEditing={() => handlePerformSearch(searchQuery)}
              placeholder="Search jollof, waakye, banku, burger..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2.5 text-base text-[#1C1917] font-semibold"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                }}
                className="p-1"
              >
                <Feather name="x" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Trigger Button with Active Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenFilterModal}
            className={`w-12 h-12 rounded-2xl items-center justify-center ml-2 border ${
              activeFilterCount > 0
                ? "bg-[#FF6000] border-[#FF6000]"
                : "bg-white border-[#EFE5D6]"
            } relative`}
          >
            <Feather
              name="sliders"
              size={19}
              color={activeFilterCount > 0 ? "#ffffff" : "#1C1917"}
            />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1.5 -right-1.5 bg-[#1C1917] w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-[10px] font-black text-white">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Sort Trigger Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSortModalVisible(true)}
            className="w-12 h-12 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center ml-2"
          >
            <MaterialIcons name="sort" size={22} color="#1C1917" />
          </TouchableOpacity>
        </View>

        {/* SPELLING SUGGESTION / "DID YOU MEAN?" */}
        {spellingSuggestion && (
          <View className="mt-2.5 bg-[#FFF7ED] border border-[#FED7AA] p-3 rounded-2xl flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={18}
                color="#EA580C"
              />
              <Text className="text-xs text-[#78716C] ml-2 font-medium">
                Did you mean:{" "}
                <Text className="font-black text-[#EA580C]">
                  {spellingSuggestion}
                </Text>
                ?
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handlePerformSearch(spellingSuggestion)}
              className="bg-[#EA580C] px-3 py-1 rounded-xl"
            >
              <Text className="text-[11px] font-black text-white">Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* RECENT SEARCHES PANEL (shown when focused or searches exist) */}
      {isSearchFocused && recentSearches.length > 0 && (
        <View className="bg-white mx-5 mt-1 p-3.5 rounded-2xl border border-[#EFE5D6] z-30">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Feather name="clock" size={13} color="#78716C" />
              <Text className="text-xs font-black text-[#1C1917] ml-1.5 uppercase tracking-wider">
                Recent Searches
              </Text>
            </View>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text className="text-xs font-bold text-[#FF6000]">
                Clear History
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {recentSearches.map((term, index) => (
              <View
                key={`${term}-${index}`}
                className="flex-row items-center bg-[#FAF4EB] border border-[#EFE5D6] rounded-full px-3 py-1.5 mr-2 mb-2"
              >
                <TouchableOpacity
                  onPress={() => handlePerformSearch(term)}
                  className="flex-row items-center mr-1.5"
                >
                  <Text className="text-xs font-semibold text-[#1C1917]">
                    {term}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeRecentSearch(term)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={12} color="#78716C" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* HORIZONTAL CATEGORY CHIPS */}
      <View className="py-2 bg-[#FAF4EB] z-10 border-b border-[#EFE5D6]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {activeCategoriesList.map((cat) => {
            const active = filters.category === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    category: active && cat !== "All" ? "All" : cat,
                  }));
                }}
                className={`px-4 py-2 rounded-full mr-2.5 border ${
                  active
                    ? "bg-[#FF6000] border-[#FF6000]"
                    : "bg-white border-[#EFE5D6]"
                }`}
              >
                <Text
                  className={`text-xs font-black tracking-wide ${
                    active ? "text-white" : "text-[#78716C]"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ACTIVE FILTER CHIPS ROW (One-Tap Removal & Clear All) */}
      {activeFilterCount > 0 && (
        <View className="py-2 px-5 bg-[#FFFDF9] border-b border-[#EFE5D6] flex-row items-center">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Category Chip */}
            {filters.category !== "All" && (
              <View className="flex-row items-center bg-[#FFF3EB] border border-[#FF6000] rounded-full px-3 py-1 mr-2">
                <Text className="text-xs font-bold text-[#FF6000] mr-1">
                  {filters.category}
                </Text>
                <TouchableOpacity onPress={removeCategoryFilter}>
                  <Feather name="x" size={12} color="#FF6000" />
                </TouchableOpacity>
              </View>
            )}

            {/* Price Chip */}
            {(filters.minPrice !== null || filters.maxPrice !== null) && (
              <View className="flex-row items-center bg-[#FFF3EB] border border-[#FF6000] rounded-full px-3 py-1 mr-2">
                <Text className="text-xs font-bold text-[#FF6000] mr-1">
                  GH₵ {filters.minPrice || 0} -{" "}
                  {filters.maxPrice ? `GH₵ ${filters.maxPrice}` : "Max"}
                </Text>
                <TouchableOpacity onPress={removePriceFilter}>
                  <Feather name="x" size={12} color="#FF6000" />
                </TouchableOpacity>
              </View>
            )}

            {/* Food Types Chips */}
            {filters.foodTypes.map((ft) => (
              <View
                key={ft}
                className="flex-row items-center bg-[#FFF3EB] border border-[#FF6000] rounded-full px-3 py-1 mr-2"
              >
                <Text className="text-xs font-bold text-[#FF6000] mr-1">
                  {ft}
                </Text>
                <TouchableOpacity onPress={() => removeFoodTypeFilter(ft)}>
                  <Feather name="x" size={12} color="#FF6000" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Rating Chip */}
            {filters.minRating !== null && (
              <View className="flex-row items-center bg-[#FFF3EB] border border-[#FF6000] rounded-full px-3 py-1 mr-2">
                <Text className="text-xs font-bold text-[#FF6000] mr-1">
                  {filters.minRating}+ ★
                </Text>
                <TouchableOpacity onPress={removeRatingFilter}>
                  <Feather name="x" size={12} color="#FF6000" />
                </TouchableOpacity>
              </View>
            )}

            {/* Availability Chip */}
            {filters.availableOnly && (
              <View className="flex-row items-center bg-[#DCFCE7] border border-[#16A34A] rounded-full px-3 py-1 mr-2">
                <Text className="text-xs font-bold text-[#16A34A] mr-1">
                  Available Now
                </Text>
                <TouchableOpacity onPress={removeAvailabilityFilter}>
                  <Feather name="x" size={12} color="#16A34A" />
                </TouchableOpacity>
              </View>
            )}

            {/* Prep Time Chip */}
            {filters.prepTimeMax !== null && (
              <View className="flex-row items-center bg-[#FFF3EB] border border-[#FF6000] rounded-full px-3 py-1 mr-2">
                <Text className="text-xs font-bold text-[#FF6000] mr-1">
                  &lt; {filters.prepTimeMax} mins
                </Text>
                <TouchableOpacity onPress={removePrepTimeFilter}>
                  <Feather name="x" size={12} color="#FF6000" />
                </TouchableOpacity>
              </View>
            )}

            {/* Restaurant Branch Chip */}
            {filters.restaurant !== "All Locations" && (
              <View className="flex-row items-center bg-[#FFF3EB] border border-[#FF6000] rounded-full px-3 py-1 mr-2">
                <Text className="text-xs font-bold text-[#FF6000] mr-1">
                  {filters.restaurant.replace("CliqsBite", "").trim()}
                </Text>
                <TouchableOpacity onPress={removeRestaurantFilter}>
                  <Feather name="x" size={12} color="#FF6000" />
                </TouchableOpacity>
              </View>
            )}

            {/* Discount Chip */}
            {filters.discountOnly && (
              <View className="flex-row items-center bg-[#FEF3C7] border border-[#D97706] rounded-full px-3 py-1 mr-2">
                <Text className="text-xs font-bold text-[#D97706] mr-1">
                  Deals Only 🏷️
                </Text>
                <TouchableOpacity onPress={removeDiscountFilter}>
                  <Feather name="x" size={12} color="#D97706" />
                </TouchableOpacity>
              </View>
            )}

            {/* Clear All Trigger */}
            <TouchableOpacity
              onPress={handleResetFilters}
              className="bg-[#1C1917] px-3 py-1 rounded-full flex-row items-center"
            >
              <Text className="text-xs font-black text-white mr-1">
                Clear All
              </Text>
              <Feather name="refresh-cw" size={10} color="#ffffff" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* SORTING SUMMARY & MEALS COUNTER BAR */}
      <View className="px-5 pt-3 pb-1.5 flex-row items-center justify-between">
        <Text className="text-xs font-black text-[#78716C] uppercase tracking-wider">
          {filteredAndSortedItems.length} Dishes Found
        </Text>
        <TouchableOpacity
          onPress={() => setSortModalVisible(true)}
          className="flex-row items-center bg-white border border-[#EFE5D6] px-2.5 py-1 rounded-xl"
        >
          <Text className="text-xs font-bold text-[#1C1917] mr-1">
            Sort: {currentSortObj.label}
          </Text>
          <Feather name="chevron-down" size={14} color="#78716C" />
        </TouchableOpacity>
      </View>

      {/* FOOD ITEMS LIST */}
      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 110,
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-4">
            <View className="w-20 h-20 rounded-full bg-white border border-[#EFE5D6] items-center justify-center mb-4">
              <Feather name="search" size={32} color="#A8A29E" />
            </View>
            <Text className="text-lg font-black text-[#1C1917] mb-1.5 text-center">
              No matching meals found
            </Text>
            <Text className="text-xs text-[#78716C] text-center max-w-[280px] leading-5 mb-5">
              {searchQuery
                ? `No meals matched "${searchQuery}". Check your spelling or try clearing active filters.`
                : "No dishes fit the current filter combination. Try adjusting price or dietary options."}
            </Text>

            {/* Quick reset actions */}
            <TouchableOpacity
              onPress={handleResetFilters}
              className="bg-[#FF6000] px-5 py-2.5 rounded-full flex-row items-center mb-6"
            >
              <Feather name="refresh-ccw" size={14} color="#ffffff" />
              <Text className="text-xs font-black text-white ml-2 uppercase tracking-wider">
                Reset All Filters
              </Text>
            </TouchableOpacity>

            {/* Suggested Dishes */}
            <View className="w-full">
              <Text className="text-xs font-black text-[#78716C] uppercase tracking-wider mb-2.5 text-center">
                Popular Ghanaian Searches
              </Text>
              <View className="flex-row flex-wrap justify-center">
                {GHANAIAN_SEARCH_TERMS.slice(0, 6).map((dish) => (
                  <TouchableOpacity
                    key={dish}
                    onPress={() => handlePerformSearch(dish)}
                    className="bg-white border border-[#EFE5D6] rounded-full px-3 py-1.5 m-1"
                  >
                    <Text className="text-xs font-bold text-[#1C1917]">
                      {dish}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/food/${item.id}`)}
            className="bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-3.5 flex-row items-center relative overflow-hidden"
          >
            {/* Food Image with Tag */}
            <View
              style={{
                width: 105,
                height: 105,
                borderRadius: 20,
                overflow: "hidden",
              }}
              className="mr-3.5 relative"
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={150}
              />
              {/* Discount / Tag Ribbon */}
              {item.discountPercent > 0 && (
                <View className="absolute top-1.5 left-1.5 bg-[#EA580C] px-2 py-0.5 rounded-md">
                  <Text className="text-[9px] font-black text-white">
                    -{item.discountPercent}%
                  </Text>
                </View>
              )}
            </View>

            {/* Item Details */}
            <View className="flex-1 pr-1">
              {/* Tag & Restaurant */}
              <View className="flex-row items-center mb-1 flex-wrap">
                <View
                  style={{ backgroundColor: item.tagColor || "#FF6000" }}
                  className="px-2 py-0.5 rounded-full mr-2"
                >
                  <Text className="text-[9px] font-black tracking-wider text-white uppercase">
                    {item.tag}
                  </Text>
                </View>
                <Text
                  className="text-[11px] font-semibold text-[#A8A29E]"
                  numberOfLines={1}
                >
                  {item.prepTime}
                </Text>
              </View>

              {/* Title */}
              <Text
                className="text-base font-black text-[#1C1917] mb-1"
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {/* Description */}
              <Text
                className="text-xs font-medium text-[#78716C] mb-2 leading-4"
                numberOfLines={2}
              >
                {item.description}
              </Text>

              {/* Dietary Type Badges (Spicy, Halal, Veg) */}
              {item.foodType && item.foodType.length > 0 && (
                <View className="flex-row items-center flex-wrap mb-2">
                  {item.foodType.map((ft) => (
                    <View
                      key={ft}
                      className="bg-[#FAF4EB] border border-[#EFE5D6] px-1.5 py-0.5 rounded mr-1.5"
                    >
                      <Text className="text-[9px] font-bold text-[#78716C]">
                        {ft === "Spicy" ? "🌶️ Spicy" : ft}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Price & Rating + Add Button */}
              <View className="flex-row items-center justify-between">
                <View>
                  <View className="flex-row items-baseline">
                    <Text className="text-base font-black text-[#FF6000] mr-1.5">
                      GH₵ {item.price.toFixed(2)}
                    </Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <Text className="text-xs font-bold text-[#A8A29E] line-through">
                        GH₵ {item.originalPrice.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row items-center mt-0.5">
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text className="text-xs font-bold text-[#1C1917] ml-0.5 mr-1">
                      {item.rating}
                    </Text>
                    <Text className="text-[10px] text-[#A8A29E]">
                      ({item.reviews})
                    </Text>
                  </View>
                </View>

                {/* Add to Cart Button (respects availability) */}
                {item.isAvailable !== false && item.inStock !== false ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(item);
                    }}
                    className="w-9 h-9 rounded-full bg-[#FF6000] items-center justify-center border border-[#EA580C]"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="plus" size={18} color="#ffffff" />
                  </TouchableOpacity>
                ) : (
                  <View className="bg-[#FEE2E2] px-2.5 py-1.5 rounded-xl border border-[#FCA5A5]">
                    <Text className="text-[10px] font-black text-[#DC2626]">
                      SOLD OUT
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          hasMoreItems ? (
            <TouchableOpacity
              onPress={() => setVisibleCount((prev) => prev + 8)}
              className="bg-white border border-[#EFE5D6] rounded-2xl py-3 items-center justify-center my-3"
            >
              <Text className="text-xs font-black text-[#FF6000] uppercase tracking-wider">
                Load More Meals ({filteredAndSortedItems.length - visibleCount}{" "}
                Remaining)
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* MULTI-FACET FILTER MODAL */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-[#FAF4EB] rounded-t-[32px] max-h-[85%] border-t border-[#EFE5D6] overflow-hidden">
            {/* Modal Header */}
            <View className="p-5 border-b border-[#EFE5D6] flex-row items-center justify-between bg-white">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-[#FFF3EB] items-center justify-center mr-3 border border-[#FED7AA]">
                  <Feather name="sliders" size={18} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-lg font-black text-[#1C1917]">
                    Filter Dishes
                  </Text>
                  <Text className="text-xs text-[#78716C] font-semibold">
                    Customize price, dietary type, and timing
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                className="w-9 h-9 rounded-full bg-[#FAF4EB] items-center justify-center border border-[#EFE5D6]"
              >
                <Feather name="x" size={18} color="#1C1917" />
              </TouchableOpacity>
            </View>

            {/* Filter Content ScrollView */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20 }}
            >
              {/* 1. Category Filter */}
              <View className="mb-6">
                <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-2.5">
                  Meal Category
                </Text>
                <View className="flex-row flex-wrap">
                  {CATEGORIES_LIST.map((cat) => {
                    const isSelected = draftFilters.category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            category: cat,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-2xl mr-2 mb-2 border ${
                          isSelected
                            ? "bg-[#FF6000] border-[#FF6000]"
                            : "bg-white border-[#EFE5D6]"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? "text-white" : "text-[#78716C]"
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Price Range in GH₵ */}
              <View className="mb-6">
                <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-2.5">
                  Price Range (GH₵)
                </Text>
                <View className="flex-row flex-wrap mb-3">
                  {PRICE_TIERS.map((tier) => {
                    const active =
                      draftFilters.minPrice === tier.min &&
                      draftFilters.maxPrice === tier.max;
                    return (
                      <TouchableOpacity
                        key={tier.label}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            minPrice: tier.min,
                            maxPrice: tier.max,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-xl mr-2 mb-2 border ${
                          active
                            ? "bg-[#FF6000] border-[#FF6000]"
                            : "bg-white border-[#EFE5D6]"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-[#78716C]"
                          }`}
                        >
                          {tier.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Min / Max Inputs */}
                <View style={{ gap: 12 }} className="flex-row items-center">
                  <View className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl px-3 py-2 flex-row items-center">
                    <Text className="text-xs font-bold text-[#78716C] mr-1">
                      Min GH₵
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={
                        draftFilters.minPrice !== null
                          ? String(draftFilters.minPrice)
                          : ""
                      }
                      onChangeText={(val) => {
                        const num = val === "" ? null : Number(val);
                        setDraftFilters((prev) => ({ ...prev, minPrice: num }));
                      }}
                      placeholder="0"
                      placeholderTextColor="#A8A29E"
                      className="flex-1 text-sm font-black text-[#1C1917]"
                    />
                  </View>
                  <Text className="text-xs font-bold text-[#78716C] px-2">
                    to
                  </Text>
                  <View className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl px-3 py-2 flex-row items-center">
                    <Text className="text-xs font-bold text-[#78716C] mr-1">
                      Max GH₵
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={
                        draftFilters.maxPrice !== null
                          ? String(draftFilters.maxPrice)
                          : ""
                      }
                      onChangeText={(val) => {
                        const num = val === "" ? null : Number(val);
                        setDraftFilters((prev) => ({ ...prev, maxPrice: num }));
                      }}
                      placeholder="200"
                      placeholderTextColor="#A8A29E"
                      className="flex-1 text-sm font-black text-[#1C1917]"
                    />
                  </View>
                </View>
              </View>

              {/* 3. Food Type / Dietary Preferences */}
              <View className="mb-6">
                <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-2.5">
                  Dietary & Food Type
                </Text>
                <View className="flex-row flex-wrap">
                  {FOOD_TYPES_LIST.filter((t) => t !== "All Types").map(
                    (type) => {
                      const selected = draftFilters.foodTypes.includes(type);
                      return (
                        <TouchableOpacity
                          key={type}
                          onPress={() => {
                            setDraftFilters((prev) => {
                              const exists = prev.foodTypes.includes(type);
                              return {
                                ...prev,
                                foodTypes: exists
                                  ? prev.foodTypes.filter((t) => t !== type)
                                  : [...prev.foodTypes, type],
                              };
                            });
                          }}
                          className={`px-3.5 py-2 rounded-2xl mr-2 mb-2 border flex-row items-center ${
                            selected
                              ? "bg-[#FF6000] border-[#FF6000]"
                              : "bg-white border-[#EFE5D6]"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              selected ? "text-white" : "text-[#78716C]"
                            }`}
                          >
                            {type === "Spicy" ? "🌶️ Spicy" : type}
                          </Text>
                          {selected && (
                            <Feather
                              name="check"
                              size={12}
                              color="#ffffff"
                              style={{ marginLeft: 4 }}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              {/* 4. Minimum Customer Rating */}
              <View className="mb-6">
                <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-2.5">
                  Customer Rating
                </Text>
                <View className="flex-row flex-wrap">
                  {RATING_OPTIONS.map((opt) => {
                    const active = draftFilters.minRating === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            minRating: opt.value,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-2xl mr-2 mb-2 border ${
                          active
                            ? "bg-[#FF6000] border-[#FF6000]"
                            : "bg-white border-[#EFE5D6]"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-[#78716C]"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. Preparation Time */}
              <View className="mb-6">
                <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-2.5">
                  Preparation Time
                </Text>
                <View className="flex-row flex-wrap">
                  {PREP_TIME_OPTIONS.map((opt) => {
                    const active = draftFilters.prepTimeMax === opt.max;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            prepTimeMax: opt.max,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-2xl mr-2 mb-2 border ${
                          active
                            ? "bg-[#FF6000] border-[#FF6000]"
                            : "bg-white border-[#EFE5D6]"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-[#78716C]"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. Restaurant Location Branch */}
              <View className="mb-6">
                <Text className="text-xs font-black text-[#1C1917] uppercase tracking-wider mb-2.5">
                  Restaurant Branch
                </Text>
                <View className="flex-row flex-wrap">
                  {RESTAURANT_LOCATIONS.map((loc) => {
                    const active = draftFilters.restaurant === loc;
                    return (
                      <TouchableOpacity
                        key={loc}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            restaurant: loc,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-2xl mr-2 mb-2 border ${
                          active
                            ? "bg-[#FF6000] border-[#FF6000]"
                            : "bg-white border-[#EFE5D6]"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-[#78716C]"
                          }`}
                        >
                          {loc.replace("CliqsBite", "").trim() ||
                            "All Locations"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 7. Availability & Deals Switches */}
              <View className="bg-white border border-[#EFE5D6] rounded-2xl p-4 mb-6">
                {/* Available to Order Now */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      availableOnly: !prev.availableOnly,
                    }))
                  }
                  className="flex-row items-center justify-between py-2 border-b border-[#FAF4EB]"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-black text-[#1C1917]">
                      Available To Order Now
                    </Text>
                    <Text className="text-xs text-[#78716C]">
                      Hide temporarily sold out or out-of-stock items
                    </Text>
                  </View>
                  <View
                    className={`w-11 h-6 rounded-full p-0.5 justify-center ${
                      draftFilters.availableOnly
                        ? "bg-[#16A34A] items-end"
                        : "bg-[#E5E7EB] items-start"
                    }`}
                  >
                    <View className="w-5 h-5 rounded-full bg-white" />
                  </View>
                </TouchableOpacity>

                {/* Special Offers & Discounts */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      discountOnly: !prev.discountOnly,
                    }))
                  }
                  className="flex-row items-center justify-between py-2 pt-3"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-black text-[#1C1917]">
                      Discounted Meals & Offers 🏷️
                    </Text>
                    <Text className="text-xs text-[#78716C]">
                      Show only meals currently on promotional discount
                    </Text>
                  </View>
                  <View
                    className={`w-11 h-6 rounded-full p-0.5 justify-center ${
                      draftFilters.discountOnly
                        ? "bg-[#FF6000] items-end"
                        : "bg-[#E5E7EB] items-start"
                    }`}
                  >
                    <View className="w-5 h-5 rounded-full bg-white" />
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Filter Modal Action Buttons */}
            <View style={{ gap: 12 }} className="p-5 bg-white border-t border-[#EFE5D6] flex-row items-center">
              <TouchableOpacity
                onPress={() => setDraftFilters(DEFAULT_FILTERS)}
                className="px-4 py-3.5 rounded-2xl bg-[#FAF4EB] border border-[#EFE5D6] items-center justify-center mr-2"
              >
                <Text className="text-xs font-black text-[#78716C]">
                  Reset All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApplyFilters}
                className="flex-1 py-3.5 rounded-2xl bg-[#FF6000] items-center justify-center border border-[#EA580C]"
              >
                <Text className="text-sm font-black text-white uppercase tracking-wider">
                  Apply Filters ({draftMatchCount} Meals)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SORTING OPTIONS MODAL */}
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
                Sort Dishes By
              </Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Feather name="x" size={20} color="#1C1917" />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((opt) => {
              const isSelected = currentSort === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setCurrentSort(opt.id);
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

      {/* FLOATING BOTTOM NAVIGATION */}
      <View className="absolute bottom-4 left-5 right-5 z-20">
        <View className="bg-white border border-[#EFE5D6] rounded-full py-2.5 px-6 flex-row items-center justify-between">
          {/* Home */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1"
          >
            <Feather name="home" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Home
            </Text>
          </TouchableOpacity>

          {/* Menu (Active) */}
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1"
          >
            <Feather name="grid" size={20} color="#FF6000" />
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
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

          {/* AI Bot (Voice Agent & Chatbot) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/ai-bot")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1 relative"
          >
            <View className="relative">
              <MaterialCommunityIcons
                name="robot-excited-outline"
                size={21}
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
