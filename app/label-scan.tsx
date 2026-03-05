import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "../utils/camera";
import * as Haptics from "../utils/haptics";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PRODUCTS } from "@/data/products";

type LabelScanState = "camera" | "processing" | "error";

// Mock OCR: randomly pick a product with multiple ingredients to simulate label reading
const MOCK_OCR_PRODUCTS = PRODUCTS.filter((p) => p.ingredients.length >= 4);

function getRandomOCRProduct() {
  const idx = Math.floor(Math.random() * MOCK_OCR_PRODUCTS.length);
  return MOCK_OCR_PRODUCTS[idx];
}

const SCAN_TIPS = [
  "Hold the camera steady over the ingredient list",
  "Make sure the text is in focus and well-lit",
  "Include the full ingredient list in the frame",
  "Avoid shadows and glare on the label",
];

export default function LabelScanScreen() {
  const router = useRouter();
  const { canScan, recordScan } = useSubscription();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<LabelScanState>("camera");
  const [flashOn, setFlashOn] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!canScan) {
      router.push({ pathname: "/paywall", params: { reason: "scan_limit" } });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setState("processing");

    // Simulate OCR processing delay
    setTimeout(() => {
      // 85% chance of success, 15% chance of "failure" for realistic UX
      const success = Math.random() > 0.15;

      if (success) {
        const product = getRandomOCRProduct();
        recordScan();
        router.replace({
          pathname: "/scan-result",
          params: { barcode: product.barcode, type: "label-ocr" },
        });
      } else {
        setState("error");
      }
    }, 2500);
  };

  const handleRetry = () => {
    setState("camera");
  };

  const handleClose = () => {
    router.back();
  };

  // Request permission if needed
  const ensurePermission = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Needed",
          "Crunchy needs camera access to scan ingredient labels. Please enable camera access in your device settings.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return false;
      }
    }
    return true;
  };

  // Loading permission state
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B9E7C" />
        </View>
      </SafeAreaView>
    );
  }

  // Processing state
  if (state === "processing") {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="bg-white rounded-3xl p-8 items-center w-full"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="bg-sage/10 rounded-full w-20 h-20 items-center justify-center mb-5">
              <Ionicons name="document-text" size={36} color="#8B9E7C" />
            </View>
            <Text className="text-xl font-bold text-dark mb-2">
              Reading Ingredients...
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-6">
              Analyzing the label for toxins and harmful ingredients
            </Text>
            <ActivityIndicator size="large" color="#8B9E7C" />
            <View className="flex-row items-center mt-6 bg-sage/5 rounded-xl px-4 py-3">
              <Ionicons name="sparkles" size={16} color="#8B9E7C" />
              <Text className="text-xs text-dark/40 ml-2">
                Powered by Crunchy AI
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="bg-white rounded-3xl p-8 items-center w-full"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="bg-peach/10 rounded-full w-20 h-20 items-center justify-center mb-5">
              <Ionicons name="alert-circle" size={36} color="#F4A574" />
            </View>
            <Text className="text-xl font-bold text-dark mb-2">
              {"Couldn't Read Label"}
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-6 leading-5">
              {"The ingredient list wasn't clear enough. Try again with better"}
              lighting and make sure the text is in focus.
            </Text>
            <TouchableOpacity
              onPress={handleRetry}
              activeOpacity={0.85}
              className="bg-sage rounded-2xl py-3.5 px-8 mb-3 w-full items-center"
            >
              <Text className="text-white font-semibold text-base">
                Try Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} className="py-2">
              <Text className="text-dark/40 text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Camera state
  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-3 bg-dark">
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="close" size={22} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Scan Label</Text>
        <TouchableOpacity
          onPress={() => setShowTips(!showTips)}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="help-circle-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tips overlay */}
      {showTips && (
        <View className="absolute top-24 left-5 right-5 z-50">
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb-outline" size={18} color="#F4A574" />
              <Text className="text-base font-bold text-dark ml-2">
                Tips for Best Results
              </Text>
            </View>
            {SCAN_TIPS.map((tip, i) => (
              <View key={i} className="flex-row items-start mb-2">
                <Text className="text-sage mr-2 mt-0.5">
                  {"\u2022"}
                </Text>
                <Text className="text-sm text-dark/60 flex-1">{tip}</Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setShowTips(false)}
              className="mt-2 items-center"
            >
              <Text className="text-sage text-sm font-semibold">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Camera */}
      <View className="flex-1">
        {permission.granted ? (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            enableTorch={flashOn}
          >
            {/* Frame Guide Overlay */}
            <View className="flex-1 items-center justify-center">
              {/* Darkened overlay outside the frame */}
              <View className="absolute inset-0 bg-black/40" />

              {/* Clear frame area */}
              <View className="w-72 h-96 relative z-10">
                {/* Clear background cutout */}
                <View className="absolute inset-0 bg-black/0" />

                {/* Corner brackets */}
                {/* Top-left */}
                <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg" />
                {/* Top-right */}
                <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg" />
                {/* Bottom-left */}
                <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg" />
                {/* Bottom-right */}
                <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg" />

                {/* Horizontal scan lines for label effect */}
                <View className="absolute top-16 left-4 right-4 h-px bg-white/20" />
                <View className="absolute top-32 left-4 right-4 h-px bg-white/20" />
                <View className="absolute bottom-32 left-4 right-4 h-px bg-white/20" />
                <View className="absolute bottom-16 left-4 right-4 h-px bg-white/20" />

                {/* Label icon in center */}
                <View className="flex-1 items-center justify-center">
                  <Ionicons
                    name="document-text-outline"
                    size={32}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              {/* Instructions */}
              <Text className="text-white text-sm mt-5 font-medium z-10">
                Position the ingredient list inside the frame
              </Text>
              <Text className="text-white/50 text-xs mt-1 z-10">
                Make sure the text is clear and readable
              </Text>
            </View>

            {/* Bottom Controls */}
            <View className="absolute bottom-8 left-0 right-0">
              <View className="flex-row items-center justify-center gap-8">
                {/* Flashlight */}
                <TouchableOpacity
                  onPress={() => {
                    setFlashOn(!flashOn);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    flashOn ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <Ionicons
                    name={flashOn ? "flash" : "flash-outline"}
                    size={22}
                    color={flashOn ? "#8B9E7C" : "white"}
                  />
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity
                  onPress={handleCapture}
                  activeOpacity={0.7}
                  className="w-20 h-20 rounded-full bg-white items-center justify-center"
                  style={{
                    borderWidth: 4,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                    <Ionicons name="scan" size={28} color="#8B9E7C" />
                  </View>
                </TouchableOpacity>

                {/* Tips */}
                <TouchableOpacity
                  onPress={() => setShowTips(true)}
                  className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                >
                  <Ionicons name="bulb-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        ) : (
          /* Permission not granted */
          <View className="flex-1 items-center justify-center px-8">
            <View className="bg-white/10 rounded-full w-20 h-20 items-center justify-center mb-5">
              <Ionicons name="camera-outline" size={36} color="white" />
            </View>
            <Text className="text-white text-lg font-bold mb-2 text-center">
              Camera Access Needed
            </Text>
            <Text className="text-white/60 text-sm text-center mb-6 leading-5">
              To scan ingredient labels, Crunchy needs access to your camera.
            </Text>
            <TouchableOpacity
              onPress={async () => {
                await ensurePermission();
              }}
              className="bg-sage rounded-2xl py-3.5 px-8"
            >
              <Text className="text-white font-semibold text-base">
                Enable Camera
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
