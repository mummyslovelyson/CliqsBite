import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";

export default function SavedAddressesScreen() {
  const router = useRouter();
  const { savedAddresses, setSavedAddresses } = useCart();
  const addresses = savedAddresses;
  const setAddresses = setSavedAddresses;
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [label, setLabel] = useState("Home");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setLabel("Home");
    setStreetAddress("");
    setLandmark("");
    setDeliveryInstructions("");
    setGpsCoordinates(null);
    setIsDefault(addresses.length === 0);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setLabel(item.label);
    setStreetAddress(item.address);
    setLandmark(item.details || "");
    setDeliveryInstructions(item.deliveryInstructions || "");
    setGpsCoordinates(item.gpsCoordinates || null);
    setIsDefault(!!item.isDefault);
    setModalVisible(true);
  };

  const handleUseGps = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setGpsCoordinates({ latitude: 5.6037, longitude: -0.187 });
      if (!streetAddress) {
        setStreetAddress("Current GPS Location");
      }
      Alert.alert("GPS Detected 📍", "Fetched current GPS coordinates: 5.6037° N, 0.1870° W.");
    }, 600);
  };

  const handleSave = () => {
    if (!streetAddress.trim()) {
      Alert.alert("Missing Address", "Please enter a street address or delivery location.");
      return;
    }

    if (editingId) {
      setAddresses((prev) =>
        prev.map((item) => {
          if (item.id === editingId) {
            return {
              ...item,
              label,
              address: streetAddress.trim(),
              details: landmark.trim(),
              deliveryInstructions: deliveryInstructions.trim(),
              gpsCoordinates,
              isDefault: isDefault || item.isDefault,
            };
          }
          if (isDefault) {
            return { ...item, isDefault: false };
          }
          return item;
        })
      );
    } else {
      const newAddress = {
        id: `addr-${Date.now()}`,
        label,
        address: streetAddress.trim(),
        details: landmark.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
        gpsCoordinates,
        isDefault: isDefault || addresses.length === 0,
      };

      setAddresses((prev) => {
        if (newAddress.isDefault) {
          return [...prev.map((a) => ({ ...a, isDefault: false })), newAddress];
        }
        return [...prev, newAddress];
      });
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Address", "Are you sure you want to remove this delivery address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        },
      },
    ]);
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const getTagIcon = (tagLabel) => {
    switch (tagLabel.toLowerCase()) {
      case "home":
        return "home";
      case "work":
        return "briefcase";
      case "favorite":
        return "heart";
      case "campus":
        return "book-open";
      default:
        return "map-pin";
    }
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

        <View className="items-center">
          <Text className="text-xl font-black text-[#1C1917] tracking-tight">
            Delivery Addresses
          </Text>
          <Text className="text-xs font-semibold text-[#78716C] mt-0.5">
            {addresses.length} saved location{addresses.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOpenAdd}
          className="w-11 h-11 rounded-2xl bg-[#FF6000] items-center justify-center"
        >
          <Feather name="plus" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 50 }}
      >
        {addresses.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-white border border-[#EFE5D6] items-center justify-center mb-5">
              <Feather name="map-pin" size={34} color="#A8A29E" />
            </View>
            <Text className="text-xl font-black text-[#1C1917] mb-2">
              No saved addresses
            </Text>
            <Text className="text-sm text-[#78716C] text-center max-w-[280px] leading-6 mb-6 font-medium">
              Save your home, office, or favorite hangout spots to receive hot crispy meals faster.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenAdd}
              className="bg-[#FF6000] px-7 py-3 rounded-full flex-row items-center"
            >
              <Feather name="plus" size={17} color="#ffffff" />
              <Text className="text-sm font-black text-white ml-2">Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((item) => (
            <View
              key={item.id}
              className="bg-white border border-[#EFE5D6] rounded-[24px] p-5 mb-4"
            >
              <View className="flex-row items-start justify-between mb-3 border-b border-[#F5EDE1] pb-3">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-[#FFF3EB] border border-[#FED7AA] items-center justify-center mr-3">
                    <Feather name={getTagIcon(item.label)} size={18} color="#FF6000" />
                  </View>
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-base font-black text-[#1C1917] mr-2">
                        {item.label}
                      </Text>
                      {item.isDefault && (
                        <View className="bg-[#FFF3EB] px-2.5 py-0.5 rounded-full border border-[#FED7AA]">
                          <Text className="text-xs font-black text-[#FF6000]">DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    {item.gpsCoordinates ? (
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons name="my-location" size={13} color="#16A34A" />
                        <Text className="text-xs font-bold text-[#16A34A] ml-1">
                          GPS Coordinates Saved
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Edit & Delete actions */}
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(item)}
                    className="p-2 mr-1"
                  >
                    <Feather name="edit-2" size={17} color="#78716C" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="p-2"
                  >
                    <Feather name="trash-2" size={17} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Address string */}
              <Text className="text-sm font-bold text-[#1C1917] leading-5 mb-1.5">
                {item.address}
              </Text>
              {item.details ? (
                <Text className="text-sm text-[#78716C] mb-2 font-medium">
                  Landmark: {item.details}
                </Text>
              ) : null}

              {item.deliveryInstructions ? (
                <View className="bg-[#FAF4EB] rounded-xl p-3 border border-[#EFE5D6] mb-3">
                  <Text className="text-xs font-bold text-[#FF6000] mb-0.5">Rider Instructions:</Text>
                  <Text className="text-xs text-[#57534E] leading-5 font-medium">{item.deliveryInstructions}</Text>
                </View>
              ) : null}

              {!item.isDefault && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSetDefault(item.id)}
                  className="pt-2 border-t border-[#F5EDE1] flex-row items-center justify-between"
                >
                  <Text className="text-xs font-bold text-[#FF6000]">
                    Set as Default Delivery Address
                  </Text>
                  <Feather name="check" size={16} color="#FF6000" />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Address Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-[#EFE5D6] max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#1C1917]">
                {editingId ? "Edit Delivery Address" : "Add Delivery Address"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                className="p-1"
              >
                <Feather name="x" size={22} color="#78716C" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tag selector */}
              <Text className="text-sm font-bold text-[#78716C] mb-2">Location Tag</Text>
              <View className="flex-row mb-4">
                {["Home", "Work", "Favorite", "Campus"].map((tag) => {
                  const isSelected = label.toLowerCase() === tag.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => setLabel(tag)}
                      className={`px-4 py-2 rounded-full mr-2.5 border ${
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
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* GPS Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUseGps}
                className="bg-[#FFF3EB] border border-[#FED7AA] rounded-2xl p-3.5 mb-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="my-location" size={18} color="#FF6000" />
                  <Text className="text-sm font-bold text-[#FF6000] ml-2.5">
                    {isLocating ? "Detecting GPS..." : "Detect Current GPS Location"}
                  </Text>
                </View>
                {gpsCoordinates ? (
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                ) : (
                  <Feather name="arrow-right" size={16} color="#FF6000" />
                )}
              </TouchableOpacity>

              {/* Street Address */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-[#78716C] mb-1.5">
                  Street / Area Address *
                </Text>
                <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                  <TextInput
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                    placeholder="e.g. 14 Banana Street, East Legon"
                    placeholderTextColor="#A8A29E"
                    className="text-base font-bold text-[#1C1917]"
                  />
                </View>
              </View>

              {/* Landmark / Apartment */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-[#78716C] mb-1.5">
                  Landmark / House No. / Apartment (Optional)
                </Text>
                <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3">
                  <TextInput
                    value={landmark}
                    onChangeText={setLandmark}
                    placeholder="e.g. Near Shell filling station, Flat 3B"
                    placeholderTextColor="#A8A29E"
                    className="text-base font-medium text-[#1C1917]"
                  />
                </View>
              </View>

              {/* Delivery Instructions */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-[#78716C] mb-1.5">
                  Rider Delivery Instructions (Optional)
                </Text>
                <View className="bg-[#FAF4EB] border border-[#EFE5D6] rounded-xl px-4 py-3 min-h-[85px]">
                  <TextInput
                    value={deliveryInstructions}
                    onChangeText={setDeliveryInstructions}
                    placeholder="e.g. Call when outside the main gate, buzz code #1204"
                    placeholderTextColor="#A8A29E"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="text-base font-medium text-[#1C1917]"
                  />
                </View>
              </View>

              {/* Default Toggle */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsDefault(!isDefault)}
                className="flex-row items-center justify-between bg-[#FAF4EB] border border-[#EFE5D6] rounded-2xl p-4 mb-6"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-bold text-[#1C1917]">
                    Set as default delivery address
                  </Text>
                  <Text className="text-xs text-[#78716C] mt-0.5 font-medium">
                    New orders will automatically choose this location
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-md items-center justify-center border ${
                    isDefault
                      ? "bg-[#FF6000] border-[#FF6000]"
                      : "bg-white border-[#A8A29E]"
                  }`}
                >
                  {isDefault && <Feather name="check" size={14} color="#ffffff" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSave}
                className="w-full bg-[#FF6000] py-4 rounded-full items-center justify-center mb-4"
              >
                <Text className="text-sm font-black text-white">Save Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
