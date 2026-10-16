import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function FoodPreferencesScreen() {
  const router = useRouter();

  // Spice level
  const [spicePreference, setSpicePreference] = useState("Hot & Spicy");

  // Cutlery
  const [includeCutlery, setIncludeCutlery] = useState(false);
  const [extraNapkins, setExtraNapkins] = useState(true);

  // Allergies
  const [allergies, setAllergies] = useState({
    peanuts: false,
    lactose: false,
    gluten: false,
    shellfish: false,
    eggs: false,
  });
  const [customAllergyNote, setCustomAllergyNote] = useState("");

  // Drop-off
  const [dropoffPreference, setDropoffPreference] = useState("handover");

  const toggleAllergy = (key) => {
    setAllergies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    Alert.alert("Preferences Saved", "Your kitchen preparation notes and allergy warnings have been updated.");
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
          Food Preferences
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSave}
          className="px-4 py-2 bg-[#FF6000] rounded-xl"
        >
          <Text className="text-sm font-black text-white">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* 1. Default Spice Level */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="chili-hot" size={20} color="#FF6000" />
            <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] ml-2">
              Default Pepper Level
            </Text>
          </View>
          <Text className="text-xs text-[#78716C] mb-4 font-medium">
            Choose your preferred spice level applied across fried chicken &amp; loaded fries
          </Text>

          <View className="flex-row flex-wrap">
            {[
              { id: "Mild", desc: "No chili, just herb seasoning" },
              { id: "Medium", desc: "Mild kick of Ghanaian shito" },
              { id: "Hot & Spicy", desc: "Traditional fiery chili glaze" },
              { id: "Extra Fire", desc: "Scorpion pepper crunch" },
            ].map((spice) => {
              const isSelected = spicePreference === spice.id;
              return (
                <TouchableOpacity
                  key={spice.id}
                  activeOpacity={0.8}
                  onPress={() => setSpicePreference(spice.id)}
                  className={`w-full p-4 rounded-2xl mb-2.5 border flex-row items-center justify-between ${
                    isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                  }`}
                >
                  <View className="flex-1 mr-2">
                    <Text className={`text-base font-bold ${isSelected ? "text-[#FF6000]" : "text-[#1C1917]"}`}>
                      {spice.id}
                    </Text>
                    <Text className="text-xs text-[#78716C] mt-0.5 font-medium">{spice.desc}</Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full items-center justify-center border ${
                      isSelected ? "border-[#FF6000] bg-[#FF6000]" : "border-[#A8A29E] bg-white"
                    }`}
                  >
                    {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Dietary & Food Allergies */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <View className="flex-row items-center mb-2">
            <Feather name="alert-triangle" size={18} color="#FF6000" />
            <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] ml-2">
              Dietary Warnings &amp; Allergies
            </Text>
          </View>
          <Text className="text-xs text-[#78716C] mb-4 font-medium">
            Our kitchen team will sanitize utensils and exclude these ingredients
          </Text>

          <View className="flex-row flex-wrap mb-4">
            {[
              { key: "peanuts", label: "Peanuts / Groundnuts" },
              { key: "lactose", label: "Dairy / Lactose" },
              { key: "gluten", label: "Gluten / Wheat" },
              { key: "shellfish", label: "Crab & Shrimp" },
              { key: "eggs", label: "Eggs" },
            ].map((allergy) => {
              const checked = allergies[allergy.key];
              return (
                <TouchableOpacity
                  key={allergy.key}
                  onPress={() => toggleAllergy(allergy.key)}
                  className={`px-4 py-2.5 rounded-full mr-2 mb-2 border flex-row items-center ${
                    checked ? "bg-[#FF6000] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                  }`}
                >
                  {checked && <Ionicons name="checkmark" size={15} color="#ffffff" className="mr-1.5" />}
                  <Text className={`text-xs font-bold ${checked ? "text-white" : "text-[#78716C]"}`}>
                    {allergy.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-sm font-bold text-[#78716C] mb-1.5">
            Specific Kitchen Notes (Optional)
          </Text>
          <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 min-h-[85px]">
            <TextInput
              value={customAllergyNote}
              onChangeText={setCustomAllergyNote}
              placeholder="e.g. Please no onions or mayonnaise on burgers..."
              placeholderTextColor="#A8A29E"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="text-base font-medium text-[#1C1917]"
            />
          </View>
        </View>

        {/* 3. Eco Packaging & Cutlery */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-3">
            Eco Packaging &amp; Cutlery
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIncludeCutlery(!includeCutlery)}
            className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
          >
            <View className="flex-1 mr-3">
              <Text className="text-base font-bold text-[#1C1917]">Include Disposable Cutlery</Text>
              <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Reduce plastic waste by opting out if eating at home</Text>
            </View>
            <View
              className={`w-6 h-6 rounded-md items-center justify-center border ${
                includeCutlery ? "bg-[#FF6000] border-[#FF6000]" : "bg-white border-[#A8A29E]"
              }`}
            >
              {includeCutlery && <Feather name="check" size={14} color="#ffffff" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setExtraNapkins(!extraNapkins)}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-1 mr-3">
              <Text className="text-base font-bold text-[#1C1917]">Extra Napkins &amp; Wet Wipes</Text>
              <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Add complimentary sanitizing wet wipes with chicken buckets</Text>
            </View>
            <View
              className={`w-6 h-6 rounded-md items-center justify-center border ${
                extraNapkins ? "bg-[#FF6000] border-[#FF6000]" : "bg-white border-[#A8A29E]"
              }`}
            >
              {extraNapkins && <Feather name="check" size={14} color="#ffffff" />}
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Drop-off Handover Style */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-6">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-3">
            Rider Handover Style
          </Text>

          {[
            { id: "handover", label: "Hand directly to me", desc: "Rider meets you at your door or apartment gate" },
            { id: "doorstep", label: "Leave at door / reception", desc: "Contactless delivery with photo proof confirmation" },
          ].map((opt) => {
            const isSelected = dropoffPreference === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => setDropoffPreference(opt.id)}
                className={`w-full p-4 rounded-2xl mb-2.5 border flex-row items-center justify-between ${
                  isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                }`}
              >
                <View className="flex-1 mr-2">
                  <Text className={`text-base font-bold ${isSelected ? "text-[#FF6000]" : "text-[#1C1917]"}`}>
                    {opt.label}
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">{opt.desc}</Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full items-center justify-center border ${
                    isSelected ? "border-[#FF6000] bg-[#FF6000]" : "border-[#A8A29E] bg-white"
                  }`}
                >
                  {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
