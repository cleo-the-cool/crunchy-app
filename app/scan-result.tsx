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
import {
  getScoreBreakdown,
  TIER_CONFIG,
  type CategoryScores,
  type UserPreferences,
  type ToxinIngredient,
} from "@/lib/scoring";

// ─── Constants ───────────────────────────────────────────────────────

const RATING_CONFIG: Record<
  Rating,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bg: string;
    label: string;
    description: string;
  }
> = {
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

const NOVA_DESCRIPTIONS: Record<number, string> = {
  1: "Whole food",
  2: "Processed culinary",
  3: "Processed",
  4: "Ultra-processed",
};

const PREF_TO_CATEGORY_KEY: Record<string, keyof CategoryScores> = {
  toxins: "toxins_additives",
  nutrition: "nutrition",
  animal_welfare: "animal_welfare",
  sustainability: "sustainability",
  fair_trade: "fair_trade",
};

const CARD_SHADOW = {
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.08)",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

// ─── Helpers ─────────────────────────────────────────────────────────

function getScorePillColor(score: number | null | undefined): string {
  if (score == null) return "#999";
  if (score >= 70) return "#4CAF50";
  if (score >= 40) return "#FFC107";
  return "#F44336";
}

function getIngredientTier(ingredient: { tier?: string; risk?: string }): keyof typeof TIER_CONFIG {
  if (ingredient.tier && ingredient.tier in TIER_CONFIG) {
    return ingredient.tier as keyof typeof TIER_CONFIG;
  }
  const legacyMap: Record<string, keyof typeof TIER_CONFIG> = {
    safe: "safe",
    concern: "limited",
    toxic: "high",
  };
  return legacyMap[ingredient.risk || ""] || "limited";
}

const TIER_ORDER: Record<string, number> = { high: 0, moderate: 1, limited: 2, safe: 3 };

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Food: "🍎",
    Drinks: "🥤",
    Skincare: "✨",
    Makeup: "💄",
    Cleaning: "🧹",
    "Personal Care": "🧴",
    Clothing: "👕",
    Home: "🏠",
    Baby: "👶",
    Cookware: "🍳",
    Drinkware: "🥛",
  };
  return map[category] || "📦";
}

// ─── Animation ───────────────────────────────────────────────────────

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
      style={[
        checkStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          ringStyle,
          {
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 3,
            borderColor: color,
          },
        ]}
      />
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: color,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="checkmark" size={40} color="white" />
      </View>
    </Animated.View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function truncateBullet(text: string, maxWords: number = 12): string {
  // Take first sentence only, then cap at maxWords
  const firstSentence = text.split(/[.!?]/)[0].trim();
  const words = firstSentence.split(/\s+/);
  if (words.length <= maxWords) return firstSentence;
  return words.slice(0, maxWords).join(" ") + "...";
}

function Bullet({ text, icon, iconColor }: { text: string; icon?: keyof typeof Ionicons.glyphMap; iconColor?: string }) {
  return (
    <View className="flex-row items-start mt-1.5">
      {icon ? (
        <Ionicons name={icon} size={14} color={iconColor || "#999"} style={{ marginTop: 2, marginRight: 6 }} />
      ) : (
        <Text className="text-dark/40 mr-2">•</Text>
      )}
      <Text className="text-sm text-dark/70 flex-1">{truncateBullet(text)}</Text>
    </View>
  );
}

function ScorePill({ score }: { score: number | null | undefined }) {
  const color = getScorePillColor(score);
  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: color }}>
      <Text className="text-white text-xs font-bold">
        {score != null ? score : "No data"}
      </Text>
    </View>
  );
}

function SectionHeader({ text }: { text: string }) {
  return (
    <Text className="text-xs font-semibold text-dark/50 uppercase tracking-wide mt-3 mb-1.5">
      {text}
    </Text>
  );
}

// ─── Category Card Components ────────────────────────────────────────

function ToxinsCard({
  data,
  expandedIngredient,
  onToggle,
}: {
  data: NonNullable<CategoryScores["toxins_additives"]>;
  expandedIngredient: string | null;
  onToggle: (name: string) => void;
}) {
  const { risk_breakdown, ingredients, summary } = data;

  const sortedIngredients = [...(ingredients || [])].sort(
    (a, b) => (TIER_ORDER[a.tier] ?? 2) - (TIER_ORDER[b.tier] ?? 2)
  );

  const safeCount = risk_breakdown?.safe ?? 0;
  const limitedCount = risk_breakdown?.limited ?? 0;
  const moderateCount = risk_breakdown?.moderate ?? 0;
  const highCount = risk_breakdown?.high ?? 0;

  return (
    <View className="p-4">
      {summary ? <Bullet text={summary} /> : null}
      <Bullet text={`${safeCount} safe, ${limitedCount + moderateCount} concern, ${highCount} flagged`} />

      {sortedIngredients.length > 0 && (
        <>
          <SectionHeader text="Ingredients" />
          {sortedIngredients.map((ingredient) => {
            const tier = ingredient.tier || "safe";
            const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.safe;
            const isExpanded = expandedIngredient === ingredient.name;

            return (
              <TouchableOpacity
                key={ingredient.name}
                onPress={() => onToggle(ingredient.name)}
                activeOpacity={0.7}
                className="bg-cream/50 rounded-xl mb-1.5 overflow-hidden"
              >
                <View className="flex-row items-center p-3">
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center mr-2.5"
                    style={{ backgroundColor: config.color + "18" }}
                  >
                    <Ionicons name={config.icon} size={14} color={config.color} />
                  </View>
                  <Text className="flex-1 text-sm text-dark font-medium">
                    {ingredient.name}
                  </Text>
                  <Text className="text-xs font-semibold mr-2" style={{ color: config.color }}>
                    {config.label}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="#999"
                  />
                </View>
                {isExpanded && (
                  <View className="px-3 pb-3" style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}>
                    <Text className="text-sm text-dark/60 leading-5 mt-2">
                      {ingredient.concern || "No additional details"}
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
        </>
      )}
    </View>
  );
}

function NutritionCard({ data }: { data: NonNullable<CategoryScores["nutrition"]> }) {
  const { summary, nova_level, breakdown } = data;
  return (
    <View className="p-4">
      {summary ? <Bullet text={summary} /> : null}
      {nova_level != null && (
        <Bullet text={`NOVA Level ${nova_level} — ${NOVA_DESCRIPTIONS[nova_level] || "Unknown"}`} />
      )}
      {breakdown && (
        <>
          <Bullet text={`Added sugar: ${breakdown.added_sugar}`} />
          <Bullet text={`Fiber: ${breakdown.fiber}`} />
          <Bullet text={`Processing: ${breakdown.processing_level}`} />
          {breakdown.artificial_sweeteners && (
            <Bullet text="Contains artificial sweeteners" icon="alert-circle" iconColor="#FFC107" />
          )}
        </>
      )}
    </View>
  );
}

function AnimalWelfareCard({ data }: { data: NonNullable<CategoryScores["animal_welfare"]> }) {
  const { findings, certifications, data_confidence } = data;
  return (
    <View className="p-4">
      {(findings || []).slice(0, 3).map((f, i) => (
        <Bullet key={i} text={f} />
      ))}
      {certifications && certifications.length > 0 && (
        <Bullet text={`Certified: ${certifications.join(", ")}`} icon="ribbon-outline" iconColor="#8B9E7C" />
      )}
      {data_confidence && (
        <Text className="text-xs text-dark/35 mt-2 italic">
          Based on {data_confidence} data
        </Text>
      )}
    </View>
  );
}

function SustainabilityCard({ data }: { data: NonNullable<CategoryScores["sustainability"]> }) {
  const { findings, data_confidence } = data;
  return (
    <View className="p-4">
      {(findings || []).slice(0, 3).map((f, i) => (
        <Bullet key={i} text={f} />
      ))}
      {data_confidence && (
        <Text className="text-xs text-dark/35 mt-2 italic">
          Based on {data_confidence} data
        </Text>
      )}
    </View>
  );
}

function FairTradeCard({ data }: { data: NonNullable<CategoryScores["fair_trade"]> }) {
  const { findings, data_confidence } = data;
  return (
    <View className="p-4">
      {(findings || []).slice(0, 3).map((f, i) => (
        <Bullet key={i} text={f} />
      ))}
      {data_confidence && (
        <Text className="text-xs text-dark/35 mt-2 italic">
          Based on {data_confidence} data
        </Text>
      )}
    </View>
  );
}

function LegacyAnalysisCard({
  ingredients,
  concerns,
  expandedIngredient,
  onToggle,
}: {
  ingredients: DisplayProduct["ingredients"];
  concerns: string[];
  expandedIngredient: string | null;
  onToggle: (name: string) => void;
}) {
  const sorted = [...ingredients].sort((a, b) => {
    const aTier = getIngredientTier(a);
    const bTier = getIngredientTier(b);
    return (TIER_ORDER[aTier] ?? 2) - (TIER_ORDER[bTier] ?? 2);
  });

  return (
    <View className="mx-5 mt-3 bg-white rounded-2xl overflow-hidden" style={CARD_SHADOW}>
      <View className="flex-row items-center justify-between p-4 pb-0">
        <View className="flex-row items-center">
          <Text className="text-base mr-2">📊</Text>
          <Text className="text-base font-bold text-dark">Analysis</Text>
        </View>
      </View>
      <View className="p-4">
        {concerns.map((c, i) => (
          <Bullet key={i} text={c} icon="alert-circle" iconColor="#FFC107" />
        ))}
        {sorted.length > 0 && <SectionHeader text="Ingredients" />}
        {sorted.map((ingredient) => {
          const tier = getIngredientTier(ingredient);
          const config = TIER_CONFIG[tier];
          const isExpanded = expandedIngredient === ingredient.name;
          return (
            <TouchableOpacity
              key={ingredient.name}
              onPress={() => onToggle(ingredient.name)}
              activeOpacity={0.7}
              className="bg-cream/50 rounded-xl mb-1.5 overflow-hidden"
            >
              <View className="flex-row items-center p-3">
                <View
                  className="w-7 h-7 rounded-full items-center justify-center mr-2.5"
                  style={{ backgroundColor: config.color + "18" }}
                >
                  <Ionicons name={config.icon} size={14} color={config.color} />
                </View>
                <Text className="flex-1 text-sm text-dark font-medium">
                  {ingredient.name}
                </Text>
                <Text className="text-xs font-semibold mr-2" style={{ color: config.color }}>
                  {config.label}
                </Text>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#999"
                />
              </View>
              {isExpanded && (
                <View className="px-3 pb-3" style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}>
                  <Text className="text-sm text-dark/60 leading-5 mt-2">
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
    </View>
  );
}

// ─── Types ───────────────────────────────────────────────────────────

interface DisplayProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  rating: Rating;
  crunchyScore?: number;
  barcode: string;
  ingredients: Array<{
    name: string;
    risk: IngredientRisk;
    explanation: string;
    tier?: string;
    source?: string | null;
  }>;
  alternatives: Alternative[];
  diyRecipeId?: string;
  concerns?: string[];
  summary?: string;
  categoryScores?: CategoryScores;
}

// ─── Main Screen ─────────────────────────────────────────────────────

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

  // ─── Build display product ──────────────────────────────────────
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
  const categoryScores = product.categoryScores;

  // Active preference categories sorted by weight
  const activeCategories = PREFERENCE_OPTIONS.filter(
    (opt) => preferences[opt.key] > 0
  ).sort((a, b) => preferences[b.key] - preferences[a.key]);

  // Score breakdown
  const scoreBreakdown = categoryScores
    ? getScoreBreakdown(categoryScores, preferences)
    : null;

  // ─── Handlers ───────────────────────────────────────────────────

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
      await saveProduct(
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          barcode: product.barcode,
          rating: product.rating,
          image: product.image,
          category: product.category,
          scanData: barcodeData ? JSON.parse(barcodeData) : undefined,
          savedAt: new Date().toISOString(),
        },
        user?.id
      );
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
      const scoreText = product.crunchyScore
        ? ` (Score: ${product.crunchyScore}/100)`
        : "";
      await Share.share({
        message: `I scanned ${product.name} by ${product.brand} on Crunchy Living and it's rated ${ratingInfo.label}${scoreText}!\n\nDownload Crunchy Living to check your products.`,
      });
    } catch {}
  };

  // ─── Render category card content ───────────────────────────────

  function renderCategoryContent(prefKey: string) {
    if (!categoryScores) return null;
    const catKey = PREF_TO_CATEGORY_KEY[prefKey];
    if (!catKey) return null;
    const data = categoryScores[catKey];
    if (!data) return <View className="p-4"><Bullet text="No data available for this category" /></View>;

    switch (catKey) {
      case "toxins_additives":
        return (
          <ToxinsCard
            data={data as NonNullable<CategoryScores["toxins_additives"]>}
            expandedIngredient={expandedIngredient}
            onToggle={toggleIngredient}
          />
        );
      case "nutrition":
        return <NutritionCard data={data as NonNullable<CategoryScores["nutrition"]>} />;
      case "animal_welfare":
        return <AnimalWelfareCard data={data as NonNullable<CategoryScores["animal_welfare"]>} />;
      case "sustainability":
        return <SustainabilityCard data={data as NonNullable<CategoryScores["sustainability"]>} />;
      case "fair_trade":
        return <FairTradeCard data={data as NonNullable<CategoryScores["fair_trade"]>} />;
      default:
        return null;
    }
  }

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {showSuccess && source !== "history" && (
        <ScanSuccessAnimation color={ratingInfo.color} />
      )}

      {/* Top Bar */}
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
        {/* ── 1. Product Header Card (shareable) ── */}
        <ViewShot ref={shareCardRef} options={{ format: "png", quality: 1 }}>
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            className="mx-5 mt-2 rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <ImageBackground
              source={getCategoryImage(product.category)}
              resizeMode="cover"
            >
              <View
                className="px-5 pt-5 pb-4"
                style={{ backgroundColor: "rgba(61,90,62,0.7)" }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    {product.image ? (
                      <Text className="text-3xl">{product.image}</Text>
                    ) : (
                      <Ionicons
                        name="cube-outline"
                        size={28}
                        color="rgba(255,255,255,0.7)"
                      />
                    )}
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

            {/* ── 2. Score Card ── */}
            <View className="bg-white px-5 pb-5">
              <View className="mt-4 flex-row items-center">
                {/* Big score circle */}
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: ratingInfo.color + "20" }}
                >
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: ratingInfo.color }}
                  >
                    {product.crunchyScore ?? "—"}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Badge rating={product.rating} size="sm" />
                    <Text
                      className="text-lg font-bold"
                      style={{ color: ratingInfo.color }}
                    >
                      {ratingInfo.label}
                    </Text>
                  </View>
                  <Text
                    className="text-sm text-dark/60 mt-1"
                    numberOfLines={2}
                  >
                    {product.summary || ratingInfo.description}
                  </Text>
                </View>
              </View>

              <View
                className="flex-row items-center justify-center mt-3 pt-3"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "rgba(0,0,0,0.06)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "JosefinSans-Thin",
                    fontSize: 16,
                    color: "rgba(61,90,62,0.35)",
                    letterSpacing: 1,
                  }}
                >
                  Scanned with Crunchy Living
                </Text>
              </View>
            </View>
          </Animated.View>
        </ViewShot>

        {/* ── 3. Preference Category Cards ── */}
        {categoryScores ? (
          activeCategories.map((opt) => {
            const catKey = PREF_TO_CATEGORY_KEY[opt.key];
            const catData = catKey ? categoryScores[catKey] : undefined;
            const score = catData?.score ?? null;

            return (
              <View
                key={opt.key}
                className="mx-5 mt-3 bg-white rounded-2xl overflow-hidden"
                style={CARD_SHADOW}
              >
                {/* Card header */}
                <View className="flex-row items-center justify-between p-4 pb-0">
                  <View className="flex-row items-center">
                    <Text className="text-base mr-2">{opt.icon}</Text>
                    <Text className="text-base font-bold text-dark">
                      {opt.label}
                    </Text>
                  </View>
                  <ScorePill score={score} />
                </View>
                {/* Card content */}
                {renderCategoryContent(opt.key)}
              </View>
            );
          })
        ) : (
          /* Legacy fallback — no categoryScores */
          <LegacyAnalysisCard
            ingredients={product.ingredients}
            concerns={product.concerns || []}
            expandedIngredient={expandedIngredient}
            onToggle={toggleIngredient}
          />
        )}

        {/* ── 4. "Why this score?" ── */}
        {scoreBreakdown && scoreBreakdown.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowScoreBreakdown(!showScoreBreakdown);
            }}
            activeOpacity={0.8}
            className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden"
            style={CARD_SHADOW}
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#3D5A3E"
                />
                <Text className="text-base font-bold text-dark ml-2">
                  Why this score?
                </Text>
              </View>
              <Ionicons
                name={showScoreBreakdown ? "chevron-up" : "chevron-down"}
                size={18}
                color="#999"
              />
            </View>

            {showScoreBreakdown && (
              <View
                className="px-4 pb-4"
                style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}
              >
                {scoreBreakdown.map((item) => {
                  if (item.weight === 0) return null;
                  const scoreColor = getScorePillColor(item.score);
                  const prefOpt = PREFERENCE_OPTIONS.find(
                    (p) => PREF_TO_CATEGORY_KEY[p.key] === item.category
                  );
                  const icon = prefOpt?.icon || "📊";
                  return (
                    <View key={item.category} className="mt-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1">
                          <Text className="text-base mr-2">{icon}</Text>
                          <Text className="text-sm font-medium text-dark">
                            {item.label}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-xs text-dark/40 mr-2">
                            Weight: {Math.round(item.weight * 100)}%
                          </Text>
                          <Text
                            className="text-sm font-bold"
                            style={{ color: scoreColor }}
                          >
                            {item.score !== null ? `${item.score}` : "No data"}
                          </Text>
                        </View>
                      </View>
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
                  onPress={() =>
                    router.push({
                      pathname: "/onboarding-preferences",
                      params: { from: "settings" },
                    })
                  }
                  className="flex-row items-center justify-center mt-4 pt-3"
                  style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}
                >
                  <Ionicons name="settings-outline" size={14} color="#3D5A3E" />
                  <Text className="text-sm text-forest font-medium ml-1">
                    Adjust in Settings
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* ── 5. DIY (only if recipe exists) ── */}
        {product.diyRecipeId && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/recipe-detail?id=${product.diyRecipeId}`);
            }}
            activeOpacity={0.8}
            className="mx-5 mt-4 bg-peach/10 rounded-2xl p-4 flex-row items-center"
            style={{ borderWidth: 1, borderColor: "#F4A574" + "30" }}
          >
            <View className="w-12 h-12 rounded-full bg-peach/20 items-center justify-center mr-3">
              <Ionicons name="flask-outline" size={24} color="#F4A574" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-dark">
                DIY Instead
              </Text>
              <Text className="text-xs text-dark/50 mt-0.5">
                Make a clean version at home
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F4A574" />
          </TouchableOpacity>
        )}

        {/* ── 6. Action Buttons ── */}
        <View className="mx-5 mt-6 gap-3">
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            className={`rounded-2xl py-4 flex-row items-center justify-center ${
              isSaved ? "bg-sage/10" : "bg-sage"
            }`}
            style={
              isSaved
                ? { borderWidth: 1, borderColor: "#8B9E7C" }
                : undefined
            }
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isSaved ? "#8B9E7C" : "white"}
            />
            <Text
              className={`font-semibold text-base ml-2 ${
                isSaved ? "text-sage" : "text-white"
              }`}
            >
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
