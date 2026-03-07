import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "../utils/camera";
import * as Haptics from "../utils/haptics";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  analyzeAndSaveScan,
  type GeminiAnalysis,
} from "@/services/gemini";
import { Badge } from "@/components";

type ProductScanState = "camera" | "processing" | "result" | "error";

const RISK_CONFIG = {
  safe: { color: "#4CAF50", icon: "checkmark-circle" as const, label: "Safe" },
  concern: { color: "#FFC107", icon: "alert-circle" as const, label: "Concern" },
  toxic: { color: "#F44336", icon: "warning" as const, label: "Toxic" },
};

export default function ProductScanScreen() {
  const router = useRouter();
  const { canScan, recordScan } = useSubscription();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ProductScanState>("camera");
  const [flashOn, setFlashOn] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!canScan) {
      router.push({ pathname: "/paywall", params: { reason: "scan_limit" } });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setState("processing");

    try {
      let base64Image = "";

      if (cameraRef.current) {
        try {
          const photo = await (cameraRef.current as unknown as { takePictureAsync: (opts: { base64: boolean; quality: number }) => Promise<{ base64?: string }> }).takePictureAsync({
            base64: true,
            quality: 0.7,
          });
          if (photo?.base64) {
            base64Image = photo.base64;
          }
        } catch {
          // Camera might not support takePictureAsync in all environments
        }
      }

      const result = await analyzeAndSaveScan(base64Image, "item", user?.id ?? null);
      recordScan();
      setAnalysis(result);
      setState("result");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleRetry = () => {
    setState("camera");
    setAnalysis(null);
    setErrorMessage("");
  };

  const handleClose = () => {
    router.back();
  };

  const handleBackToScanner = () => {
    router.replace("/(tabs)/scan");
  };

  const ensurePermission = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Needed",
          "Crunchy needs camera access to identify products. Please enable camera access in your device settings.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return false;
      }
    }
    return true;
  };

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
              <Ionicons name="camera" size={36} color="#8B9E7C" />
            </View>
            <Text className="text-xl font-bold text-dark mb-2">
              Identifying Product...
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-6">
              Our AI is analyzing the product to find its ingredients and rate it
            </Text>
            <ActivityIndicator size="large" color="#8B9E7C" />
            <View className="flex-row items-center mt-6 bg-sage/5 rounded-xl px-4 py-3">
              <Ionicons name="sparkles" size={16} color="#8B9E7C" />
              <Text className="text-xs text-dark/40 ml-2">
                Powered by Gemini AI
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Result state
  if (state === "result" && analysis) {
    const ratingColor = analysis.rating === "clean" ? "#4CAF50" : analysis.rating === "caution" ? "#FFC107" : "#F44336";
    const ratingLabel = analysis.rating === "clean" ? "Clean" : analysis.rating === "caution" ? "Caution" : "Avoid";

    return (
      <SafeAreaView className="flex-1 bg-cream">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
          <TouchableOpacity
            onPress={handleBackToScanner}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark">Scan Result</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Header Card */}
          <View className="mx-5 mt-2 bg-white rounded-3xl p-5" style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: ratingColor + "15" }}
              >
                <Ionicons
                  name={analysis.rating === "clean" ? "checkmark-circle" : analysis.rating === "caution" ? "alert-circle" : "warning"}
                  size={30}
                  color={ratingColor}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-dark/40 uppercase font-medium tracking-wide">
                  {analysis.category}
                </Text>
                <Text className="text-lg font-bold text-dark mt-0.5">
                  {analysis.productName}
                </Text>
                <Text className="text-sm text-dark/50">{analysis.brand}</Text>
              </View>
            </View>

            {/* Rating */}
            <View
              className="mt-4 rounded-2xl p-4 flex-row items-center"
              style={{ backgroundColor: ratingColor + "12" }}
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl font-bold" style={{ color: ratingColor }}>
                    {ratingLabel}
                  </Text>
                  <Badge rating={analysis.rating} size="sm" />
                </View>
                <Text className="text-sm text-dark/60 mt-1">
                  Crunchy Score: {analysis.crunchyScore}/100
                </Text>
              </View>
            </View>
          </View>

          {/* Summary */}
          <View className="mx-5 mt-4 bg-white rounded-2xl p-4" style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <Text className="text-sm text-dark/70 leading-5">{analysis.summary}</Text>
          </View>

          {/* Ingredient Summary Counts */}
          <View className="flex-row mx-5 mt-4 gap-2">
            {(["safe", "concern", "toxic"] as const).map((risk) => {
              const count = analysis.ingredients.filter((i) => i.risk === risk).length;
              const config = RISK_CONFIG[risk];
              return (
                <View key={risk} className="flex-1 bg-white rounded-2xl p-3 items-center" style={{
                  shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
                }}>
                  <Text className="text-lg font-bold" style={{ color: config.color }}>
                    {count}
                  </Text>
                  <Text className="text-xs text-dark/50">{config.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Ingredients */}
          <View className="mx-5 mt-4">
            <Text className="text-lg font-bold text-dark mb-3">Ingredients</Text>
            {analysis.ingredients.map((ingredient) => {
              const risk = RISK_CONFIG[ingredient.risk];
              const isExpanded = expandedIngredient === ingredient.name;
              return (
                <TouchableOpacity
                  key={ingredient.name}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedIngredient(isExpanded ? null : ingredient.name);
                  }}
                  activeOpacity={0.7}
                  className="bg-white rounded-2xl mb-2 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-center p-3.5">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: risk.color + "18" }}
                    >
                      <Ionicons name={risk.icon} size={16} color={risk.color} />
                    </View>
                    <Text className="flex-1 text-base text-dark font-medium">
                      {ingredient.name}
                    </Text>
                    <Text
                      className="text-xs font-semibold mr-2"
                      style={{ color: risk.color }}
                    >
                      {risk.label}
                    </Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#999"
                    />
                  </View>
                  {isExpanded && (
                    <View
                      className="px-3.5 pb-3.5 pt-0"
                      style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}
                    >
                      <Text className="text-sm text-dark/60 leading-5 mt-2.5">
                        {ingredient.explanation}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Concerns */}
          {analysis.concerns.length > 0 && (
            <View className="mx-5 mt-4">
              <Text className="text-lg font-bold text-dark mb-3">Concerns</Text>
              <View className="bg-white rounded-2xl p-4" style={{
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
              }}>
                {analysis.concerns.map((concern, i) => (
                  <View key={i} className="flex-row items-start mb-2">
                    <Ionicons name="alert-circle" size={16} color="#F44336" style={{ marginTop: 2 }} />
                    <Text className="text-sm text-dark/70 ml-2 flex-1">{concern}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Clean Alternatives */}
          {analysis.cleanAlternatives.length > 0 && (
            <View className="mx-5 mt-4">
              <Text className="text-lg font-bold text-dark mb-3">Clean Alternatives</Text>
              <View className="bg-white rounded-2xl p-4" style={{
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
              }}>
                {analysis.cleanAlternatives.map((alt, i) => (
                  <View key={i} className="flex-row items-center mb-2">
                    <Ionicons name="leaf" size={16} color="#4CAF50" style={{ marginTop: 1 }} />
                    <Text className="text-sm text-dark/70 ml-2 flex-1">{alt}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Back to Scanner Button */}
          <View className="mx-5 mt-6">
            <TouchableOpacity
              onPress={handleBackToScanner}
              activeOpacity={0.85}
              className="bg-sage rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-base">
                Back to Scanner
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
              {"Couldn't Identify Product"}
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-6 leading-5">
              {errorMessage || "Try again with a clearer view of the product."}
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
        <Text className="text-white text-lg font-bold">Scan Item</Text>
        <View className="w-10" />
      </View>

      {/* Camera */}
      <View className="flex-1">
        {permission.granted ? (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            enableTorch={flashOn}
          >
            {/* Overlay */}
            <View className="flex-1 items-center justify-center">
              <View className="absolute inset-0 bg-black/30" />

              {/* Center circle guide */}
              <View
                className="w-64 h-64 rounded-full items-center justify-center z-10"
                style={{
                  borderWidth: 3,
                  borderColor: "rgba(255,255,255,0.5)",
                  borderStyle: "dashed",
                }}
              >
                <Ionicons
                  name="camera-outline"
                  size={40}
                  color="rgba(255,255,255,0.3)"
                />
              </View>

              <Text className="text-white text-sm mt-6 font-medium z-10">
                Point at the product
              </Text>
              <Text className="text-white/50 text-xs mt-1 z-10">
                Works with any product, bottle, clothing tag, or packaging
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
                    <Ionicons name="sparkles" size={28} color="#8B9E7C" />
                  </View>
                </TouchableOpacity>

                {/* Placeholder for balance */}
                <View className="w-12 h-12" />
              </View>
            </View>
          </CameraView>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <View className="bg-white/10 rounded-full w-20 h-20 items-center justify-center mb-5">
              <Ionicons name="camera-outline" size={36} color="white" />
            </View>
            <Text className="text-white text-lg font-bold mb-2 text-center">
              Camera Access Needed
            </Text>
            <Text className="text-white/60 text-sm text-center mb-6 leading-5">
              To identify products, Crunchy needs access to your camera.
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
