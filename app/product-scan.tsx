import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
import { analyzeAndSaveScan, identifyAndCheckCache, type IdentifyResult } from "@/services/gemini";

type ProductScanState = "camera" | "processing" | "ai_processing" | "error";

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
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ProductScanState>("camera");
  const [flashOn, setFlashOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [progressText, setProgressText] = useState("Analyzing ingredients...");
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>("");
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
          if (typeof cam.takePictureAsync === "function") {
            const photo = await cam.takePictureAsync({ base64: true, quality: 0.7 });
            if (photo?.base64) base64Image = photo.base64;
          }
          if (!base64Image && typeof cam.captureAsync === "function") {
            const photo = await cam.captureAsync({ base64: true, quality: 0.7 });
            if (photo?.base64) base64Image = photo.base64;
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

      setCapturedImage(base64Image);

      // Step 1: Identify product and check cache
      const identified = await identifyAndCheckCache(base64Image, user?.id ?? null, (step) => setProgressText(step));

      // If cached, go straight to results
      if (identified.cached && identified.cachedAnalysis) {
        recordScan();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({
          pathname: "/scan-result",
          params: {
            barcodeData: JSON.stringify(identified.cachedAnalysis),
            source: "item",
          },
        });
        return;
      }

      // Not cached — go straight to AI analysis
      setIdentifyResult(identified);
      setCapturedImage(base64Image);
      setState("ai_processing");
      setProgressText("Analyzing ingredients...");

      try {
        const result = await analyzeAndSaveScan(
          base64Image,
          "item",
          user?.id ?? null,
          (step) => setProgressText(step),
          {
            aiKnowledgeBase: true,
            productContext: {
              productName: identified.productName,
              brand: identified.brand,
              category: identified.category,
            },
          }
        );
        recordScan();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({
          pathname: "/scan-result",
          params: {
            barcodeData: JSON.stringify(result),
            source: "item",
          },
        });
      } catch (aiErr) {
        const aiMsg = aiErr instanceof Error ? aiErr.message : "Something went wrong";
        console.error("AI analysis error:", aiMsg, aiErr);
        setErrorMessage(aiMsg);
        setState("error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      console.error("Scan error:", msg, err);
      setErrorMessage(msg);
      setState("error");
    }
  };



  const handleRetry = () => {
    setState("camera");
    setErrorMessage("");
  };

  const handleClose = () => {
    router.back();
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
              {progressText}
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



  // AI knowledge processing state
  if (state === "ai_processing") {
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
              <Ionicons name="sparkles" size={36} color="#3D5A3E" />
            </View>
            <Text className="text-xl font-bold text-dark mb-2">
              {progressText}
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-4">
              Researching known ingredients from our AI knowledge base
            </Text>
            <ScanningLineAnimation />
          </View>
        </View>
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
                Works with food, drinks, snacks, skincare, cleaning products, and household items
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
