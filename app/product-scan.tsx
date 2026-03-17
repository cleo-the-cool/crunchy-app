import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "../utils/camera";
import * as Haptics from "../utils/haptics";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences, buildConcernsPrompt } from "@/contexts/PreferencesContext";
import {
  analyzeAndSaveScan,
  buildFocusPrompt,
  type GeminiAnalysis,
} from "@/services/gemini";
import { Badge } from "@/components";
import { getRatingFromScore } from "@/lib/savedProducts";

type ProductScanState = "camera" | "processing" | "result" | "error";

const RISK_CONFIG = {
  safe: { color: "#4CAF50", icon: "checkmark-circle" as const, label: "Safe" },
  concern: { color: "#FFC107", icon: "alert-circle" as const, label: "Concern" },
  toxic: { color: "#F44336", icon: "warning" as const, label: "Toxic" },
};

function ScanningLineAnimation() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(120, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="w-full h-32 overflow-hidden rounded-xl bg-forest/5 items-center">
      <Animated.View
        style={[
          animatedStyle,
          {
            width: "80%",
            height: 2,
            backgroundColor: "#8B9E7C",
            borderRadius: 1,
            opacity: 0.6,
          },
        ]}
      />
    </View>
  );
}

export default function ProductScanScreen() {
  const router = useRouter();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const { canScan, recordScan } = useSubscription();
  const { user } = useAuth();
  const { concerns } = usePreferences();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ProductScanState>("camera");
  const [flashOn, setFlashOn] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [countdown, setCountdown] = useState(0);
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
          const cam = cameraRef.current as any;
          // Try takePictureAsync first (standard CameraView method)
          if (typeof cam.takePictureAsync === "function") {
            const photo = await cam.takePictureAsync({
              base64: true,
              quality: 0.7,
            });
            if (photo?.base64) {
              base64Image = photo.base64;
            }
          }
          // Fallback: try captureAsync (some Expo SDK versions use this)
          if (!base64Image && typeof cam.captureAsync === "function") {
            const photo = await cam.captureAsync({
              base64: true,
              quality: 0.7,
            });
            if (photo?.base64) {
              base64Image = photo.base64;
            }
          }
        } catch (camErr: any) {
          console.warn("Camera capture error:", camErr?.message || camErr);
          setErrorMessage(camErr?.message || "Camera capture failed");
          setState("error");
          return;
        }
      }

      if (!base64Image) {
        setErrorMessage("EMPTY_IMAGE");
        setState("error");
        return;
      }

      const concernsPrompt = buildConcernsPrompt(concerns) + buildFocusPrompt(focus || "all");
      const result = await analyzeAndSaveScan(base64Image, "item", user?.id ?? null, concernsPrompt);
      recordScan();
      setAnalysis(result);
      setState("result");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Save to scan history
      const { addToHistory } = await import("@/lib/scanHistory");
      addToHistory({
        productName: result.productName,
        brand: result.brand,
        category: result.category,
        rating: getRatingFromScore(result.crunchyScore),
        crunchyScore: result.crunchyScore,
        scanMode: "item",
        ingredients: result.ingredients.map(i => ({ name: i.name, risk: i.risk })),
        concerns: result.concerns,
        summary: result.summary,
      }).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      console.error("Scan error:", msg, err);
      setErrorMessage(msg);
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

  // Rate limit countdown - must be before any conditional returns
  const isRateLimited = state === "error" && errorMessage === "SCANNER_RATE_LIMITED";

  useEffect(() => {
    if (isRateLimited && countdown === 0) {
      setCountdown(30);
    }
  }, [isRateLimited]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3D5A3E" />
        </View>
      </SafeAreaView>
    );
  }

  // Processing state
  if (state === "processing") {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="bg-white rounded-3xl p-8 items-center w-full"
            style={{
              shadowColor: "#3D5A3E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="bg-forest/8 rounded-full w-20 h-20 items-center justify-center mb-5">
              <Ionicons name="camera" size={36} color="#3D5A3E" />
            </View>
            <Text className="text-xl font-bold text-dark mb-2">
              Identifying Product...
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-4">
              Our AI is analyzing the product to find its ingredients and rate it
            </Text>
            <ScanningLineAnimation />
            <View className="flex-row items-center mt-5 bg-forest/5 rounded-xl px-4 py-3">
              <Ionicons name="sparkles" size={16} color="#3D5A3E" />
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
    const derivedRating = getRatingFromScore(analysis.crunchyScore);
    const ratingColor = derivedRating === "clean" ? "#4CAF50" : derivedRating === "caution" ? "#FFC107" : "#F44336";
    const ratingLabel = derivedRating === "clean" ? "Clean" : derivedRating === "caution" ? "Caution" : "Avoid";

    return (
      <SafeAreaView className="flex-1 bg-ivory">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
          <TouchableOpacity
            onPress={handleBackToScanner}
            className="w-10 h-10 rounded-full bg-cream items-center justify-center"
            style={{
              borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark" style={{ fontFamily: 'Georgia' }}>Scan Result</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Header Card */}
          <View className="mx-5 mt-2 bg-white rounded-3xl p-5" style={{
            shadowColor: "#3D5A3E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-3xl items-center justify-center mr-4"
                style={{ backgroundColor: ratingColor + "15" }}
              >
                <Ionicons
                  name={derivedRating === "clean" ? "checkmark-circle" : derivedRating === "caution" ? "alert-circle" : "warning"}
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
                  <Badge rating={derivedRating} size="sm" />
                </View>
                <Text className="text-sm text-dark/60 mt-1">
                  Crunchy Score: {analysis.crunchyScore}/100
                </Text>
              </View>
            </View>
          </View>

          {/* Summary */}
          <View className="mx-5 mt-4 bg-white rounded-3xl p-4" style={{
            shadowColor: "#3D5A3E",
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
                <View key={risk} className="flex-1 bg-white rounded-3xl p-3 items-center" style={{
                  shadowColor: "#3D5A3E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
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
            <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>Ingredients</Text>
            {[...analysis.ingredients].sort((a, b) => {
              const order: Record<string, number> = { toxic: 0, concern: 1, safe: 2 };
              return (order[a.risk] ?? 1) - (order[b.risk] ?? 1);
            }).map((ingredient) => {
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
                  className="bg-white rounded-3xl mb-2 overflow-hidden"
                  style={{
                    shadowColor: "#3D5A3E",
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
              <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>Concerns</Text>
              <View className="bg-white rounded-3xl p-4" style={{
                shadowColor: "#3D5A3E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
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
              <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>Clean Alternatives</Text>
              <View className="bg-white rounded-3xl p-4" style={{
                shadowColor: "#3D5A3E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
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

          {/* Action Buttons */}
          <View className="mx-5 mt-6 gap-3">
            <TouchableOpacity
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const { saveProduct, unsaveProduct } = await import("@/lib/savedProducts");
                if (isSaved) {
                  await unsaveProduct(analysis?.productName ?? "unknown");
                } else if (analysis) {
                  await saveProduct({
                    id: `gemini-${Date.now()}`,
                    name: analysis.productName,
                    brand: analysis.brand || undefined,
                    rating: getRatingFromScore(analysis.crunchyScore),
                    image: getCategoryEmoji(analysis.category),
                    category: analysis.category,
                    scanData: analysis,
                    savedAt: new Date().toISOString(),
                  });
                }
                setIsSaved(!isSaved);
              }}
              activeOpacity={0.85}
              className={`rounded-2xl py-4 flex-row items-center justify-center ${isSaved ? "bg-forest/8" : "bg-forest"}`}
              style={isSaved ? { borderWidth: 1, borderColor: "#3D5A3E" } : undefined}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isSaved ? "#3D5A3E" : "white"}
              />
              <Text className={`font-semibold text-base ml-2 ${isSaved ? "text-forest" : "text-white"}`}>
                {isSaved ? "Product Saved" : "Save Product"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBackToScanner}
              activeOpacity={0.85}
              className="bg-white rounded-2xl py-4 flex-row items-center justify-center"
              style={{
                borderWidth: 1,
                borderColor: "#e5e5e5",
                shadowColor: "#3D5A3E",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="scan-outline" size={20} color="#2D2D2D" />
              <Text className="text-dark font-semibold text-base ml-2">
                Scan Another
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (state === "error") {
    const isEmptyImage = errorMessage === "EMPTY_IMAGE";

    const retryDisabled = isRateLimited && countdown > 0;

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
              <Ionicons name={isRateLimited ? "time-outline" : isEmptyImage ? "camera-outline" : "alert-circle"} size={36} color="#F4A574" />
            </View>
            <Text className="text-xl font-bold text-dark mb-2">
              {isRateLimited
                ? "Our scanner is taking a breather"
                : isEmptyImage
                ? "Photo Capture Failed"
                : "Couldn't Identify Product"}
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-6 leading-5">
              {isRateLimited
                ? "Wait 30 seconds and try again."
                : isEmptyImage
                ? "Couldn't capture the photo. Make sure the camera has a clear view and try again."
                : "Try again with a clearer view of the product."}
            </Text>
            <TouchableOpacity
              onPress={retryDisabled ? undefined : handleRetry}
              activeOpacity={retryDisabled ? 1 : 0.85}
              className={`rounded-2xl py-3.5 px-8 mb-3 w-full items-center ${retryDisabled ? "bg-sage/40" : "bg-sage"}`}
            >
              <Text className="text-white font-semibold text-base">
                {retryDisabled ? `Try Again (${countdown}s)` : "Try Again"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} className="py-2">
              <Text className="text-dark/40 text-sm">Go Back</Text>
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
          <View style={{ flex: 1 }}>
            <CameraView
              ref={cameraRef}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              facing="back"
              enableTorch={flashOn}
            />
            {/* Overlay - positioned absolutely over camera */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} className="items-center justify-center">
              <View className="absolute inset-0 bg-black/30" />

              {/* Corner bracket frame guide */}
              <View className="w-64 h-64 relative z-10">
                <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg" />

                <View className="flex-1 items-center justify-center">
                  <Ionicons
                    name="camera-outline"
                    size={36}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
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
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <View className="bg-white/10 rounded-full w-20 h-20 items-center justify-center mb-5">
              <Ionicons name="camera-outline" size={36} color="white" />
            </View>
            <Text className="text-white text-lg font-bold mb-2 text-center">
              Camera Access Needed
            </Text>
            <Text className="text-white/60 text-sm text-center mb-6 leading-5">
              Camera access is needed to scan products
            </Text>
            {permission.canAskAgain ? (
              <TouchableOpacity
                onPress={async () => {
                  await ensurePermission();
                }}
                className="bg-sage rounded-2xl py-3.5 px-8 mb-3"
              >
                <Text className="text-white font-semibold text-base">
                  Enable Camera
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => Linking.openSettings()}
                className="bg-sage rounded-2xl py-3.5 px-8 mb-3"
              >
                <Text className="text-white font-semibold text-base">
                  Open Settings
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose} className="py-2">
              <Text className="text-white/50 text-sm font-medium">Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Food: "🍎", Drinks: "🥤", Skincare: "🧴", Makeup: "💄",
    Cleaning: "🧹", "Personal Care": "🪥", Clothing: "👕",
    Home: "🏠", Baby: "👶", Cookware: "🍳", Drinkware: "🥤",
  };
  return map[category] || "📦";
}
