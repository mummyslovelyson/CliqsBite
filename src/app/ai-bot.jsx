import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MENU_ITEMS } from "../data/menuData";
import { useCart } from "../context/CartContext";

const QUICK_PROMPTS = [
  { label: "🍛 Best Party Jollof", query: "Show me your best Jollof Rice" },
  { label: "🇬🇭 Authentic Waakye", query: "I want authentic Waakye with all the works" },
  { label: "🌶️ Spicy under GH₵ 80", query: "Find spicy meals under 80 cedis" },
  { label: "🐟 Banku & Tilapia", query: "Order hot Banku with grilled Tilapia" },
  { label: "🌱 Vegan & Healthy", query: "What vegetarian or vegan options do you have?" },
  { label: "⚡ Under 15 Mins", query: "What can I get delivered fastest?" },
  { label: "🛵 Track My Order", query: "Check my active delivery status" },
];

const CATEGORIZED_VOICE_COMMANDS = [
  {
    category: "Ghanaian Classics",
    icon: "award",
    commands: [
      "Order 2 Smoky Party Jollof with extra kelewele",
      "Get me Accra Waakye with boiled egg and spaghetti",
      "I want Banku with charcoal grilled tilapia and hot pepper",
    ],
  },
  {
    category: "Fast & Under 15 Mins",
    icon: "zap",
    commands: [
      "What is the fastest hot meal ready in under 15 minutes?",
      "Order 8-Pcs Hot Wings with extra shito dip",
    ],
  },
  {
    category: "Budget & Combos",
    icon: "dollar-sign",
    commands: [
      "Recommend a hearty lunch combo under GH₵ 75",
      "Find meals with spicy fried plantains under 50 cedis",
    ],
  },
  {
    category: "Order Support & Dispatch",
    icon: "truck",
    commands: [
      "Where is my rider right now?",
      "Check my order ETA and delivery address",
    ],
  },
];

// Helper to search and filter real MENU_ITEMS
function findAiRecommendedMeals(query) {
  if (!query) return [];
  const q = query.toLowerCase();

  return MENU_ITEMS.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(q);
    const catMatch = item.category.toLowerCase().includes(q);
    const descMatch = item.description.toLowerCase().includes(q);
    const ingredientMatch = Array.isArray(item.ingredients)
      ? item.ingredients.some((ing) => ing.toLowerCase().includes(q))
      : false;

    // Ghanaian dish keyword matches
    if (q.includes("jollof") && item.id.includes("jollof")) return true;
    if (q.includes("waakye") && item.id.includes("waakye")) return true;
    if (q.includes("banku") && item.id.includes("banku")) return true;
    if (q.includes("fufu") && item.id.includes("fufu")) return true;
    if (q.includes("kenkey") && item.id.includes("kenkey")) return true;
    if (q.includes("kelewele") && item.id.includes("kelewele")) return true;
    if (q.includes("burger") && item.category === "Burgers") return true;
    if (q.includes("wing") && item.id.includes("wings")) return true;
    if (q.includes("pizza") && item.category === "Pizza") return true;
    if ((q.includes("drink") || q.includes("sobolo")) && item.category === "Drinks") return true;

    // Price query
    if (q.includes("80") && item.price <= 80) return true;
    if (q.includes("75") && item.price <= 75) return true;
    if (q.includes("50") && item.price <= 50) return true;

    // Dietary
    if (
      (q.includes("vegan") || q.includes("vegetarian") || q.includes("healthy")) &&
      (item.foodType?.includes("Vegan") || item.foodType?.includes("Vegetarian"))
    ) {
      return true;
    }

    // Prep time
    if ((q.includes("fast") || q.includes("15")) && (item.prepTimeMinutes || 30) <= 20) {
      return true;
    }

    return titleMatch || catMatch || descMatch || ingredientMatch;
  }).slice(0, 3);
}

let messageCounter = 100;
function getNextMessageId(prefix) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

export default function AiBotScreen() {
  const { addToCart, cartCount, orders } = useCart();

  // Mode: "chat" or "voice"
  const [mode, setMode] = useState("chat");
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("Tap to speak");
  const [cartToast, setCartToast] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Pulse & Waveform animations
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [waveAnim1] = useState(() => new Animated.Value(0.3));
  const [waveAnim2] = useState(() => new Animated.Value(0.6));
  const [waveAnim3] = useState(() => new Animated.Value(0.9));
  const [waveAnim4] = useState(() => new Animated.Value(0.5));
  const [waveAnim5] = useState(() => new Animated.Value(0.8));

  // Starts completely clean — 0 mock messages
  const [messages, setMessages] = useState([]);

  const scrollViewRef = useRef(null);

  // Audio waveform animation when listening
  useEffect(() => {
    if (isListening) {
      // Orb Pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.22,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Waveform Bars loop
      const createWaveAnimation = (anim, toVal, duration) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: toVal, duration, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.2, duration, useNativeDriver: true }),
          ])
        );

      const anim1 = createWaveAnimation(waveAnim1, 1.0, 300);
      const anim2 = createWaveAnimation(waveAnim2, 0.8, 450);
      const anim3 = createWaveAnimation(waveAnim3, 1.0, 350);
      const anim4 = createWaveAnimation(waveAnim4, 0.7, 500);
      const anim5 = createWaveAnimation(waveAnim5, 0.9, 400);

      anim1.start();
      anim2.start();
      anim3.start();
      anim4.start();
      anim5.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
        anim4.stop();
        anim5.stop();
      };
    } else {
      pulseAnim.setValue(1);
      waveAnim1.setValue(0.3);
      waveAnim2.setValue(0.5);
      waveAnim3.setValue(0.7);
      waveAnim4.setValue(0.4);
      waveAnim5.setValue(0.6);
    }
  }, [isListening, pulseAnim, waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5]);

  // Handle user sending text message
  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMessageId = getNextMessageId("user");
    const userMsg = {
      id: userMessageId,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Formulate AI Chef Response
    setTimeout(() => {
      generateAiResponse(query);
      setIsTyping(false);
    }, 750);
  };

  // Generate dynamic AI response based on real menu data
  const generateAiResponse = (query) => {
    const q = query.toLowerCase();
    const matchedMeals = findAiRecommendedMeals(q);

    let replyText = "";
    let recommendedList = matchedMeals;
    let orderInfo = null;

    if (q.includes("track") || q.includes("status") || q.includes("where") || q.includes("rider")) {
      const activeOrder = (orders || []).find((o) => o.statusCode === "active");
      if (activeOrder) {
        replyText = `Found your active delivery #${activeOrder.id}! It's currently in preparation at the kitchen. Dispatched with thermal heat packs to ${activeOrder.deliveryAddress}.`;
        orderInfo = activeOrder;
      } else {
        replyText =
          "You don't have any active deliveries right now. Check back when you place an order, or browse our menu to order something delicious!";
        recommendedList = [];
      }
    } else if (matchedMeals.length > 0) {
      if (q.includes("spicy")) {
        replyText = `🌶️ Here are Chef Kwame's top spicy Ghanaian dishes spiced with authentic scotch bonnets and shito:`;
      } else if (q.includes("fast") || q.includes("15")) {
        replyText = `⚡ In a rush? These meals are prepped hot and ready to dispatch in under 15 minutes:`;
      } else if (q.includes("vegan") || q.includes("vegetarian")) {
        replyText = `🌱 Delicious plant-based favorites made with ripe sweet plantains, authentic black-eyed beans, and fresh ingredients:`;
      } else {
        replyText = `I found ${matchedMeals.length} authentic kitchen special${
          matchedMeals.length > 1 ? "s" : ""
        } freshly prepared today matching your craving:`;
      }
    } else {
      replyText =
        `I couldn't find any dishes matching "${query}". Try asking for Jollof, Waakye, Banku, Kelewele, or search by price!`;
      recommendedList = [];
    }

    const botMessage = {
      id: getNextMessageId("bot"),
      sender: "bot",
      text: replyText,
      timestamp: "Just now",
      recommendations: recommendedList,
      orderInfo,
    };

    setMessages((prev) => [...prev, botMessage]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // Handle voice agent push-to-talk
  const handleToggleVoice = (presetCommand) => {
    if (isListening) {
      setIsListening(false);
      setVoiceStatus("Voice cancelled");
      return;
    }

    if (presetCommand) {
      setIsListening(true);
      setVoiceStatus("Processing voice command...");
      setVoiceTranscript(`"${presetCommand}"`);

      setTimeout(() => {
        setIsListening(false);
        setVoiceStatus("Understood! Formulating order...");
        setMode("chat");
        handleSendMessage(presetCommand);
      }, 900);
      return;
    }

    // Direct microphone toggle without preset
    setIsListening(true);
    setVoiceStatus("Listening... speak your order");
    setVoiceTranscript("...");

    setTimeout(() => {
      if (isListening) {
        setVoiceStatus("Voice backend ready for live speech stream");
      }
    }, 1500);
  };

  // Quick single add
  const handleQuickAdd = (foodItem) => {
    addToCart({
      id: foodItem.id,
      title: foodItem.title,
      price: foodItem.price,
      quantity: 1,
      image: foodItem.image,
    });

    setCartToast(`Added ${foodItem.title} (GH₵ ${foodItem.price.toFixed(2)}) to cart`);
    setTimeout(() => {
      setCartToast(null);
    }, 2500);
  };

  // Quick add all recommended
  const handleAddAllRecommendations = (items) => {
    if (!items || items.length === 0) return;
    items.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: 1,
        image: item.image,
      });
    });

    const totalCost = items.reduce((sum, item) => sum + item.price, 0);
    setCartToast(`Added all ${items.length} dishes to cart (GH₵ ${totalCost.toFixed(2)})`);
    setTimeout(() => {
      setCartToast(null);
    }, 2800);
  };

  // Clear chat conversation
  const handleClearChat = () => {
    Alert.alert(
      "Clear Conversation",
      "Would you like to reset your chat with Chef Kwame?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setMessages([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* TOP HEADER */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <View className="items-center">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-[#16A34A] mr-1.5" />
            <Text className="text-xl font-black text-[#1C1917] tracking-tight">
              Chef Kwame AI
            </Text>
          </View>
          <Text className="text-xs font-semibold text-[#78716C] -mt-0.5">
            Voice Agent &amp; Smart Food Assistant
          </Text>
        </View>

        {/* Clear Chat & Cart button */}
        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClearChat}
            className="w-9 h-9 rounded-xl bg-white border border-[#EFE5D6] items-center justify-center mr-2"
          >
            <Feather name="trash-2" size={16} color="#78716C" />
          </TouchableOpacity>

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
      </View>

      {/* FLOATING SUCCESS TOAST */}
      {cartToast && (
        <View
          style={{ elevation: 4 }}
          className="absolute top-20 left-6 right-6 z-50 bg-[#1C1917] px-4 py-3 rounded-2xl flex-row items-center justify-between border border-[#FF6000]"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <Feather name="check-circle" size={17} color="#22C55E" />
            <Text className="text-white text-xs font-bold ml-2.5 flex-1" numberOfLines={1}>
              {cartToast}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/cart")}>
            <Text className="text-xs font-black text-[#FF6000]">VIEW CART</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODE TOGGLE: CHATBOT vs VOICE AGENT */}
      <View className="px-5 pt-3 pb-2 bg-[#FAF4EB] z-10">
        <View className="flex-row bg-white border border-[#EFE5D6] rounded-2xl p-1">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode("chat")}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
              mode === "chat" ? "bg-[#FF6000]" : "bg-transparent"
            }`}
          >
            <MaterialCommunityIcons
              name="chat-processing-outline"
              size={17}
              color={mode === "chat" ? "#ffffff" : "#78716C"}
            />
            <Text
              className={`text-xs font-black ml-1.5 ${
                mode === "chat" ? "text-white" : "text-[#78716C]"
              }`}
            >
              Smart Chatbot
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode("voice")}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
              mode === "voice" ? "bg-[#FF6000]" : "bg-transparent"
            }`}
          >
            <Feather
              name="mic"
              size={16}
              color={mode === "voice" ? "#ffffff" : "#78716C"}
            />
            <Text
              className={`text-xs font-black ml-1.5 ${
                mode === "voice" ? "text-white" : "text-[#78716C]"
              }`}
            >
              Voice Order Agent
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* VOICE AGENT FULL INTERFACE */}
      {mode === "voice" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 110 }}
        >
          {/* Top Instructions */}
          <View className="items-center mb-6">
            <View className="bg-white px-3.5 py-1.5 rounded-full border border-[#EFE5D6] mb-2 flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#FF6000] mr-2" />
              <Text className="text-[11px] font-black text-[#FF6000] uppercase tracking-wider">
                Accra Speech-to-Order AI
              </Text>
            </View>
            <Text className="text-2xl font-black text-[#1C1917] text-center mb-1.5 tracking-tight">
              Speak to Order Food
            </Text>
            <Text className="text-xs font-medium text-[#78716C] text-center max-w-[300px] leading-5">
              Press the glowing microphone and speak naturally in English, Twi or Pidgin. Tell Chef Kwame what you want to eat!
            </Text>
          </View>

          {/* Central Animated Mic Orb & Waveform */}
          <View className="items-center justify-center my-4">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                elevation: isListening ? 8 : 1,
              }}
              className={`w-36 h-36 rounded-full items-center justify-center border-4 ${
                isListening
                  ? "bg-[#FF6000] border-[#FED7AA]"
                  : "bg-white border-[#EFE5D6]"
              }`}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleToggleVoice()}
                className="w-full h-full items-center justify-center"
              >
                <Feather
                  name={isListening ? "radio" : "mic"}
                  size={52}
                  color={isListening ? "#ffffff" : "#FF6000"}
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Dynamic Waveform Visualizer */}
            <View
              style={{ gap: 6 }}
              className="flex-row items-center justify-center h-10 mt-5"
            >
              {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5].map((anim, idx) => (
                <Animated.View
                  key={`wave-${idx}`}
                  style={{
                    transform: [{ scaleY: isListening ? anim : 0.3 }],
                  }}
                  className={`w-2 h-8 rounded-full ${
                    isListening ? "bg-[#FF6000]" : "bg-[#EFE5D6]"
                  }`}
                />
              ))}
            </View>

            <Text className="text-xs font-black uppercase tracking-wider text-[#FF6000] mt-3">
              {voiceStatus}
            </Text>

            {voiceTranscript ? (
              <View className="bg-white border border-[#EFE5D6] px-4 py-3 rounded-2xl mt-3 max-w-[340px]">
                <Text className="text-xs font-bold text-[#1C1917] text-center italic">
                  {voiceTranscript}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Categorized Voice Prompts */}
          <View className="mt-4">
            <Text className="text-xs font-black uppercase tracking-wider text-[#78716C] mb-3">
              Sample Voice Phrases to Try
            </Text>

            {CATEGORIZED_VOICE_COMMANDS.map((cat) => (
              <View key={cat.category} className="mb-3 bg-white border border-[#EFE5D6] rounded-[22px] p-3.5">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 rounded-lg bg-[#FFF3EB] items-center justify-center mr-2">
                    <Feather name={cat.icon} size={12} color="#FF6000" />
                  </View>
                  <Text className="text-xs font-black text-[#1C1917]">{cat.category}</Text>
                </View>

                {cat.commands.map((cmd) => (
                  <TouchableOpacity
                    key={cmd}
                    activeOpacity={0.7}
                    onPress={() => handleToggleVoice(cmd)}
                    className="py-2.5 px-3 rounded-xl bg-[#FAF4EB] border border-[#EFE5D6] flex-row items-center justify-between mb-1.5"
                  >
                    <Text className="text-xs font-bold text-[#1C1917] flex-1 mr-2" numberOfLines={1}>
                      &ldquo;{cmd}&rdquo;
                    </Text>
                    <Feather name="mic" size={13} color="#FF6000" />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* CHATBOT MESSAGE STREAM */
        <View className="flex-1 pb-24">
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}
          >
            {messages.length === 0 ? (
              <View className="items-center justify-center py-10 px-4">
                <View
                  style={{ elevation: 2 }}
                  className="w-16 h-16 rounded-full bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mb-3.5"
                >
                  <MaterialCommunityIcons name="chef-hat" size={32} color="#FF6000" />
                </View>
                <Text className="text-xl font-black text-[#1C1917] text-center mb-1 tracking-tight">
                  Chef Kwame AI Assistant
                </Text>
                <Text className="text-xs text-[#78716C] text-center max-w-[280px] leading-5 font-medium mb-6">
                  Akwaaba! Ask anything about Ghanaian meals, search ingredients, inquire about dietary options, or find dishes matching your budget.
                </Text>

                {/* Quick Starting Prompts */}
                <View className="w-full">
                  <Text className="text-[11px] font-black uppercase tracking-wider text-[#A8A29E] mb-2.5 text-center">
                    Quick Questions to Ask
                  </Text>
                  {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                    <TouchableOpacity
                      key={prompt.label}
                      activeOpacity={0.75}
                      onPress={() => handleSendMessage(prompt.query)}
                      style={{ elevation: 1 }}
                      className="bg-white border border-[#EFE5D6] px-4 py-3 rounded-2xl mb-2 flex-row items-center justify-between"
                    >
                      <Text className="text-xs font-bold text-[#1C1917]">
                        {prompt.label}
                      </Text>
                      <Feather name="arrow-right" size={13} color="#FF6000" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <View
                    key={msg.id}
                    className={`mb-4 flex-row ${isUser ? "justify-end" : "justify-start"}`}
                  >
                  {!isUser && (
                    <View
                      style={{ elevation: 2 }}
                      className="w-8 h-8 rounded-full bg-[#FF6000] items-center justify-center mr-2 mt-1"
                    >
                      <MaterialCommunityIcons
                        name="chef-hat"
                        size={18}
                        color="#ffffff"
                      />
                    </View>
                  )}

                  <View className={`max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                    {/* Chat Bubble */}
                    <View
                      style={!isUser ? { elevation: 1 } : undefined}
                      className={`p-3.5 rounded-[22px] ${
                        isUser
                          ? "bg-[#1C1917] rounded-tr-sm"
                          : "bg-white border border-[#EFE5D6] rounded-tl-sm"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium leading-5 ${
                          isUser ? "text-white" : "text-[#1C1917]"
                        }`}
                      >
                        {msg.text}
                      </Text>
                    </View>

                    {/* Active Order Card if user asked about dispatch */}
                    {msg.orderInfo && (
                      <View className="w-full mt-2.5 bg-white border border-[#FF6000] rounded-2xl p-3">
                        <View className="flex-row items-center justify-between mb-1.5">
                          <Text className="text-xs font-black text-[#1C1917]">
                            Order #{msg.orderInfo.id}
                          </Text>
                          <View className="bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-black text-[#16A34A] uppercase">
                              {msg.orderInfo.status}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-[#78716C] mb-2 font-medium">
                          Delivery to: {msg.orderInfo.deliveryAddress}
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => router.push("/profile/orders")}
                          className="bg-[#FF6000] py-2 rounded-xl items-center justify-center"
                        >
                          <Text className="text-xs font-black text-white">Track Order on Map</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Interactive Dish Recommendations inside AI message */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <View style={{ gap: 8 }} className="w-full mt-2.5">
                        {msg.recommendations.map((food) => (
                          <View
                            key={food.id}
                            className="bg-white border border-[#EFE5D6] rounded-2xl p-2.5 flex-row items-center mb-1.5"
                          >
                            <Image
                              source={{ uri: food.image }}
                              style={{ width: 56, height: 56, borderRadius: 12 }}
                              contentFit="cover"
                            />
                            <View className="flex-1 ml-2.5 pr-2">
                              <Text
                                className="text-xs font-black text-[#1C1917]"
                                numberOfLines={1}
                              >
                                {food.title}
                              </Text>
                              <View className="flex-row items-center mt-0.5">
                                <Text className="text-xs font-black text-[#FF6000] mr-2">
                                  GH₵ {food.price.toFixed(2)}
                                </Text>
                                <View className="flex-row items-center">
                                  <Ionicons name="star" size={10} color="#F59E0B" />
                                  <Text className="text-[10px] font-bold text-[#1C1917] ml-0.5">
                                    {food.rating}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => handleQuickAdd(food)}
                              style={{ elevation: 2 }}
                              className="bg-[#FF6000] px-3 py-1.5 rounded-xl flex-row items-center"
                            >
                              <Feather name="plus" size={13} color="#ffffff" />
                              <Text className="text-[10px] font-black text-white ml-1">
                                Add
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ))}

                        {/* Bundle Button to add all recommended items */}
                        {msg.recommendations.length > 1 && (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => handleAddAllRecommendations(msg.recommendations)}
                            className="bg-[#FAF4EB] border border-[#FF6000] py-2 rounded-xl items-center justify-center flex-row mb-1"
                          >
                            <Feather name="shopping-bag" size={13} color="#FF6000" />
                            <Text className="text-xs font-black text-[#FF6000] ml-1.5">
                              Add All {msg.recommendations.length} Items to Cart
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    <Text className="text-[10px] text-[#A8A29E] mt-1 px-1 font-medium">
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              );
            }))}

            {/* Typing Indicator */}
            {isTyping && (
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-[#FF6000] items-center justify-center mr-2">
                  <MaterialCommunityIcons name="chef-hat" size={18} color="#ffffff" />
                </View>
                <View
                  style={{ elevation: 1 }}
                  className="bg-white border border-[#EFE5D6] px-4 py-2.5 rounded-full flex-row items-center"
                >
                  <Text className="text-xs font-bold text-[#78716C] mr-2">Chef Kwame is cooking up ideas...</Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-[#FF6000] mr-1" />
                  <View className="w-1.5 h-1.5 rounded-full bg-[#FF6000] mr-1" />
                  <View className="w-1.5 h-1.5 rounded-full bg-[#FF6000]" />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Action Suggestion Chips */}
          <View className="py-2 px-4 bg-[#FAF4EB] border-t border-[#EFE5D6]">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt.label}
                  activeOpacity={0.75}
                  onPress={() => handleSendMessage(prompt.query)}
                  style={{ elevation: 1 }}
                  className="bg-white border border-[#EFE5D6] px-3.5 py-1.5 rounded-full mr-2"
                >
                  <Text className="text-xs font-bold text-[#1C1917]">
                    {prompt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Text Input Bar with Quick Voice Trigger */}
          <View className="px-4 py-2.5 bg-white border-t border-[#EFE5D6] flex-row items-center">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setMode("voice")}
              className="w-10 h-10 rounded-xl bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mr-2"
            >
              <Feather name="mic" size={18} color="#FF6000" />
            </TouchableOpacity>

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              placeholder="Ask for food, spicy, jollof, waakye, under GH₵ 80..."
              placeholderTextColor="#A8A29E"
              className="flex-1 bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#1C1917]"
              returnKeyType="send"
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleSendMessage()}
              className="w-10 h-10 rounded-xl bg-[#FF6000] items-center justify-center ml-2 border border-[#EA580C]"
            >
              <Feather name="send" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* FLOATING BOTTOM NAVIGATION */}
      <View className="absolute bottom-4 left-5 right-5 z-20">
        <View
          style={{ elevation: 6 }}
          className="bg-white border border-[#EFE5D6] rounded-full py-2.5 px-6 flex-row items-center justify-between"
        >
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
              style={{ elevation: 5 }}
              className="w-14 h-14 rounded-full bg-[#FF6000] items-center justify-center border-4 border-[#FAF4EB]"
            >
              <Feather name="shopping-bag" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Cart
            </Text>
          </View>

          {/* AI Bot (Active) */}
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="items-center px-2 py-1 relative"
          >
            <View className="relative">
              <MaterialCommunityIcons
                name="robot-excited-outline"
                size={22}
                color="#FF6000"
              />
              <View className="absolute -top-1 -right-2 bg-[#FF6000] px-1 rounded-full">
                <Text className="text-[7px] font-black text-white">AI</Text>
              </View>
            </View>
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
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
