import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  // Notification toggles
  const [orderPush, setOrderPush] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [promoOffers, setPromoOffers] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  // Security toggles
  const [biometrics, setBiometrics] = useState(true);
  const [locationPerm, setLocationPerm] = useState(true);

  // Preferences
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [theme, setTheme] = useState("System Default");
  const [languageModal, setLanguageModal] = useState(false);
  const [sessionsModal, setSessionsModal] = useState(false);

  // Real single active session, no mock devices
  const [activeSessions, setActiveSessions] = useState([
    { id: "s1", device: "Current Device", location: "Active Session", time: "Active now", isCurrent: true },
  ]);

  const handleTerminateOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    Alert.alert("Sessions Terminated", "All other devices have been logged out.");
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
          Security &amp; Settings
        </Text>

        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* 1. Notifications Section */}
        <View className="mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2 px-1">
            Notification Preferences
          </Text>

          <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4">
            {/* Push Notifications */}
            <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-[#1C1917]">
                  Order Status Push Alerts
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Real-time status when food is frying, dispatched &amp; arriving
                </Text>
              </View>
              <Switch
                value={orderPush}
                onValueChange={setOrderPush}
                trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Email Notifications */}
            <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-[#1C1917]">
                  Email Receipts &amp; Invoices
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Receive detailed PDF receipts for business &amp; personal tracking
                </Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* SMS Notifications */}
            <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-[#1C1917]">
                  SMS Delivery Alerts
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Rider phone call warnings and dispatch arrival SMS
                </Text>
              </View>
              <Switch
                value={smsReceipts}
                onValueChange={setSmsReceipts}
                trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Payment & Refund Alerts */}
            <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-[#1C1917]">
                  Payment &amp; Refund Confirmations
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Instant SMS/Push when MoMo or card charges/refunds complete
                </Text>
              </View>
              <Switch
                value={paymentAlerts}
                onValueChange={setPaymentAlerts}
                trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Promotional Offers */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-[#1C1917]">
                  Promotional Offers &amp; Combos
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Weekend chicken discounts and flash promo vouchers
                </Text>
              </View>
              <Switch
                value={promoOffers}
                onValueChange={setPromoOffers}
                trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* 2. Security & Login Sessions */}
        <View className="mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2 px-1">
            Security &amp; Permissions
          </Text>

          <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4">
            {/* Change Password */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/profile/edit-profile")}
              className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="lock" size={18} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Change Password
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">Update account login password</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            {/* Manage Logged-in Devices */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSessionsModal(true)}
              className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="smartphone" size={18} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Manage Logged-in Devices
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                    {activeSessions.length} active device session{activeSessions.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            {/* Biometric Lock */}
            <View className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-[#1C1917]">
                  Biometric App Lock
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Require Face ID / Fingerprint to open CliqsBite
                </Text>
              </View>
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Location Permissions */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 mr-3">
                <Text className="text-base font-bold text-[#1C1917]">
                  Precise GPS Location
                </Text>
                <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                  Enable high accuracy for rider dispatch &amp; delivery speed
                </Text>
              </View>
              <Switch
                value={locationPerm}
                onValueChange={setLocationPerm}
                trackColor={{ false: "#EFE5D6", true: "#FF6000" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* 3. App Language & Theme */}
        <View className="mb-5">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2 px-1">
            Regional &amp; Display
          </Text>

          <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setLanguageModal(true)}
              className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="globe" size={18} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    App Language
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">{selectedLanguage}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const nextTheme = theme === "Warm Light" ? "System Default" : "Warm Light";
                setTheme(nextTheme);
                Alert.alert("Theme Selected", `CliqsBite appearance set to ${nextTheme}.`);
              }}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] items-center justify-center mr-3">
                  <Feather name="moon" size={18} color="#FF6000" />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1C1917]">
                    Appearance &amp; Theme
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">{theme}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#A8A29E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Privacy & Legal */}
        <View className="mb-6">
          <Text className="text-sm font-black uppercase tracking-wider text-[#A8A29E] mb-2 px-1">
            Legal &amp; Policies
          </Text>

          <View className="bg-white border border-[#EFE5D6] rounded-[24px] p-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Privacy Policy", "CliqsBite uses your location and phone number exclusively for kitchen fulfillment and rider deliveries. We never sell your personal data.")}
              className="flex-row items-center justify-between py-3 border-b border-[#F5EDE1]"
            >
              <Text className="text-base font-bold text-[#1C1917]">
                Review Privacy Policy
              </Text>
              <Feather name="external-link" size={16} color="#A8A29E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Terms of Service", "By using CliqsBite, you agree to our fast-food order fulfillment guidelines and Ghana Data Protection standards.")}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-base font-bold text-[#1C1917]">
                Terms of Service
              </Text>
              <Feather name="external-link" size={16} color="#A8A29E" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal visible={languageModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">
                Choose Language
              </Text>
              <TouchableOpacity onPress={() => setLanguageModal(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            {["English", "Twi (Akan)", "Ga", "Ewe", "French"].map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setLanguageModal(false);
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-2xl mb-2.5 border ${
                    isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                  }`}
                >
                  <Text className={`text-base font-bold ${isSelected ? "text-[#FF6000]" : "text-[#1C1917]"}`}>
                    {lang}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#FF6000" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Sessions Management Modal */}
      <Modal visible={sessionsModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">
                Active Sessions
              </Text>
              <TouchableOpacity onPress={() => setSessionsModal(false)} className="p-1">
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-[#78716C] mb-4 font-medium">
              Devices currently signed in with your CliqsBite credentials.
            </Text>

            {activeSessions.map((s) => (
              <View
                key={s.id}
                className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-white border border-[#EFE5D6] items-center justify-center mr-3">
                    <Feather name="smartphone" size={18} color="#FF6000" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-[#1C1917]">
                      {s.device} {s.isCurrent ? "(This Device)" : ""}
                    </Text>
                    <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                      {s.location} • {s.time}
                    </Text>
                  </View>
                </View>

                {s.isCurrent && (
                  <View className="bg-[#DCFCE7] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
                    <Text className="text-xs font-bold text-[#16A34A]">ACTIVE</Text>
                  </View>
                )}
              </View>
            ))}

            {activeSessions.length > 1 && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleTerminateOtherSessions}
                className="w-full bg-[#DC2626] py-4 rounded-full items-center justify-center mt-2"
              >
                <Text className="text-sm font-black text-white">Log Out Other Devices</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
