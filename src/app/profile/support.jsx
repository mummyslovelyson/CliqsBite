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
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HelpAndSupportScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("faq"); // 'faq', 'complaint', 'tickets'
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Complaint Form fields
  const [complaintCategory, setComplaintCategory] = useState("Missing Item");
  const [orderNumber, setOrderNumber] = useState("");
  const [complaintText, setComplaintText] = useState("");

  // All mock tickets cleared
  const [tickets, setTickets] = useState([]);

  const faqs = [
    {
      q: "How long does food delivery usually take?",
      a: "Most orders in Accra & surrounding areas arrive within 25 - 35 minutes. Our kitchen starts frying chicken and packaging immediately upon order confirmation.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support MTN MoMo, Telecel Cash, ATMoney, Visa/Mastercard, and Cash on Delivery.",
    },
    {
      q: "What should I do if my food arrives cold or incorrect?",
      a: "Use the 'Report Problem' tab below with your order number. Our instant resolution desk will dispatch a fresh replacement or issue an immediate wallet refund.",
    },
    {
      q: "Can I cancel or modify an order after placing it?",
      a: "You can modify or cancel within 3 minutes of ordering before the kitchen begins frying. Contact live support via WhatsApp for urgent changes.",
    },
    {
      q: "How do I earn and use CliqsPoints?",
      a: "You earn 1 CliqsPoint for every GH₵ 1 spent. Redeem points for free sodas, fries, and Cedis discount vouchers in the Payments & Rewards tab.",
    },
  ];

  const handleSubmitComplaint = () => {
    if (!complaintText.trim()) {
      Alert.alert("Missing Detail", "Please describe the problem you experienced.");
      return;
    }

    const newTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: `${complaintCategory} ${orderNumber ? `(#${orderNumber})` : ""}`,
      date: "Just now",
      status: "In Review",
      statusColor: "#FF6000",
      statusBg: "#FFF3EB",
      response: "Our customer resolution team has received your report and will update you shortly.",
    };

    setTickets((prev) => [newTicket, ...prev]);
    setComplaintText("");
    setOrderNumber("");
    setActiveTab("tickets");
    Alert.alert("Report Submitted", "Your ticket has been opened. Our support supervisor will contact you via SMS / phone.");
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
          Help &amp; Support
        </Text>

        <View className="w-11" />
      </View>

      {/* Quick Contact Hero Buttons */}
      <View className="px-5 pt-4 pb-2 flex-row">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => Alert.alert("WhatsApp Support", "Opening WhatsApp chat with CliqsBite Customer Help Desk (+233 24 000 1122)...")}
          className="flex-1 bg-[#16A34A] p-4 rounded-2xl mr-2.5 flex-row items-center justify-center"
        >
          <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
          <Text className="text-sm font-black text-white ml-2">WhatsApp Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => Alert.alert("Call Hotline", "Dialing CliqsBite toll-free dispatch line: 0800-CLIQS (0800 254 77)...")}
          className="flex-1 bg-[#1C1917] p-4 rounded-2xl flex-row items-center justify-center"
        >
          <Feather name="phone-call" size={18} color="#ffffff" />
          <Text className="text-sm font-black text-white ml-2">Call Hotline</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Sub-Tabs */}
      <View className="flex-row px-5 pt-3 pb-2">
        {[
          { id: "faq", label: "FAQs" },
          { id: "complaint", label: "Report Problem" },
          { id: "tickets", label: `My Tickets (${tickets.length})` },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full mr-2.5 border ${
                active ? "bg-[#FF6000] border-[#FF6000]" : "bg-white border-[#EFE5D6]"
              }`}
            >
              <Text className={`text-sm font-bold ${active ? "text-white" : "text-[#78716C]"}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 }}
      >
        {/* TAB 1: FAQ Accordion */}
        {activeTab === "faq" && (
          <View>
            <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3 px-1">
              Frequently Asked Questions
            </Text>

            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <View
                  key={idx}
                  className="bg-white border border-[#EFE5D6] rounded-[22px] mb-3 overflow-hidden"
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="p-4 flex-row items-center justify-between"
                  >
                    <Text className="text-base font-bold text-[#1C1917] flex-1 mr-3">
                      {faq.q}
                    </Text>
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#78716C"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="px-4 pb-4 pt-1 border-t border-[#F5EDE1]">
                      <Text className="text-sm text-[#57534E] leading-6 font-medium">
                        {faq.a}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: Report Problem & Submit Complaints */}
        {activeTab === "complaint" && (
          <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5">
            <Text className="text-base font-black text-[#1C1917] mb-1">
              Report an Issue with an Order
            </Text>
            <Text className="text-sm text-[#78716C] mb-4 font-medium">
              We take food quality seriously. If anything was amiss, let us know and we&apos;ll resolve it instantly.
            </Text>

            {/* Category selector */}
            <Text className="text-sm font-bold text-[#78716C] mb-2">Issue Category</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                "Missing Item",
                "Incorrect Meal",
                "Food Arrived Cold",
                "Delivery Delay",
                "Packaging Damage",
                "Billing Issue",
              ].map((cat) => {
                const isSelected = complaintCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setComplaintCategory(cat)}
                    className={`px-3.5 py-2 rounded-full mr-2 mb-2 border ${
                      isSelected
                        ? "bg-[#FF6000] border-[#FF6000]"
                        : "bg-[#FAF4EB] border-[#EFE5D6]"
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

            {/* Order Number (Optional) */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-[#78716C] mb-1.5">
                Order ID / Invoice # (Optional)
              </Text>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                <TextInput
                  value={orderNumber}
                  onChangeText={setOrderNumber}
                  placeholder="e.g. CB-9204"
                  placeholderTextColor="#A8A29E"
                  className="text-base font-bold text-[#1C1917]"
                />
              </View>
            </View>

            {/* Description textarea */}
            <View className="mb-5">
              <Text className="text-sm font-bold text-[#78716C] mb-1.5">
                Describe the Issue
              </Text>
              <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 min-h-[110px]">
                <TextInput
                  value={complaintText}
                  onChangeText={setComplaintText}
                  placeholder="Tell us what went wrong with your meal, sides, or delivery..."
                  placeholderTextColor="#A8A29E"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-base font-medium text-[#1C1917] leading-6"
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSubmitComplaint}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center flex-row"
            >
              <Feather name="send" size={16} color="#ffffff" />
              <Text className="text-sm font-black text-white ml-2">Submit Complaint Ticket</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: My Tickets Tracker */}
        {activeTab === "tickets" && (
          <View>
            <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3 px-1">
              Active Support &amp; Dispute Tickets
            </Text>

            {tickets.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 rounded-full bg-white border border-[#EFE5D6] items-center justify-center mb-4">
                  <Feather name="inbox" size={30} color="#A8A29E" />
                </View>
                <Text className="text-lg font-black text-[#1C1917] mb-1.5">
                  No Support Tickets
                </Text>
                <Text className="text-sm text-[#78716C] text-center max-w-[280px] leading-6 mb-5 font-medium">
                  You don&apos;t have any active inquiry or dispute tickets. If you need assistance with an order, submit a report above.
                </Text>
              </View>
            ) : (
              tickets.map((tkt) => (
                <View
                  key={tkt.id}
                  className="bg-white border border-[#EFE5D6] rounded-[24px] p-4 mb-3.5"
                >
                  <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-[#F5EDE1]">
                    <Text className="text-xs font-black text-[#A8A29E]">{tkt.id} • {tkt.date}</Text>
                    <View
                      style={{ backgroundColor: tkt.statusBg }}
                      className="px-2.5 py-0.5 rounded-full border border-[#FED7AA]"
                    >
                      <Text
                        style={{ color: tkt.statusColor }}
                        className="text-xs font-black uppercase"
                      >
                        {tkt.status}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-base font-bold text-[#1C1917] mb-2">
                    {tkt.subject}
                  </Text>

                  <View className="bg-[#FAF4EB] rounded-xl p-3 border border-[#EFE5D6]">
                    <Text className="text-xs font-bold text-[#FF6000] mb-0.5">CliqsBite Resolution Desk:</Text>
                    <Text className="text-sm text-[#57534E] leading-5 font-medium">{tkt.response}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
