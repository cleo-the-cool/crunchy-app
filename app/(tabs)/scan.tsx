import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../../utils/haptics";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences, buildConcernsPrompt } from "@/contexts/PreferencesContext";
import { CameraView, useCameraPermissions } from "../../utils/camera";
import type { ScanMode } from "@/services/gemini";
import { analyzeBarcodeScan, buildFocusPrompt } from "@/services/gemini";
import { lookupBarcode, buildGeminiPromptFromBarcode } from "@/lib/barcodeLookup";
import { getRecentScans, type ScanHistoryItem } from "@/lib/scanHistory";
import { Badge } from "@/components";

type ScanFocus = "all" | "body" | "environmental" | "quick";
const SCAN_FOCUS_OPTIONS: { key: ScanFocus; label: string }[] = [
  { key: "all", label: "All Concerns" },
  { key: "body", label: "Body Toxins" },
  { key: "environmental", label: "Environmental" },
  { key: "quick", label: "Quick Scan" },
];

type ExtendedScanMode = ScanMode;

const SCAN_MODES: { key: ExtendedScanMode; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { key: "item", label: "Item", icon: "camera-outline", description: "Take a photo of the product itself" },
  { key: "ingredients", label: "Ingredients", icon: "document-text-outline", description: "Scan the ingredients list" },
  { key: "label", label: "Label", icon: "pricetag-outline", description: "Scan the nutrition/claims label" },
];

export default function ScanScreen() {
  const router = useRouter();
  const { canScan, dailyScansUsed, dailyScanLimit, tier, recordScan } = useSubscription();
  const { user } = useAuth();
  const { concerns } = usePreferences();
  const [scanMode, setScanMode] = useState<ExtendedScanMode>("item");
  const [scanFocus, setScanFocus] = useState<ScanFocus>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [permission, requestPermission] = useCameraPermissions();

  // Barcode scanning state
  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false);
  const [barcodeProcessing, setBarcodeProcessing] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  useEffect(() => {
    loadRecentScans();
  }, []);

  async function loadRecentScans() {
    const scans = await getRecentScans(10);
    setRecentScans(scans);
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecentScans();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleStartScanning = async () => {
    if (!canScan) {
      router.push({ pathname: "/paywall", params: { reason: "scan_limit" } });
      return;
    }

    if (scanMode === "barcode") {
      // Request camera permission for barcode
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert("Camera Permission Needed", "Crunchy needs camera access to scan barcodes.");
          return;
        }
      }
      setIsBarcodeScanning(true);
      setScannedBarcode(null);
      return;
    }

    if (scanMode === "item") {
      router.push({ pathname: "/product-scan", params: { focus: scanFocus } });
    } else if (scanMode === "ingredients") {
      router.push({ pathname: "/label-scan", params: { focus: scanFocus } });
    } else {
      router.push({ pathname: "/label-scan", params: { mode: "label", focus: scanFocus } });
    }
  };

  const handleBarcodeScanned = async (result: { data: string; type: string }) => {
    if (barcodeProcessing || scannedBarcode === result.data) return;

    setScannedBarcode(result.data);
    setBarcodeProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Look up in Open Food Facts
      const offResult = await lookupBarcode(result.data);
      const prompt = buildGeminiPromptFromBarcode(result.data, offResult);
      const concernsPrompt = buildConcernsPrompt(concerns) + buildFocusPrompt(scanFocus);

      const analysis = await analyzeBarcodeScan(prompt, user?.id ?? null, concernsPrompt);
      recordScan();

      // Save to history
      const { addToHistory } = await import("@/lib/scanHistory");
      await addToHistory({
        productName: analysis.productName,
        brand: analysis.brand,
        category: analysis.category,
        rating: analysis.rating,
        crunchyScore: analysis.crunchyScore,
        barcode: result.data,
        scanMode: "barcode",
        ingredients: analysis.ingredients.map(i => ({ name: i.name, risk: i.risk })),
        concerns: analysis.concerns,
        summary: analysis.summary,
      });

      setIsBarcodeScanning(false);
      setBarcodeProcessing(false);
      setScannedBarcode(null);

      // Navigate to result with the analysis data in params
      router.push({
        pathname: "/scan-result",
        params: {
          barcodeData: JSON.stringify(analysis),
          source: "barcode",
        },
      });
    } catch (err) {
      setBarcodeProcessing(false);
      setScannedBarcode(null);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg === "SCANNER_RATE_LIMITED") {
        Alert.alert("Rate Limited", "Please wait a moment and try again.");
      } else {
        Alert.alert("Scan Error", "Could not analyze this product. Please try again.");
      }
    }
  };

  const getModeIcon = (mode: ExtendedScanMode): keyof typeof Ionicons.glyphMap => {
    switch (mode) {
      case "item": return "camera";
      case "ingredients": return "document-text";
      case "label": return "pricetag";
      case "barcode": return "barcode";
    }
  };

  const getModeTitle = (mode: ExtendedScanMode) => {
    switch (mode) {
      case "item": return "Scan Item";
      case "ingredients": return "Scan Ingredients";
      case "label": return "Scan Label";
      case "barcode": return "Scan Barcode";
    }
  };

  const getModeSubtitle = (mode: ExtendedScanMode) => {
    switch (mode) {
      case "item": return "Take a photo of any product to identify and rate it";
      case "ingredients": return "Take a photo of the ingredients list to analyze";
      case "label": return "Take a photo of the nutrition or claims label";
      case "barcode": return "Scan a barcode for instant ingredient lookup";
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "clean": return "#4CAF50";
      case "caution": return "#FFC107";
      case "avoid": return "#F44336";
      default: return "#999";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Barcode scanner view
  if (isBarcodeScanning) {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
          }}
          onBarcodeScanned={barcodeProcessing ? undefined : handleBarcodeScanned}
        />
        {/* Overlay */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
          {/* Top bar */}
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center justify-between px-5 pt-2">
              <TouchableOpacity
                onPress={() => {
                  setIsBarcodeScanning(false);
                  setBarcodeProcessing(false);
                  setScannedBarcode(null);
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View className="bg-black/50 rounded-full px-4 py-2">
                <Text className="text-white text-sm font-semibold">Scan Barcode</Text>
              </View>
              <View className="w-10" />
            </View>
          </SafeAreaView>

          {/* Center viewfinder */}
          <View className="flex-1 items-center justify-center">
            <View
              className="w-72 h-36 items-center justify-center"
              style={{ borderWidth: 2, borderColor: "rgba(255,255,255,0.6)", borderRadius: 16 }}
            >
              {!barcodeProcessing && (
                <Text className="text-white/80 text-sm mt-2">Align barcode within frame</Text>
              )}
            </View>
          </View>

          {/* Bottom processing indicator */}
          {barcodeProcessing && (
            <View className="absolute bottom-0 left-0 right-0 items-center pb-32">
              <View className="bg-white rounded-2xl px-6 py-4 mx-8 items-center" style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}>
                <ActivityIndicator size="small" color="#3D5A3E" />
                <Text className="text-dark font-semibold mt-2">Looking up product...</Text>
                <Text className="text-dark/50 text-xs mt-1">Checking Open Food Facts database</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-3xl font-bold text-dark" style={{ fontFamily: "System", fontWeight: "700", letterSpacing: 0.3 }}>Scanner</Text>
      </View>

      {/* Scan Mode Toggle */}
      <View className="flex-row mx-5 mb-3" style={{
        backgroundColor: 'rgba(255, 253, 248, 0.85)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        gap: 4,
      }}>
        {SCAN_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            onPress={() => {
              setScanMode(mode.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className="flex-1 flex-row items-center justify-center rounded-2xl"
            style={
              scanMode === mode.key
                ? { backgroundColor: "#3D5A3E", paddingVertical: 12 }
                : { backgroundColor: "transparent", paddingVertical: 12 }
            }
          >
            <Ionicons
              name={mode.icon}
              size={16}
              color={scanMode === mode.key ? "white" : "#2D2D2D"}
            />
            <Text
              className="ml-1 text-xs font-semibold"
              style={{ color: scanMode === mode.key ? "white" : "#2D2D2D" }}
              numberOfLines={1}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Concern Focus Chips */}
      <View style={{ height: 36, marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: "center" }}
          style={{ flexGrow: 0 }}
        >
          {SCAN_FOCUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => {
                setScanFocus(opt.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                {
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 9999,
                },
                scanFocus === opt.key
                  ? { backgroundColor: "#3D5A3E" }
                  : { backgroundColor: "white", borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" },
              ]}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: scanFocus === opt.key ? "white" : "#2D2D2D" }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scan Limit Indicator (free tier) */}
      {tier === "free" && (
        <View className="flex-row items-center justify-center mx-5 mb-3">
          <Ionicons name="information-circle-outline" size={14} color="#A8B89C" />
          <Text className="text-xs text-dark/40 ml-1">
            {dailyScansUsed}/{dailyScanLimit} daily scans used
          </Text>
          <TouchableOpacity onPress={() => router.push("/paywall")} hitSlop={8}>
            <Text className="text-xs text-forest font-semibold ml-2">Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5A3E" />
        }
      >
        {/* Start Scanning CTA with botanical background */}
        <View className="mx-5 mb-5">
          <ImageBackground
            source={require("@/assets/images/aesthetic/aloe-vera.jpg")}
            resizeMode="cover"
            imageStyle={{ borderRadius: 24 }}
          >
            <TouchableOpacity
              onPress={handleStartScanning}
              activeOpacity={0.85}
              className="rounded-3xl py-8 items-center"
              style={{ backgroundColor: "rgba(61,90,62,0.7)" }}
            >
              <View
                className="rounded-full w-20 h-20 items-center justify-center mb-3"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Ionicons name={getModeIcon(scanMode)} size={40} color="white" />
              </View>
              <Text className="text-white text-xl font-bold" style={{ fontFamily: "System", fontWeight: "700", letterSpacing: 0.3 }}>
                {getModeTitle(scanMode)}
              </Text>
              <Text className="text-white/70 text-sm mt-1 px-8 text-center">
                {getModeSubtitle(scanMode)}
              </Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        {/* Recent Scans */}
        <View className="px-5">
          <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: "System", fontWeight: "700", letterSpacing: 0.3 }}>
            Recent Scans
          </Text>
          {recentScans.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="camera-outline" size={40} color="#A8B89C" style={{ marginBottom: 12 }} />
              <Text className="text-base font-bold text-dark text-center">No scans yet</Text>
              <Text className="text-sm text-dark/50 text-center mt-2 px-4">
                Scan your first product to see it here!
              </Text>
            </View>
          ) : (
            recentScans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/scan-result",
                    params: {
                      barcodeData: JSON.stringify({
                        productName: scan.productName,
                        brand: scan.brand,
                        category: scan.category,
                        rating: scan.rating,
                        crunchyScore: scan.crunchyScore,
                        ingredients: (scan.ingredients || []).map(i => ({
                          name: i.name,
                          risk: i.risk,
                          explanation: "",
                        })),
                        concerns: scan.concerns || [],
                        cleanAlternatives: [],
                        summary: scan.summary || "",
                      }),
                      source: "history",
                    },
                  });
                }}
                activeOpacity={0.7}
                className="bg-white rounded-2xl mb-2.5 p-4 flex-row items-center"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.08)",
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: getRatingColor(scan.rating) + "15" }}
                >
                  <Ionicons
                    name={scan.rating === "clean" ? "checkmark-circle" : scan.rating === "caution" ? "alert-circle" : "warning"}
                    size={20}
                    color={getRatingColor(scan.rating)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-dark" numberOfLines={1}>
                    {scan.productName}
                  </Text>
                  <Text className="text-xs text-dark/40 mt-0.5">
                    {scan.brand} {"\u00B7"} {formatTimeAgo(scan.scannedAt)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold mr-2" style={{ color: getRatingColor(scan.rating) }}>
                    {scan.crunchyScore}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
