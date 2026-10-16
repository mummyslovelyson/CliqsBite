import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const LOGO_IMG = require("../../../assets/images/logo.jpg");

export default function AboutScreen() {
  const router = useRouter();

  const [ratingModal, setRatingModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const referralCode = "CLIQS-GH24";

  const handleCopyReferral = () => {
    Alert.alert("Referral Code Copied ✓", `Share "${referralCode}" with friends. They get GH₵ 25 off their first bucket, and you get GH₵ 20 in CliqsPay credit!`);
  };

  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      Alert.alert("Latest Version Installed", "CliqsBite v1.0.0 is up to date with the latest performance & security improvements.");
    }, 600);
  };

  const handleSubmitRating = () => {
    setRatingModal(false);
    Alert.alert("Thank You! ⭐", "Your rating and feedback help us make CliqsBite the best fast-food delivery experience in Ghana.");
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
          About &amp; Rewards
        </Text>

        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Brand Banner */}
        <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5 items-center">
          <View className="w-20 h-20 rounded-2xl overflow-hidden mb-3 border border-[#EFE5D6]">
            <Image
              source={LOGO_IMG}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <Text className="text-2xl font-black text-[#1C1917]">CliqsBite</Text>
          <Text className="text-sm font-black text-[#FF6000] tracking-wide mt-0.5">
            CRUNCHY • TASTY • FAST
          </Text>

          <Text className="text-sm text-[#57534E] text-center leading-6 mt-3 font-medium">
            Ghana&apos;s premier fast-food destination delivering sizzling fried chicken buckets, gourmet burgers, crispy loaded fries, and authentic shito dips straight to your door in under 35 minutes.
          </Text>
        </View>

        {/* Invite Friends & Earn Rewards Card */}
        <View className="bg-[#1C1917] rounded-[28px] p-6 mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#FF6000] items-center justify-center mr-3">
                <Ionicons name="gift-outline" size={20} color="#ffffff" />
              </View>
              <View>
                <Text className="text-base font-black text-white">Invite Friends &amp; Earn</Text>
                <Text className="text-xs text-[#A8A29E] font-medium">Get GH₵ 20 for every friend who orders</Text>
              </View>
            </View>
          </View>

          <Text className="text-xs text-[#A8A29E] leading-5 mb-4 font-medium">
            Give your friends GH₵ 25 off their first meal bucket. Once their order is delivered, we deposit GH₵ 20 directly into your CliqsPay Wallet.
          </Text>

          <View className="bg-white/10 rounded-2xl p-4 flex-row items-center justify-between border border-white/10">
            <View>
              <Text className="text-xs text-[#A8A29E] font-bold">Your Referral Code</Text>
              <Text className="text-xl font-black text-[#FF6000] tracking-widest mt-0.5">
                {referralCode}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopyReferral}
              className="bg-[#FF6000] px-5 py-2.5 rounded-xl flex-row items-center"
            >
              <Feather name="copy" size={15} color="#ffffff" />
              <Text className="text-xs font-black text-white ml-1.5">Share Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rate CliqsBite */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setRatingModal(true)}
          className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-11 h-11 rounded-2xl bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mr-3.5">
              <Feather name="star" size={20} color="#FF6000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#1C1917]">Rate CliqsBite on App Store</Text>
              <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Your 5-star review helps us grow across Accra</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color="#A8A29E" />
        </TouchableOpacity>

        {/* Core Values Pillars */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#1C1917] mb-3">
            Our Quality Commitments
          </Text>

          {[
            {
              icon: "flame",
              title: "Always Fried Fresh",
              desc: "Never pre-cooked or reheated under heat lamps. Frying begins only when your order is placed.",
            },
            {
              icon: "truck",
              title: "35-Minute Fast Dispatch",
              desc: "Thermal insulated bags keep your chicken sizzling hot and crispy till doorstep handover.",
            },
            {
              icon: "shield",
              title: "100% Sourced in Ghana",
              desc: "Fresh farm-raised poultry, organic Ghanaian herbs, and premium local chili varieties.",
            },
          ].map((pill, idx) => (
            <View key={idx} className="flex-row items-start mb-3.5 last:mb-0">
              <View className="w-9 h-9 rounded-xl bg-[#FAF4EB] border border-[#EFE5D6] items-center justify-center mr-3">
                <Feather name={pill.icon} size={16} color="#FF6000" />
              </View>
              <View className="flex-1 pt-0.5">
                <Text className="text-base font-bold text-[#1C1917]">{pill.title}</Text>
                <Text className="text-xs text-[#78716C] leading-5 font-medium mt-0.5">{pill.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Version & Update Section */}
        <View className="items-center py-4">
          <Text className="text-sm font-bold text-[#78716C] mb-2">
            CliqsBite Mobile • v1.0.0 (Build 57)
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCheckUpdate}
            className="flex-row items-center bg-white border border-[#EFE5D6] px-4 py-2 rounded-full"
          >
            <Feather name="refresh-cw" size={13} color="#FF6000" className="mr-1.5" />
            <Text className="text-xs font-bold text-[#FF6000] ml-1.5">
              {isCheckingUpdate ? "Checking for updates..." : "Check for Updates"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive 5-Star Rating Modal */}
      <Modal visible={ratingModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setRatingModal(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-[#78716C] text-center mb-5 font-medium">
              How satisfied are you with our food taste, portions, and delivery speed?
            </Text>

            {/* Interactive Stars */}
            <View className="flex-row justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedStars(star)}
                  className="mx-2 p-1"
                >
                  <Ionicons
                    name={star <= selectedStars ? "star" : "star-outline"}
                    size={38}
                    color="#FF6000"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSubmitRating}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Submit Rating</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRatingModal(false)}
              className="w-full py-3 items-center justify-center"
            >
              <Text className="text-sm font-bold text-[#78716C]">Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
