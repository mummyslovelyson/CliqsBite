import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRider } from "../../context/RiderContext";

export default function RiderSupportScreen() {
  const router = useRouter();
  const { supportTickets, reportDeliveryException } = useRider();

  // Create Ticket Modal State
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState("Restaurant Delay (> 20 mins)");
  const [ticketNotes, setTicketNotes] = useState("");

  const issueTypes = [
    "Restaurant Delay (> 20 mins)",
    "Restaurant Closed or Out of Food",
    "Customer Unavailable / Phone Off",
    "Wrong Delivery Address or Road Blocked",
    "Vehicle Breakdown / Flat Tyre",
    "Traffic Accident or Emergency",
    "Appeal Delivery Penalty / Dispute",
  ];

  const handleCreateTicketSubmit = () => {
    if (!ticketNotes.trim()) {
      Alert.alert("Missing Details", "Please provide a brief explanation of the incident.");
      return;
    }

    reportDeliveryException(selectedIssueType, ticketNotes.trim());
    setTicketModalVisible(false);
    setTicketNotes("");

    Alert.alert(
      "Ticket Dispatched! 📨",
      "Your incident has been logged with CliqsBite 24/7 Dispatch Control. A fleet supervisor has been notified."
    );
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Assistance 🚨",
      "Calling CliqsBite Rapid Response & Dispatch Control (+233 30 200 9988)...",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call Dispatch Now", style: "destructive", onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/rider")}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <Text className="text-xl font-black text-[#1C1917] tracking-tight">
          Safety &amp; Support
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setTicketModalVisible(true)}
          className="w-11 h-11 rounded-2xl bg-[#FF6000] items-center justify-center"
        >
          <Feather name="plus" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
      >
        {/* Emergency SOS Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleEmergencyCall}
          style={{ elevation: 2 }}
          className="bg-[#DC2626] rounded-[28px] p-5 mb-5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-3.5">
              <Feather name="phone-call" size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-white">
                Emergency Dispatch SOS
              </Text>
              <Text className="text-xs text-white/90 mt-0.5 font-medium leading-4">
                Tap for immediate emergency assistance, road accident or police coordination
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#ffffff" />
        </TouchableOpacity>

        {/* Quick Report Actions Grid */}
        <View className="mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-3 px-1">
            Common Delivery Incident Reports
          </Text>

          <View className="flex-row mb-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedIssueType("Customer Unavailable / Phone Off");
                setTicketModalVisible(true);
              }}
              className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-4 mr-2.5 items-center text-center"
            >
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mb-2">
                <Feather name="user-x" size={20} color="#FF6000" />
              </View>
              <Text className="text-xs font-black text-[#1C1917] text-center">Customer Unreachable</Text>
              <Text className="text-[10px] text-[#78716C] mt-1 text-center font-medium">Wait time &gt; 10 mins</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedIssueType("Restaurant Delay (> 20 mins)");
                setTicketModalVisible(true);
              }}
              className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-4 items-center text-center"
            >
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mb-2">
                <Feather name="clock" size={20} color="#FF6000" />
              </View>
              <Text className="text-xs font-black text-[#1C1917] text-center">Kitchen Delay</Text>
              <Text className="text-[10px] text-[#78716C] mt-1 text-center font-medium">Food not ready</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedIssueType("Wrong Delivery Address or Road Blocked");
                setTicketModalVisible(true);
              }}
              className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-4 mr-2.5 items-center text-center"
            >
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mb-2">
                <Feather name="map-pin" size={20} color="#FF6000" />
              </View>
              <Text className="text-xs font-black text-[#1C1917] text-center">Address Issue</Text>
              <Text className="text-[10px] text-[#78716C] mt-1 text-center font-medium">Wrong GPS pin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedIssueType("Vehicle Breakdown / Flat Tyre");
                setTicketModalVisible(true);
              }}
              className="flex-1 bg-white border border-[#EFE5D6] rounded-2xl p-4 items-center text-center"
            >
              <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mb-2">
                <MaterialCommunityIcons name="wrench-outline" size={20} color="#FF6000" />
              </View>
              <Text className="text-xs font-black text-[#1C1917] text-center">Breakdown / Flat</Text>
              <Text className="text-[10px] text-[#78716C] mt-1 text-center font-medium">Reassign delivery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filed Tickets List */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E]">
              Incident History ({supportTickets.length})
            </Text>

            <TouchableOpacity onPress={() => setTicketModalVisible(true)}>
              <Text className="text-xs font-bold text-[#FF6000]">+ Report New Issue</Text>
            </TouchableOpacity>
          </View>

          {supportTickets.length === 0 ? (
            <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-6 items-center justify-center">
              <View className="w-14 h-14 rounded-full bg-[#FAF4EB] items-center justify-center mb-2 border border-[#EFE5D6]">
                <Feather name="check-circle" size={24} color="#16A34A" />
              </View>
              <Text className="text-sm font-black text-[#1C1917]">
                No Incident Reports Logged
              </Text>
              <Text className="text-xs text-[#78716C] text-center max-w-[260px] mt-1 font-medium">
                Deliveries are operating smoothly. Any customer, kitchen or bike issues you file will appear here.
              </Text>
            </View>
          ) : (
            supportTickets.map((ticket) => (
              <View
                key={ticket.id}
                className="bg-white border border-[#EFE5D6] rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between pb-2 border-b border-[#F5EDE1] mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-xs font-black text-[#1C1917] mr-2">
                      {ticket.id}
                    </Text>
                    {ticket.orderId && (
                      <Text className="text-[10px] font-bold text-[#78716C]">
                        Order #{ticket.orderId}
                      </Text>
                    )}
                  </View>
                  <View className="bg-[#FFF3EB] px-2 py-0.5 rounded-full border border-[#FED7AA]">
                    <Text className="text-[10px] font-black text-[#FF6000]">
                      {ticket.status}
                    </Text>
                  </View>
                </View>

                <Text className="text-xs font-black text-[#1C1917] mb-0.5">
                  {ticket.issueType}
                </Text>
                <Text className="text-xs text-[#57534E] font-medium leading-4 mb-2">
                  {ticket.notes}
                </Text>

                <Text className="text-[10px] text-[#A8A29E] font-semibold">
                  Reported at {ticket.timestamp}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Road Safety & Fleet Standards */}
        <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-5">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shield-checkmark" size={18} color="#16A34A" />
            <Text className="text-sm font-black text-[#1C1917] ml-2">
              CliqsBite Fleet Safety Standards
            </Text>
          </View>

          <View className="flex-row items-start mb-2.5">
            <Feather name="check" size={14} color="#16A34A" className="mt-0.5 mr-2" />
            <Text className="text-xs text-[#57534E] flex-1 leading-5">
              <Text className="font-bold text-[#1C1917]">Full Helmet Requirement:</Text> Helmet chin-strap must be fastened before starting motorcycle ignition.
            </Text>
          </View>

          <View className="flex-row items-start mb-2.5">
            <Feather name="check" size={14} color="#16A34A" className="mt-0.5 mr-2" />
            <Text className="text-xs text-[#57534E] flex-1 leading-5">
              <Text className="font-bold text-[#1C1917]">Thermal Seal:</Text> Always place drinks upright in side compartments and keep hot chicken bags fully zipped.
            </Text>
          </View>

          <View className="flex-row items-start">
            <Feather name="check" size={14} color="#16A34A" className="mt-0.5 mr-2" />
            <Text className="text-xs text-[#57534E] flex-1 leading-5">
              <Text className="font-bold text-[#1C1917]">Phone Safety:</Text> Use the handlebar phone mount. Never text while the vehicle is in motion.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Ticket Modal */}
      <Modal visible={ticketModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6] max-h-[85%]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#1C1917]">
                Report Incident to Dispatch
              </Text>
              <TouchableOpacity onPress={() => setTicketModalVisible(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#78716C] mb-4 font-medium leading-5">
              Select the issue type and provide quick details for the operations supervisor.
            </Text>

            <ScrollView className="max-h-56 mb-4">
              {issueTypes.map((type) => {
                const isSelected = selectedIssueType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedIssueType(type)}
                    className={`p-3 rounded-2xl mb-2 border flex-row items-center justify-between ${
                      isSelected
                        ? "bg-[#FFF3EB] border-[#FF6000]"
                        : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-[#FF6000]" : "text-[#1C1917]"}`}>
                      {type}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color="#FF6000" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Incident Notes / Details
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-3 mb-5">
              <TextInput
                value={ticketNotes}
                onChangeText={setTicketNotes}
                placeholder="e.g. Kitchen says extra 15 mins for fried wings / Customer phone ringing with no answer..."
                placeholderTextColor="#A8A29E"
                multiline
                numberOfLines={3}
                className="text-xs font-bold text-[#1C1917] h-16"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCreateTicketSubmit}
              className="w-full bg-[#16A34A] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Send Report to Dispatch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTicketModalVisible(false)}
              className="w-full py-2 items-center justify-center"
            >
              <Text className="text-xs font-bold text-[#78716C]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Bottom Navigation */}
      <View className="absolute bottom-4 left-5 right-5">
        <View className="bg-white border border-[#EFE5D6] rounded-full py-2.5 px-6 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider")}
            className="items-center px-2 py-1"
          >
            <MaterialCommunityIcons name="moped" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/earnings")}
            className="items-center px-2 py-1"
          >
            <MaterialCommunityIcons name="cash-multiple" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              Earnings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/rider/history")}
            className="items-center px-2 py-1"
          >
            <Feather name="clock" size={20} color="#A8A29E" />
            <Text className="text-xs mt-0.5 font-bold text-[#A8A29E]">
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="items-center px-2 py-1"
          >
            <Feather name="shield" size={20} color="#FF6000" />
            <Text className="text-xs mt-0.5 font-bold text-[#FF6000]">
              Support
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
