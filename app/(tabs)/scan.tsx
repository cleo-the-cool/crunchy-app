import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useSubscription } from "@/contexts/SubscriptionContext";

type ScanMode = "barcode" | "label" | "product";

const SCAN_MODES: { key: ScanMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "barcode", label: "Barcode", icon: "barcode-outline" },
  { key: "label", label: "Label", icon: "document-text-outline" },
  { key: "product", label: "Product", icon: "camera-outline" },
];

const MOCK_RECENT_SCANS = [
  {
    id: "1",
    name: "Cetaphil Gentle Cleanser",
    brand: "Cetaphil",
    rating: "caution" as const,
    date: "Today",
    barcode: "3574661014647",
  },
  {
    id: "2",
    name: "Dr. Bronner's Soap",
    brand: "Dr. Bronner's",
    rating: "clean" as const,
    date: "Yesterday",
    barcode: "0018787764015",
  },
  {
    id: "3",
    name: "Tide Original Detergent",
    brand: "Tide",
    rating: "avoid" as const,
    date: "2 days ago",
    barcode: "0037000849629",
  },
];

export default function ScanScreen() {
  const router = useRouter();
  const { canScan, recordScan, dailyScansUsed, dailyScanLimit, tier } = useSubscription();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanMode, setScanMode] = useState<ScanMode>("barcode");
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    if (!canScan) {
      setScanned(true);
      router.push({ pathname: "/paywall", params: { reason: "scan_limit" } });
      setTimeout(() => setScanned(false), 1000);
      return;
    }

    setScanned(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    recordScan();

    // Navigate to result screen with barcode data
    router.push({
      pathname: "/scan-result",
      params: { barcode: result.data, type: result.type },
    });

    // Reset after a delay so user can scan again when they come back
    setTimeout(() => setScanned(false), 2000);
  };

  const handleStartScanning = async () => {
    if (!canScan) {
      router.push({ pathname: "/paywall", params: { reason: "scan_limit" } });
      return;
    }

    // Label mode opens a dedicated scanning screen
    if (scanMode === "label") {
      router.push("/label-scan");
      return;
    }

    // Product mode opens the AI product recognition screen
    if (scanMode === "product") {
      router.push("/product-scan");
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Needed",
          "Crunchy needs camera access to scan product barcodes and ingredients. Please enable camera access in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    setIsScanning(true);
    setScanned(false);
  };

  const handleRecentScanPress = (scan: (typeof MOCK_RECENT_SCANS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/scan-result",
      params: { barcode: scan.barcode },
    });
  };

  const getRatingColor = (rating: "clean" | "caution" | "avoid") => {
    switch (rating) {
      case "clean":
        return "#4CAF50";
      case "caution":
        return "#FFC107";
      case "avoid":
        return "#F44336";
    }
  };

  const getRatingBg = (rating: "clean" | "caution" | "avoid") => {
    switch (rating) {
      case "clean":
        return "bg-rating-clean/10";
      case "caution":
        return "bg-rating-caution/10";
      case "avoid":
        return "bg-rating-avoid/10";
    }
  };

  // Camera permission not yet determined
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-dark/60">Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              if (mode.key === "product" && tier !== "premium") {
                router.push({ pathname: "/paywall", params: { reason: "premium_feature" } });
                return;
              }
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
              className={`ml-1.5 text-sm font-semibold ${
                scanMode === mode.key ? "text-white" : "text-dark/40"
              }`}
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

      {isScanning && scanMode === "barcode" ? (
        /* Camera Viewfinder */
        <View className="flex-1">
          <View className="flex-1 mx-5 rounded-3xl overflow-hidden mb-3">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              enableTorch={flashOn}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                  "code39",
                ],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
              {/* Scan Overlay */}
              <View className="flex-1 items-center justify-center">
                {/* Corner brackets */}
                <View className="w-64 h-48 relative">
                  {/* Top-left */}
                  <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  {/* Top-right */}
                  <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  {/* Bottom-left */}
                  <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  {/* Bottom-right */}
                  <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg" />
                </View>
                <Text className="text-white text-sm mt-4 font-medium">
                  Point at a barcode to scan
                </Text>
              </View>

              {/* Camera Controls */}
              <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-6">
                {/* Flashlight */}
                <TouchableOpacity
                  onPress={() => {
                    setFlashOn(!flashOn);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    flashOn ? "bg-white" : "bg-white/30"
                  }`}
                >
                  <Ionicons
                    name={flashOn ? "flash" : "flash-outline"}
                    size={22}
                    color={flashOn ? "#8B9E7C" : "white"}
                  />
                </TouchableOpacity>

                {/* Close Camera */}
                <TouchableOpacity
                  onPress={() => {
                    setIsScanning(false);
                    setFlashOn(false);
                  }}
                  className="w-12 h-12 rounded-full bg-white/30 items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        </View>
      ) : (
        /* Non-scanning state */
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
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
                  name={
                    scanMode === "barcode"
                      ? "barcode"
                      : scanMode === "label"
                      ? "document-text"
                      : "camera"
                  }
                  size={40}
                  color="white"
                />
              </View>
              <Text className="text-white text-xl font-bold">
                {scanMode === "barcode"
                  ? "Scan Barcode"
                  : scanMode === "label"
                  ? "Scan Label"
                  : "Identify Product"}
              </Text>
              <Text className="text-white/70 text-sm mt-1">
                {scanMode === "barcode"
                  ? "Point your camera at a product barcode"
                  : scanMode === "label"
                  ? "Take a photo of the ingredient list"
                  : "Point at any product to identify it"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Scans */}
          <View className="px-5">
            <Text className="text-lg font-bold text-dark mb-3">
              Recent Scans
            </Text>
            {MOCK_RECENT_SCANS.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                onPress={() => handleRecentScanPress(scan)}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View
                  className={`${getRatingBg(scan.rating)} rounded-2xl w-12 h-12 items-center justify-center mr-3`}
                >
                  <Ionicons
                    name={
                      scan.rating === "clean"
                        ? "checkmark-circle"
                        : scan.rating === "caution"
                        ? "alert-circle"
                        : "warning"
                    }
                    size={22}
                    color={getRatingColor(scan.rating)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-dark">
                    {scan.name}
                  </Text>
                  <Text className="text-xs text-dark/50">
                    {scan.brand} · {scan.date}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
