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
import { useRider, ACCRA_DELIVERY_ZONES } from "../../../context/RiderContext";

export default function RiderRegisterScreen() {
  const router = useRouter();
  const { applicationDraft, setApplicationDraft, submitRiderApplication } = useRider();

  // Multi-step progress (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState(applicationDraft?.name || "");
  const [phone, setPhone] = useState(applicationDraft?.phone || "");
  const [email, setEmail] = useState(applicationDraft?.email || "");
  const [password, setPassword] = useState(applicationDraft?.password || "");
  const [confirmPassword, setConfirmPassword] = useState(applicationDraft?.password || "");
  const [dob, setDob] = useState(applicationDraft?.dob || "1998-05-20");
  const [residentialAddress, setResidentialAddress] = useState(applicationDraft?.residentialAddress || "");
  const [operatingZone, setOperatingZone] = useState(applicationDraft?.operatingZone || ACCRA_DELIVERY_ZONES[0]);

  // Step 2: Identification & Driver's License
  const [ghanaCard, setGhanaCard] = useState(applicationDraft?.ghanaCard || "");
  const [licenseNumber, setLicenseNumber] = useState(applicationDraft?.licenseNumber || "");
  const [idCardAttached, setIdCardAttached] = useState(!!applicationDraft?.idCardAttached);
  const [licenseAttached, setLicenseAttached] = useState(!!applicationDraft?.licenseAttached);

  // Step 3: Vehicle Information
  const [vehicleType, setVehicleType] = useState(applicationDraft?.vehicleType || "Motorcycle");
  const [vehicleModel, setVehicleModel] = useState(applicationDraft?.vehicleModel || "");
  const [plateNumber, setPlateNumber] = useState(applicationDraft?.plateNumber || "");

  // Step 4: Emergency Contact & MoMo Payout Details
  const [emergencyName, setEmergencyName] = useState(applicationDraft?.emergencyContactName || "");
  const [emergencyPhone, setEmergencyPhone] = useState(applicationDraft?.emergencyContactPhone || "");
  const [payoutMethod, setPayoutMethod] = useState(applicationDraft?.payoutMethod || "MTN Mobile Money");
  const [payoutAccount, setPayoutAccount] = useState(applicationDraft?.payoutAccount || "");

  // Step 5: Policies & Agreements
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedSafety, setAgreedSafety] = useState(false);

  // Save incomplete application as draft
  const handleSaveDraft = () => {
    const draft = {
      name: fullName,
      phone,
      email,
      password,
      dob,
      residentialAddress,
      operatingZone,
      ghanaCard,
      licenseNumber,
      idCardAttached,
      licenseAttached,
      vehicleType,
      vehicleModel,
      plateNumber,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      payoutMethod,
      payoutAccount,
    };
    setApplicationDraft(draft);
    Alert.alert(
      "Application Saved as Draft 💾",
      "Your progress has been saved. You can return anytime to complete and submit for admin review."
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
        Alert.alert("Missing Fields", "Please fill in all personal details.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Password Mismatch", "Passwords do not match.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!ghanaCard.trim()) {
        Alert.alert("Missing ID", "Please enter your Ghana Card (NIA) number.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!vehicleModel.trim() || !plateNumber.trim()) {
        Alert.alert("Missing Vehicle Info", "Please enter your vehicle make/model and license plate.");
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!emergencyPhone.trim() || !payoutAccount.trim()) {
        Alert.alert("Missing Contact / Payout", "Please provide emergency contact and payout wallet number.");
        return;
      }
      setCurrentStep(5);
    }
  };

  const handleFinalSubmit = () => {
    if (!agreedTerms || !agreedSafety) {
      Alert.alert("Required Agreements", "Please accept both the Rider Agreement and Road Safety Policies.");
      return;
    }

    const applicationData = {
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      dob,
      residentialAddress: residentialAddress.trim(),
      operatingZone,
      ghanaCard: ghanaCard.trim(),
      licenseNumber: licenseNumber.trim(),
      vehicleType,
      vehicleModel: vehicleModel.trim(),
      plateNumber: plateNumber.trim(),
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyPhone.trim(),
      payoutMethod,
      payoutAccount: payoutAccount.trim(),
    };

    submitRiderApplication(applicationData);

    Alert.alert(
      "Application Submitted! 📋",
      "Your rider registration has been submitted for administrator review. You will receive an SMS and email notification once approved.",
      [
        {
          text: "View Verification Status",
          onPress: () => router.replace("/rider/auth/status"),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF4EB]" edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4EB" />

      {/* Header */}
      <View className="bg-[#FAF4EB] z-20 px-5 pt-2 pb-3 border-b border-[#EFE5D6] flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (currentStep > 1) setCurrentStep((prev) => prev - 1);
            else router.back();
          }}
          className="w-11 h-11 rounded-2xl bg-white border border-[#EFE5D6] items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1C1917" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-xl font-black text-[#1C1917] tracking-tight">
            Become a Rider
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
            Step {currentStep} of 5
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSaveDraft}
          className="px-3 py-2 rounded-xl bg-white border border-[#EFE5D6]"
        >
          <Text className="text-xs font-bold text-[#FF6000]">Save Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Step Indicator Bar */}
      <View className="flex-row px-5 py-3 bg-[#FAF4EB]">
        {[1, 2, 3, 4, 5].map((step) => (
          <View
            key={step}
            className={`flex-1 h-1.5 rounded-full mx-1 ${
              step <= currentStep ? "bg-[#FF6000]" : "bg-[#EFE5D6]"
            }`}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
            <Text className="text-lg font-black text-[#1C1917] mb-1">
              Personal Information 👤
            </Text>
            <Text className="text-xs text-[#78716C] mb-4">
              Enter your legal name matching your government-issued ID card.
            </Text>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Full Legal Name
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Kwame Mensah Asante"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Phone Number (WhatsApp Active)
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 024 123 4567"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Email Address
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="kwame@example.com"
                placeholderTextColor="#A8A29E"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Password
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create password"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Confirm Password
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Date of Birth (YYYY-MM-DD)
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={dob}
                onChangeText={setDob}
                placeholder="1998-05-20"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Residential Address (Accra)
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={residentialAddress}
                onChangeText={setResidentialAddress}
                placeholder="e.g. Hse 42, Lagos Avenue, East Legon"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Preferred Delivery Zone
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
              {ACCRA_DELIVERY_ZONES.map((zone) => {
                const isSelected = operatingZone === zone;
                return (
                  <TouchableOpacity
                    key={zone}
                    onPress={() => setOperatingZone(zone)}
                    className={`mr-2 px-3 py-2 rounded-xl border ${
                      isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-[#FF6000]" : "text-[#78716C]"}`}>
                      {zone}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNextStep}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center mt-2"
            >
              <Text className="text-sm font-black text-white">Continue to Identification &rarr;</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Identification & Driver's License */}
        {currentStep === 2 && (
          <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
            <Text className="text-lg font-black text-[#1C1917] mb-1">
              Government Identification 🪪
            </Text>
            <Text className="text-xs text-[#78716C] mb-4">
              Required by Ghana Police &amp; CliqsBite delivery compliance.
            </Text>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Ghana Card PIN Number
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={ghanaCard}
                onChangeText={setGhanaCard}
                placeholder="e.g. GHA-718293041-9"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIdCardAttached(!idCardAttached);
                Alert.alert("Document Attached", idCardAttached ? "Document removed" : "Ghana Card photo attached.");
              }}
              className={`p-4 rounded-2xl border mb-4 flex-row items-center justify-between ${
                idCardAttached ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FAF4EB] border-[#EFE5D6]"
              }`}
            >
              <View className="flex-row items-center">
                <Feather name="file-text" size={18} color={idCardAttached ? "#16A34A" : "#78716C"} />
                <Text className={`text-xs font-bold ml-2.5 ${idCardAttached ? "text-[#16A34A]" : "text-[#1C1917]"}`}>
                  {idCardAttached ? "Ghana Card Photo Attached ✓" : "Upload Front of Ghana Card"}
                </Text>
              </View>
              <Feather name={idCardAttached ? "check" : "upload"} size={16} color={idCardAttached ? "#16A34A" : "#78716C"} />
            </TouchableOpacity>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              DVLA Driving License Number
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="e.g. DL-GH-890214"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setLicenseAttached(!licenseAttached);
                Alert.alert("Document Attached", licenseAttached ? "Document removed" : "Driver's license photo attached.");
              }}
              className={`p-4 rounded-2xl border mb-5 flex-row items-center justify-between ${
                licenseAttached ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FAF4EB] border-[#EFE5D6]"
              }`}
            >
              <View className="flex-row items-center">
                <Feather name="credit-card" size={18} color={licenseAttached ? "#16A34A" : "#78716C"} />
                <Text className={`text-xs font-bold ml-2.5 ${licenseAttached ? "text-[#16A34A]" : "text-[#1C1917]"}`}>
                  {licenseAttached ? "Driver's License Photo Attached ✓" : "Upload Driving License Card"}
                </Text>
              </View>
              <Feather name={licenseAttached ? "check" : "upload"} size={16} color={licenseAttached ? "#16A34A" : "#78716C"} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNextStep}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-white">Continue to Vehicle Details &rarr;</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Vehicle Information */}
        {currentStep === 3 && (
          <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
            <Text className="text-lg font-black text-[#1C1917] mb-1">
              Vehicle &amp; Gear 🏍️
            </Text>
            <Text className="text-xs text-[#78716C] mb-4">
              Select what vehicle you will use to deliver hot food packages.
            </Text>

            <Text className="text-xs font-black text-[#1C1917] mb-2 uppercase tracking-wider">
              Vehicle Type
            </Text>
            <View className="flex-row mb-4">
              {["Motorcycle", "Scooter", "Bicycle", "Car"].map((type) => {
                const isSelected = vehicleType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setVehicleType(type)}
                    className={`flex-1 py-2.5 rounded-xl border items-center mr-2 last:mr-0 ${
                      isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-[#FF6000]" : "text-[#78716C]"}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Make &amp; Model
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={vehicleModel}
                onChangeText={setVehicleModel}
                placeholder="e.g. Honda Ace 125 / Royal 125"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              License Plate Number
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-5">
              <TextInput
                value={plateNumber}
                onChangeText={setPlateNumber}
                placeholder="e.g. GW-8821-24"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNextStep}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-white">Continue to Payout &amp; Contact &rarr;</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: Emergency Contact & MoMo Details */}
        {currentStep === 4 && (
          <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
            <Text className="text-lg font-black text-[#1C1917] mb-1">
              Emergency Contact &amp; Payout 💰
            </Text>
            <Text className="text-xs text-[#78716C] mb-4">
              Payouts are sent directly to your registered Ghanaian Mobile Money wallet.
            </Text>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Emergency Contact Name &amp; Relation
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-3">
              <TextInput
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="e.g. Akosua Mensah (Sister)"
                placeholderTextColor="#A8A29E"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Emergency Contact Phone
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-4">
              <TextInput
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="e.g. 020 888 9900"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-2 uppercase tracking-wider">
              Mobile Money Network
            </Text>
            <View className="flex-row mb-3">
              {["MTN Mobile Money", "Telecel Cash", "AT Money"].map((m) => {
                const isSelected = payoutMethod === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setPayoutMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl border items-center mr-2 last:mr-0 ${
                      isSelected ? "bg-[#FFF3EB] border-[#FF6000]" : "bg-[#FAF4EB] border-[#EFE5D6]"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-[#FF6000]" : "text-[#78716C]"}`}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs font-black text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Payout Wallet Phone Number
            </Text>
            <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl px-4 py-2.5 mb-5">
              <TextInput
                value={payoutAccount}
                onChangeText={setPayoutAccount}
                placeholder="e.g. 024 111 2233"
                placeholderTextColor="#A8A29E"
                keyboardType="phone-pad"
                className="text-sm font-bold text-[#1C1917]"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleNextStep}
              className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-sm font-black text-white">Review Policies &amp; Agreements &rarr;</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: Agreements & Final Submission */}
        {currentStep === 5 && (
          <View className="bg-white border border-[#EFE5D6] rounded-[28px] p-6 mb-5">
            <Text className="text-lg font-black text-[#1C1917] mb-1">
              Agreements &amp; Admin Verification ✍️
            </Text>
            <Text className="text-xs text-[#78716C] mb-4">
              Review and accept CliqsBite delivery partner agreements before submitting for administrator approval.
            </Text>

            {/* Crucial Notice */}
            <View className="bg-[#FFF8F3] border border-[#FED7AA] rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="information-circle" size={18} color="#FF6000" />
                <Text className="text-xs font-black text-[#FF6000] ml-1.5 uppercase">
                  Important Notice
                </Text>
              </View>
              <Text className="text-xs text-[#78716C] leading-5 font-medium">
                Signing up does not automatically authorize you to deliver orders. Riders must complete verification and be approved by an administrator before they can go online or accept delivery requests.
              </Text>
            </View>

            {/* Checkbox 1 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreedTerms(!agreedTerms)}
              className="flex-row items-start mb-3.5"
            >
              <View
                className={`w-5 h-5 rounded border items-center justify-center mr-3 mt-0.5 ${
                  agreedTerms ? "bg-[#16A34A] border-[#16A34A]" : "bg-white border-[#A8A29E]"
                }`}
              >
                {agreedTerms && <Feather name="check" size={13} color="#ffffff" />}
              </View>
              <Text className="text-xs text-[#57534E] flex-1 leading-5">
                I accept the <Text className="font-bold text-[#1C1917]">CliqsBite Rider Partner Agreement</Text>, code of conduct, and zero-tolerance policy against food package tampering.
              </Text>
            </TouchableOpacity>

            {/* Checkbox 2 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreedSafety(!agreedSafety)}
              className="flex-row items-start mb-5"
            >
              <View
                className={`w-5 h-5 rounded border items-center justify-center mr-3 mt-0.5 ${
                  agreedSafety ? "bg-[#16A34A] border-[#16A34A]" : "bg-white border-[#A8A29E]"
                }`}
              >
                {agreedSafety && <Feather name="check" size={13} color="#ffffff" />}
              </View>
              <Text className="text-xs text-[#57534E] flex-1 leading-5">
                I pledge to obey Ghana road traffic laws, wear a safety helmet at all times, and use an insulated thermal delivery bag.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleFinalSubmit}
              className="w-full bg-[#16A34A] py-4 rounded-full items-center justify-center mb-2"
            >
              <Text className="text-sm font-black text-white">Submit Application for Admin Approval</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveDraft}
              className="w-full py-2.5 items-center justify-center"
            >
              <Text className="text-xs font-bold text-[#78716C]">Save Draft and Finish Later</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
