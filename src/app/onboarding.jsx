import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCart } from "../context/CartContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ONBOARDING_SLIDES = [
  {
    id: "slide-1",
    tag: "AUTHENTIC GHANAIAN FLAVORS 🇬🇭",
    tagBg: "#EA580C",
    title: "Freshly Made Ghanaian Delicacies",
    description:
      "Savor authentic smoky party jollof, Accra waakye with all the works, hot banku with charcoal-grilled tilapia, and pounded fufu cooked to perfection.",
    image:
      "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=900&auto=format&fit=crop&q=80",
    highlight: "Sizzling & Homemade",
  },
  {
    id: "slide-2",
    tag: "AI CHEF & VOICE AGENT 🤖",
    tagBg: "#7C3AED",
    title: "Order With Your Voice or Chat",
    description:
      "Tap the new AI Bot tab to speak or chat naturally. Tell the AI 'Order 2 Jollof and kelewele to East Legon' and watch your cart populate instantly.",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80",
    highlight: "Hands-Free Ordering",
  },
  {
    id: "slide-3",
    tag: "LIGHTNING FAST DISPATCH 🛵",
    tagBg: "#16A34A",
    title: "Hot Doorstep Delivery & GPS",
    description:
      "Dispatched in heat-retaining thermal packs. Track your assigned rider live on the interactive map from kitchen grill to your front door.",
    image:
      "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?w=900&auto=format&fit=crop&q=80",
    highlight: "Live Rider Tracking",
  },
  {
    id: "slide-4",
    tag: "SECURE MOBILE MONEY & REWARDS 💳",
    tagBg: "#2563EB",
    title: "Instant MoMo & Card Payments",
    description:
      "Pay securely with MTN MoMo, Telecel Cash, or cards. Earn exclusive discounts, redeem CliqsPoints, and unlock free delivery.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=80",
    highlight: "Cashless & Safe",
  },
];

export default function OnboardingScreen({ onComplete }) {
  const { completeOnboarding } = useCart();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleFinish = (targetRoute) => {
    if (onComplete) {
      onComplete();
    }
    if (completeOnboarding) {
      completeOnboarding();
    }
    if (targetRoute) {
      router.push(targetRoute);
    }
  };

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIdx = activeIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIdx * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIdx);
    } else {
      handleFinish("/auth/role-select");
    }
  };

  const handleSkip = () => {
    handleFinish(null);
  };

  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Top Header: Brand & Skip Button */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Feather name="coffee" size={16} color="#ffffff" />
          </View>
          <Text style={styles.brandText}>CliqsBite</Text>
        </View>

        {!isLastSlide ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Explore</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {ONBOARDING_SLIDES.map((slide) => (
          <View
            key={slide.id}
            style={[styles.slideContainer, { width: SCREEN_WIDTH }]}
          >
            {/* Slide Hero Card with Image */}
            <View style={styles.imageCard}>
              <Image
                source={{ uri: slide.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.overlay}>
                <View style={[styles.badge, { backgroundColor: slide.tagBg }]}>
                  <Text style={styles.badgeText}>{slide.tag}</Text>
                </View>

                <View style={styles.highlightBadge}>
                  <Text style={styles.highlightText}>{slide.highlight}</Text>
                </View>
              </View>
            </View>

            {/* Slide Narrative Content */}
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>{slide.title}</Text>
              <Text style={styles.descText}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls Area */}
      <View style={styles.footer}>
        {/* Progress Dots Indicator */}
        <View style={styles.dotsRow}>
          {ONBOARDING_SLIDES.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>

        {/* Action Buttons */}
        {isLastSlide ? (
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => handleFinish("/auth/register")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Create Account & Get Started
              </Text>
            </TouchableOpacity>

            <View style={styles.dualButtonRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleFinish("/auth/login")}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineButtonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleFinish(null)}
                style={styles.guestButton}
              >
                <Text style={styles.guestButtonText}>Browse As Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.bottomNavRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSkip}
              style={{ paddingVertical: 12, paddingHorizontal: 10 }}
            >
              <Text style={styles.skipIntroText}>Skip Intro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNext}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="arrow-right" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF4EB",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.5,
    color: "#FF6000",
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EFE5D6",
  },
  skipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78716C",
  },
  slideContainer: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  imageCard: {
    flex: 1,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: "#1C1917",
    borderWidth: 1,
    borderColor: "#EFE5D6",
    maxHeight: "52%",
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "space-between",
    padding: 20,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  highlightBadge: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  highlightText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ffffff",
  },
  textContainer: {
    paddingVertical: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1C1917",
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#78716C",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    marginHorizontal: 4,
    borderRadius: 999,
  },
  activeDot: {
    width: 28,
    height: 10,
    backgroundColor: "#FF6000",
  },
  inactiveDot: {
    width: 10,
    height: 10,
    backgroundColor: "#EFE5D6",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#FF6000",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EA580C",
    marginBottom: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dualButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EFE5D6",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1C1917",
  },
  guestButton: {
    flex: 1,
    backgroundColor: "#FAF4EB",
    borderWidth: 1,
    borderColor: "#EFE5D6",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  guestButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#78716C",
  },
  bottomNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipIntroText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78716C",
  },
  nextButton: {
    backgroundColor: "#FF6000",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EA580C",
  },
  nextButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#ffffff",
    marginRight: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
