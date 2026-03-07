import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../../utils/haptics";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { ScanMode } from "@/services/gemini";

const SCAN_MODES: { key: ScanMode; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { key: "item", label: "Item", icon: "camera-outline", description: "Take a photo of the product itself" },
  { key: "ingredients", label: "Ingredients", icon: "document-text-outline", description: "Take a photo of the ingredients list" },
  { key: "label", label: "Label", icon: "pricetag-outline", description: "Take a photo of the nutrition/claims label" },
];


export default function ScanScreen() {
  const router = useRouter();
  const { canScan, dailyScansUsed, dailyScanLimit, tier } = useSubscription();
  const [scanMode, setScanMode] = useState<ScanMode>("item");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleStartScanning = () => {
    if (!canScan) {
      router.push({ pathname: "/paywall", params: { reason: "scan_limit" } });
      return;
    }

    // All modes now go to dedicated scan screens with the mode param
    if (scanMode === "item") {
      router.push("/product-scan");
    } else if (scanMode === "ingredients") {
      router.push("/label-scan");
    } else {
      router.push({ pathname: "/label-scan", params: { mode: "label" } });
    }
  };

  const getModeIcon = (mode: ScanMode): keyof typeof Ionicons.glyphMap => {
    switch (mode) {
      case "item":
        return "camera";
      case "ingredients":
        return "document-text";
      case "label":
        return "pricetag";
    }
  };

  const getModeTitle = (mode: ScanMode) => {
    switch (mode) {
      case "item":
        return "Scan Item";
      case "ingredients":
        return "Scan Ingredients";
      case "label":
        return "Scan Label";
    }
  };

  const getModeSubtitle = (mode: ScanMode) => {
    switch (mode) {
      case "item":
        return "Take a photo of any product to identify and rate it";
      case "ingredients":
        return "Take a photo of the ingredients list to analyze";
      case "label":
        return "Take a photo of the nutrition or claims label";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-2xl font-bold text-dark">Scanner</Text>
      </View>

      {/* Scan Mode Toggle */}
      <View className="flex-row mx-5 mb-3 bg-white rounded-2xl p-1" style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}>
        {SCAN_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            onPress={() => {
              setScanMode(mode.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
              scanMode === mode.key ? "bg-sage" : ""
            }`}
          >
            <Ionicons
              name={mode.icon}
              size={16}
              color={scanMode === mode.key ? "white" : "#999"}
            />
            <Text
              className={`ml-1 text-xs font-semibold ${
                scanMode === mode.key ? "text-white" : "text-dark/40"
              }`}
              numberOfLines={1}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scan Limit Indicator (free tier) */}
      {tier === "free" && (
        <View className="flex-row items-center justify-center mx-5 mb-3">
          <Ionicons name="information-circle-outline" size={14} color="#999" />
          <Text className="text-xs text-dark/40 ml-1">
            {dailyScansUsed}/{dailyScanLimit} daily scans used
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/paywall")}
            hitSlop={8}
          >
            <Text className="text-xs text-sage font-semibold ml-2">
              Upgrade
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B9E7C"
          />
        }
      >
        {/* Start Scanning CTA */}
        <View className="mx-5 mb-5">
          <TouchableOpacity
            onPress={handleStartScanning}
            activeOpacity={0.85}
            className="bg-sage rounded-3xl py-8 items-center"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="bg-white/20 rounded-full w-20 h-20 items-center justify-center mb-3">
              <Ionicons
                name={getModeIcon(scanMode)}
                size={40}
                color="white"
              />
            </View>
            <Text className="text-white text-xl font-bold">
              {getModeTitle(scanMode)}
            </Text>
            <Text className="text-white/70 text-sm mt-1 px-8 text-center">
              {getModeSubtitle(scanMode)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scans */}
        <View className="px-5">
          <Text className="text-lg font-bold text-dark mb-3">
            Recent Scans
          </Text>
          <View className="items-center py-8">
            <Text className="text-4xl mb-3">📷</Text>
            <Text className="text-base font-bold text-dark text-center">
              No scans yet
            </Text>
            <Text className="text-sm text-dark/50 text-center mt-2 px-4">
              Scan your first product to see it here!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
