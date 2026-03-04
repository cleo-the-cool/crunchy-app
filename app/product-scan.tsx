import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PRODUCTS, searchProducts } from "@/data/products";

type ProductScanState = "camera" | "processing" | "confirm" | "error" | "manual-search";

// Mock AI: randomly pick a product to simulate product recognition
const MOCK_AI_PRODUCTS = PRODUCTS.filter((p) => p.image);

function getRandomAIProduct() {
  const idx = Math.floor(Math.random() * MOCK_AI_PRODUCTS.length);
  return MOCK_AI_PRODUCTS[idx];
}

export default function ProductScanScreen() {
  const router = useRouter();
  const { canScan, recordScan } = useSubscription();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ProductScanState>("camera");
  const [flashOn, setFlashOn] = useState(false);
  const [identifiedProduct, setIdentifiedProduct] = useState<(typeof PRODUCTS)[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!canScan) {
      router.push({ pathname: "/paywall", params: { reason: "scan_limit" } });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setState("processing");

    // Simulate AI processing delay
    setTimeout(() => {
      const success = Math.random() > 0.1;

      if (success) {
        const product = getRandomAIProduct();
        setIdentifiedProduct(product);
        setState("confirm");
      } else {
        setState("error");
      }
    }, 3000);
  };

  const handleConfirmYes = () => {
    if (identifiedProduct) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      recordScan();
      router.replace({
        pathname: "/scan-result",
        params: { barcode: identifiedProduct.barcode, type: "ai-recognition" },
      });
    }
  };

  const handleConfirmNo = () => {
    setState("manual-search");
    setSearchQuery("");
  };

  const handleRetry = () => {
    setState("camera");
    setIdentifiedProduct(null);
  };

  const handleClose = () => {
    router.back();
  };

  const handleSelectSearchResult = (product: (typeof PRODUCTS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordScan();
    router.replace({
      pathname: "/scan-result",
      params: { barcode: product.barcode, type: "ai-recognition" },
    });
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

  const searchResults = searchQuery.trim().length >= 2
    ? searchProducts(searchQuery.trim())
    : [];

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
              <Ionicons name="camera" size={36} color="#8B9E7C" />
            </View>
            <Text className="text-xl font-bold text-dark mb-2">
              Identifying Product...
            </Text>
            <Text className="text-sm text-dark/50 text-center mb-6">
              Our AI is analyzing the product to find its ingredients
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

  // Confirmation state
  if (state === "confirm" && identifiedProduct) {
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
            {/* Premium badge */}
            <View className="flex-row items-center bg-peach/10 rounded-full px-3 py-1.5 mb-5">
              <Ionicons name="diamond" size={12} color="#F4A574" />
              <Text className="text-xs font-semibold text-peach ml-1">
                Premium
              </Text>
            </View>

            {/* Product image placeholder */}
            <View className="bg-sage/10 rounded-2xl w-24 h-24 items-center justify-center mb-5">
              <Text className="text-4xl">{identifiedProduct.image}</Text>
            </View>

            <Text className="text-lg font-bold text-dark mb-1 text-center">
              Is this the right product?
            </Text>
            <Text className="text-base font-semibold text-dark/80 mb-1 text-center">
              {identifiedProduct.name}
            </Text>
            <Text className="text-sm text-dark/50 mb-1">
              {identifiedProduct.brand}
            </Text>
            <Text className="text-xs text-dark/30 mb-6">
              {identifiedProduct.category}
            </Text>

            {/* Yes/No buttons */}
            <View className="flex-row w-full gap-3">
              <TouchableOpacity
                onPress={handleConfirmNo}
                activeOpacity={0.85}
                className="flex-1 bg-dark/5 rounded-2xl py-3.5 items-center"
              >
                <Text className="text-dark/60 font-semibold text-base">
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmYes}
                activeOpacity={0.85}
                className="flex-1 bg-sage rounded-2xl py-3.5 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  {"Yes, that's it!"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleRetry} className="mt-4 py-2">
              <Text className="text-dark/40 text-sm">Take another photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Manual search state
  if (state === "manual-search") {
    return (
      <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-3">
          <TouchableOpacity
            onPress={handleRetry}
            className="w-10 h-10 rounded-full bg-dark/5 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark">Search Product</Text>
          <TouchableOpacity
            onPress={handleClose}
            className="w-10 h-10 rounded-full bg-dark/5 items-center justify-center"
          >
            <Ionicons name="close" size={22} color="#2D2D2D" />
          </TouchableOpacity>
        </View>

        <View className="px-5 mb-4">
          <Text className="text-sm text-dark/50 mb-3 text-center">
            {"We couldn't match the product. Try searching by name."}
          </Text>
          <View
            className="flex-row items-center bg-white rounded-2xl px-4 py-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              className="flex-1 ml-2 text-base text-dark"
              placeholder="Search by product name or brand..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {searchQuery.trim().length < 2 ? (
            <View className="items-center mt-8">
              <Ionicons name="search-outline" size={40} color="#ccc" />
              <Text className="text-dark/30 text-sm mt-3">
                Type at least 2 characters to search
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View className="items-center mt-8">
              <Ionicons name="leaf-outline" size={40} color="#ccc" />
              <Text className="text-dark/30 text-sm mt-3">
                No products found
              </Text>
            </View>
          ) : (
            searchResults.map((product) => (
              <TouchableOpacity
                key={product.barcode}
                onPress={() => handleSelectSearchResult(product)}
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
                <View className="bg-sage/10 rounded-2xl w-12 h-12 items-center justify-center mr-3">
                  <Text className="text-xl">{product.image}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-dark">
                    {product.name}
                  </Text>
                  <Text className="text-xs text-dark/50">
                    {product.brand} · {product.category}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            ))
          )}
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
              {"We couldn't recognize this product. Try again with a clearer"}{" "}
              view, or search for it manually.
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
            <TouchableOpacity
              onPress={() => {
                setState("manual-search");
                setSearchQuery("");
              }}
              className="py-2 mb-1"
            >
              <Text className="text-sage text-sm font-semibold">
                Search Manually
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
        <View className="flex-row items-center">
          <Text className="text-white text-lg font-bold">Identify Product</Text>
          <View className="flex-row items-center bg-peach/20 rounded-full px-2 py-0.5 ml-2">
            <Ionicons name="diamond" size={10} color="#F4A574" />
            <Text className="text-xs font-semibold text-peach ml-0.5">
              Premium
            </Text>
          </View>
        </View>
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
              {/* Darkened overlay */}
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

              {/* Instructions */}
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

                {/* Search manually */}
                <TouchableOpacity
                  onPress={() => {
                    setState("manual-search");
                    setSearchQuery("");
                  }}
                  className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                >
                  <Ionicons name="search" size={22} color="white" />
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
