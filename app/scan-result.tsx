import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "../utils/haptics";
import ViewShot from "../utils/view-shot";
import * as Sharing from "../utils/sharing";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
} from "react-native-reanimated";
import {
  findProductByBarcode,
  getDefaultProduct,
  type Product,
  type IngredientRisk,
  type Rating,
  type Alternative,
} from "@/data/products";
import { Badge } from "@/components";
import { getRatingFromScore } from "@/lib/savedProducts";
import { getCategoryImage } from "@/lib/categoryImages";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences, PREFERENCE_OPTIONS } from "@/contexts/PreferencesContext";
import { getScoreBreakdown, TIER_CONFIG, type CategoryScores } from "@/lib/scoring";

const RATING_CONFIG: Record<Rating, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string; description: string }> = {
  clean: {
    icon: "checkmark-circle",
    color: "#4CAF50",
    bg: "bg-rating-clean",
    label: "Clean",
    description: "This product uses safe, non-toxic ingredients",
  },
  caution: {
    icon: "alert-circle",
    color: "#FFC107",
    bg: "bg-rating-caution",
    label: "Caution",
    description: "This product contains some ingredients of concern",
  },
  avoid: {
    icon: "warning",
    color: "#F44336",
    bg: "bg-rating-avoid",
    label: "Avoid",
    description: "This product contains harmful or toxic ingredients",
  },
};

// 4-tier risk config for ingredient badges
const RISK_CONFIG_4TIER = {
  high: { color: "#F44336", icon: "warning" as const, label: "High Risk" },
  moderate: { color: "#FF9800", icon: "alert-circle" as const, label: "Moderate" },
  limited: { color: "#FFC107", icon: "information-circle" as const, label: "Limited" },
  safe: { color: "#4CAF50", icon: "checkmark-circle" as const, label: "Safe" },
};

// Legacy 3-tier config for backward compatibility
const RISK_CONFIG_LEGACY: Record<IngredientRisk, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  safe: { color: "#4CAF50", icon: "checkmark-circle", label: "Safe" },
  concern: { color: "#FFC107", icon: "alert-circle", label: "Concern" },
  toxic: { color: "#F44336", icon: "warning", label: "Toxic" },
};

function getIngredientDisplay(ingredient: any): { color: string; icon: keyof typeof Ionicons.glyphMap; label: string } {
  // If ingredient has a tier field (new 4-tier system), use it
  if (ingredient.tier && RISK_CONFIG_4TIER[ingredient.tier as keyof typeof RISK_CONFIG_4TIER]) {
    return RISK_CONFIG_4TIER[ingredient.tier as keyof typeof RISK_CONFIG_4TIER];
  }
  // Legacy 3-tier fallback with mapping
  const legacyToTier: Record<string, keyof typeof RISK_CONFIG_4TIER> = {
    safe: "safe",
    concern: "limited",
    toxic: "high",
  };
  const tier = legacyToTier[ingredient.risk] || "limited";
  return RISK_CONFIG_4TIER[tier];
}

function ScanSuccessAnimation({ color }: { color: string }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(1);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withSequence(
      withSpring(1.2, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    ringScale.value = withTiming(2.5, { duration: 600 });
    ringOpacity.value = withDelay(200, withTiming(0, { duration: 400 }));
    opacity.value = withDelay(1500, withTiming(0, { duration: 300 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <Animated.View
      style={[checkStyle, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", zIndex: 100 }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[ringStyle, { position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: color }]}
      />
      <View
        style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: color, justifyContent: "center", alignItems: "center" }}
      >
        <Ionicons name="checkmark" size={40} color="white" />
      </View>
    </Animated.View>
  );
}

interface DisplayProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  rating: Rating;
  crunchyScore?: number;
  barcode: string;
  ingredients: Array<{ name: string; risk: IngredientRisk; explanation: string; tier?: string; source?: string | null }>;
  alternatives: Alternative[];
  diyRecipeId?: string;
  concerns?: string[];
  summary?: string;
  categoryScores?: CategoryScores;
}

// Icon map for preference categories
const PREF_ICONS: Record<string, string> = {
  toxins_additives: "🧪",
  nutrition: "🥗",
  animal_welfare: "🐰",
  sustainability: "🌍",
  fair_trade: "🤝",
};

export default function ScanResultScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const { barcode, type, barcodeData, source } = useLocalSearchParams<{
    barcode?: string;
    type?: string;
    barcodeData?: string;
    source?: string;
  }>();

  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(true);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const shareCardRef = useRef<ViewShot>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Build display product from either barcode data (Gemini analysis) or fallback product data
  let product: DisplayProduct;

  if (barcodeData) {
    try {
      const analysis = JSON.parse(barcodeData);
      const score = analysis.crunchyScore || 50;
      product = {
        id: `gemini_${Date.now()}`,
        name: analysis.productName || "Unknown Product",
        brand: analysis.brand || "Unknown Brand",
        category: analysis.category || "Other",
        image: getCategoryEmoji(analysis.category),
        rating: getRatingFromScore(score),
        crunchyScore: score,
        barcode: barcode || "",
        ingredients: (analysis.ingredients || []).map((i: any) => ({
          name: i.name || "",
          risk: (i.risk || "concern") as IngredientRisk,
          explanation: i.explanation || "",
          tier: i.tier || undefined,
          source: i.source || null,
        })),
        alternatives: [],
        concerns: analysis.concerns || [],
        summary: analysis.summary || "",
        categoryScores: analysis.categoryScores || undefined,
      };
    } catch {
      const fallback = getDefaultProduct("unknown");
      product = { ...fallback, concerns: [], summary: "" };
    }
  } else {
    const fallbackProduct = barcode
      ? findProductByBarcode(barcode) ?? getDefaultProduct(barcode)
      : getDefaultProduct("unknown");
    product = { ...fallbackProduct, concerns: [], summary: "" };
  }

  const ratingInfo = RATING_CONFIG[product.rating];

  const toggleIngredient = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIngredient(expandedIngredient === name ? null : name);
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { saveProduct, unsaveProduct } = await import("@/lib/savedProducts");
    if (isSaved) {
      await unsaveProduct(product.id, user?.id);
    } else {
      await saveProduct({
        id: product.id,
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        rating: product.rating,
        image: product.image,
        category: product.category,
        scanData: barcodeData ? JSON.parse(barcodeData) : undefined,
        savedAt: new Date().toISOString(),
      }, user?.id);
    }
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (shareCardRef.current?.capture) {
        const uri = await shareCardRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
          return;
        }
      }
    } catch {}
    try {
      const scoreText = product.crunchyScore ? ` (Score: ${product.crunchyScore}/100)` : "";
      await Share.share({
        message: `I scanned ${product.name} by ${product.brand} on Crunchy and it's rated ${ratingInfo.label}${scoreText}!\n\nDownload Crunchy to check your products.`,
      });
    } catch {}
  };

  const handleDIY = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (product.diyRecipeId) {
      router.push(`/recipe-detail?id=${product.diyRecipeId}`);
    }
  };

  const handleAlternativePress = (alt: Alternative) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      alt.name,
      `${alt.brand} - ${alt.price}\n\nRated: ${RATING_CONFIG[alt.rating].label}\n\nBuy links coming soon!`,
      [{ text: "OK" }]
    );
  };

  // Compute 4-tier ingredient counts
  const ingredientCounts = {
    high: product.ingredients.filter((i) => (i.tier === "high") || (!i.tier && i.risk === "toxic")).length,
    moderate: product.ingredients.filter((i) => i.tier === "moderate").length,
    limited: product.ingredients.filter((i) => (i.tier === "limited") || (!i.tier && i.risk === "concern")).length,
    safe: product.ingredients.filter((i) => (i.tier === "safe") || (!i.tier && i.risk === "safe")).length,
  };

  // Score breakdown for "Why this score?" section
  const scoreBreakdown = product.categoryScores
    ? getScoreBreakdown(product.categoryScores, preferences)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {showSuccess && source !== "history" && <ScanSuccessAnimation color={ratingInfo.color} />}
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/scan")}
            className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark">Scan Result</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleSave}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isSaved ? "#8B9E7C" : "#2D2D2D"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="share-outline" size={20} color="#2D2D2D" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Shareable Card */}
        <ViewShot ref={shareCardRef} options={{ format: "png", quality: 1 }}>
          <Animated.View entering={FadeIn.delay(200).duration(400)} className="mx-5 mt-2 rounded-3xl overflow-hidden" style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <ImageBackground
              source={getCategoryImage(product.category)}
              resizeMode="cover"
            >
              <View className="px-5 pt-5 pb-4" style={{ backgroundColor: "rgba(61,90,62,0.7)" }}>
                <View className="flex-row items-center">
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    {product.image ? <Text className="text-3xl">{product.image}</Text> : <Ionicons name="cube-outline" size={28} color="rgba(255,255,255,0.7)" />}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-white/60 uppercase font-medium tracking-wide">
                      {product.category}
                    </Text>
                    <Text className="text-lg font-bold text-white mt-0.5">
                      {product.name}
                    </Text>
                    <Text className="text-sm text-white/70">{product.brand}</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>

            <View className="bg-white px-5 pb-5">
              <View
                className="mt-4 rounded-2xl p-4 flex-row items-center"
                style={{ backgroundColor: ratingInfo.color + "12" }}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: ratingInfo.color + "25" }}
                >
                  <Ionicons name={ratingInfo.icon} size={30} color={ratingInfo.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xl font-bold" style={{ color: ratingInfo.color }}>
                      {ratingInfo.label}
                    </Text>
                    <Badge rating={product.rating} size="sm" />
                    {product.crunchyScore !== undefined && (
                      <View className="bg-forest/10 rounded-full px-2.5 py-0.5">
                        <Text className="text-forest text-xs font-bold">{product.crunchyScore}/100</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-dark/60 mt-1">
                    {product.summary || ratingInfo.description}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-center mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" }}>
                <Text className="text-sm text-dark/30" style={{ fontWeight: "500" }}>Scanned with </Text>
                <Text className="text-sm text-forest" style={{ fontStyle: "italic", fontWeight: "600" }}>Crunchy</Text>
              </View>
            </View>
          </Animated.View>
        </ViewShot>

        {/* "Why this score?" expandable card */}
        {scoreBreakdown && scoreBreakdown.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowScoreBreakdown(!showScoreBreakdown);
            }}
            activeOpacity={0.8}
            className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Ionicons name="help-circle-outline" size={20} color="#3D5A3E" />
                <Text className="text-base font-bold text-dark ml-2">Why this score?</Text>
              </View>
              <Ionicons
                name={showScoreBreakdown ? "chevron-up" : "chevron-down"}
                size={18}
                color="#999"
              />
            </View>

            {showScoreBreakdown && (
              <View className="px-4 pb-4" style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}>
                {scoreBreakdown.map((item) => {
                  if (item.weight === 0) return null;
                  const scoreColor = item.score === null ? "#999" : item.score >= 70 ? "#4CAF50" : item.score >= 40 ? "#FFC107" : "#F44336";
                  const icon = PREF_ICONS[item.category] || "📊";
                  return (
                    <View key={item.category} className="mt-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1">
                          <Text className="text-base mr-2">{icon}</Text>
                          <Text className="text-sm font-medium text-dark">{item.label}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-xs text-dark/40 mr-2">Weight: {Math.round(item.weight * 100)}%</Text>
                          <Text className="text-sm font-bold" style={{ color: scoreColor }}>
                            {item.score !== null ? `${item.score}` : "No data"}
                          </Text>
                        </View>
                      </View>
                      {/* Score bar */}
                      <View className="h-1.5 bg-dark/5 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${item.score ?? 50}%`,
                            backgroundColor: scoreColor,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/onboarding-preferences", params: { from: "settings" } })}
                  className="flex-row items-center justify-center mt-4 pt-3"
                  style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}
                >
                  <Ionicons name="settings-outline" size={14} color="#3D5A3E" />
                  <Text className="text-sm text-forest font-medium ml-1">Adjust in Settings</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Concerns */}
        {product.concerns && product.concerns.length > 0 && (
          <View className="mx-5 mt-4 bg-white rounded-2xl p-4" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}>
            <Text className="text-sm font-bold text-dark mb-2">Key Concerns</Text>
            {product.concerns.map((concern, idx) => (
              <View key={idx} className="flex-row items-start mb-1.5">
                <Ionicons name="alert-circle" size={14} color="#FFC107" style={{ marginTop: 2, marginRight: 6 }} />
                <Text className="text-sm text-dark/70 flex-1">{concern}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 4-Tier Ingredient Summary */}
        <View className="flex-row mx-5 mt-4 gap-2">
          {(["high", "moderate", "limited", "safe"] as const).map((tier) => {
            const count = ingredientCounts[tier];
            const config = RISK_CONFIG_4TIER[tier];
            return (
              <View key={tier} className="flex-1 bg-white rounded-2xl p-3 items-center" style={{
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

        {/* Ingredients List */}
        <View className="mx-5 mt-4">
          <Text className="text-lg font-bold text-dark mb-3">Ingredients</Text>
          {[...product.ingredients].sort((a, b) => {
            const tierOrder: Record<string, number> = { high: 0, moderate: 1, limited: 2, safe: 3 };
            const riskToTier: Record<string, string> = { toxic: "high", concern: "limited", safe: "safe" };
            const aTier = a.tier || riskToTier[a.risk] || "limited";
            const bTier = b.tier || riskToTier[b.risk] || "limited";
            return (tierOrder[aTier] ?? 2) - (tierOrder[bTier] ?? 2);
          }).map((ingredient) => {
            const display = getIngredientDisplay(ingredient);
            const isExpanded = expandedIngredient === ingredient.name;
            return (
              <TouchableOpacity
                key={ingredient.name}
                onPress={() => toggleIngredient(ingredient.name)}
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
                    style={{ backgroundColor: display.color + "18" }}
                  >
                    <Ionicons name={display.icon} size={16} color={display.color} />
                  </View>
                  <Text className="flex-1 text-base text-dark font-medium">
                    {ingredient.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Text
                      className="text-xs font-semibold mr-2"
                      style={{ color: display.color }}
                    >
                      {display.label}
                    </Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#999"
                    />
                  </View>
                </View>
                {isExpanded && (
                  <View
                    className="px-3.5 pb-3.5 pt-0"
                    style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}
                  >
                    <Text className="text-sm text-dark/60 leading-5 mt-2.5">
                      {ingredient.explanation}
                    </Text>
                    {ingredient.source && (
                      <Text className="text-xs text-dark/35 mt-1.5 italic">
                        Source: {ingredient.source}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alternatives Section */}
        {product.alternatives.length > 0 && (
          <View className="mt-5">
            <Text className="text-lg font-bold text-dark mx-5 mb-3">
              Clean Alternatives
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {product.alternatives.map((alt) => (
                <TouchableOpacity
                  key={alt.id}
                  onPress={() => handleAlternativePress(alt)}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl w-44 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 3,
                  }}
                >
                  <View
                    className="h-28 items-center justify-center"
                    style={{ backgroundColor: "#4CAF50" + "10" }}
                  >
                    {alt.image ? <Text className="text-5xl">{alt.image}</Text> : <Ionicons name="cube-outline" size={48} color="#A8B89C" />}
                  </View>
                  <View className="p-3">
                    <Text className="text-sm font-semibold text-dark" numberOfLines={1}>
                      {alt.name}
                    </Text>
                    <Text className="text-xs text-dark/50 mt-0.5">
                      {alt.brand}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-base font-bold text-sage">
                        {alt.price}
                      </Text>
                      <Badge rating={alt.rating} size="sm" />
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAlternativePress(alt)}
                      className="bg-sage rounded-xl py-2 mt-2 items-center"
                    >
                      <Text className="text-white text-xs font-semibold">
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* DIY Button */}
        {product.diyRecipeId && (
          <TouchableOpacity
            onPress={handleDIY}
            activeOpacity={0.8}
            className="mx-5 mt-5 bg-peach/10 rounded-2xl p-4 flex-row items-center"
            style={{ borderWidth: 1, borderColor: "#F4A574" + "30" }}
          >
            <View className="w-12 h-12 rounded-full bg-peach/20 items-center justify-center mr-3">
              <Ionicons name="flask-outline" size={24} color="#F4A574" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-dark">DIY Instead</Text>
              <Text className="text-xs text-dark/50 mt-0.5">Make a clean version at home</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F4A574" />
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View className="mx-5 mt-6 gap-3">
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            className={`rounded-2xl py-4 flex-row items-center justify-center ${isSaved ? "bg-sage/10" : "bg-sage"}`}
            style={isSaved ? { borderWidth: 1, borderColor: "#8B9E7C" } : undefined}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isSaved ? "#8B9E7C" : "white"}
            />
            <Text className={`font-semibold text-base ml-2 ${isSaved ? "text-sage" : "text-white"}`}>
              {isSaved ? "Product Saved" : "Save Product"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/scan")}
            activeOpacity={0.85}
            className="bg-white rounded-2xl py-4 flex-row items-center justify-center"
            style={{
              borderWidth: 1,
              borderColor: "#e5e5e5",
              shadowColor: "#000",
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

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Food: "",
    Drinks: "",
    Skincare: "",
    Makeup: "",
    Cleaning: "",
    "Personal Care": "",
    Clothing: "",
    Home: "",
    Baby: "",
    Cookware: "",
    Drinkware: "",
  };
  return map[category] || "";
}
