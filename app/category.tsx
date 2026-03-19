import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGoBack } from "@/lib/useGoBack";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";
import { getRecipesByCategory, type Recipe, type RecipeCategory } from "@/data/recipes";
import { getSavedProducts, unsaveProduct, type SavedProduct } from "@/lib/savedProducts";
import { Swipeable } from "react-native-gesture-handler";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "../utils/haptics";

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  skincare: "Skincare",
  food: "Food & Pantry",
  drinks: "Drinks",
  cleaning: "Cleaning",
  makeup: "Makeup & Beauty",
  wellness: "Wellness & Supplements",
  baby: "Baby & Kids",
  other: "Other",
};

const CATEGORY_SUBTITLES: Record<string, string> = {
  skincare: "Clean beauty & skincare essentials",
  food: "Wholesome pantry staples & snacks",
  drinks: "Beverages worth sipping",
  cleaning: "Non-toxic home cleaning",
  makeup: "Beauty products that actually care",
  wellness: "Supplements & wellness products",
  baby: "Gentle & safe for little ones",
  other: "Everything else",
};

// Maps browse category key → recipe category name
function getRecipeCategoryName(key: string): RecipeCategory | null {
  const map: Record<string, RecipeCategory> = {
    skincare: "Skincare",
    cleaning: "Cleaning",
    food: "Cooking",
    drinks: "Cooking",
    baby: "Personal Care",
    makeup: "Skincare",
    wellness: "Wellness & Supplements",
    other: "Other",
  };
  return map[key] ?? null;
}

// Normalizes a product's category, checking stored category + product name + brand
function normalizeCategoryKey(cat?: string, productName?: string, brand?: string): string {
  // Build a combined string for matching
  const parts = [cat, productName, brand].filter(Boolean).join(" ").toLowerCase();

  // Check for specific product types by name/brand first (more accurate than stored category)
  if (/sparkling water|soda|juice|la croix|lacroix|kombucha|energy drink/i.test(parts) && !/bottle|cup|tumbler/i.test(parts)) return "drinks";
  if (/cleanser|moistur|serum|facial|lotion|sunscreen|la roche|cerave|cetaphil|lip balm|skincare/i.test(parts)) return "skincare";
  if (/ointment|hydrocortisone|ibuprofen|aspirin|supplement|vitamin|medicine|melatonin|probiotic/i.test(parts)) return "wellness";

  // Then check stored category
  if (!cat) return "other";
  const lower = cat.toLowerCase();
  if (lower.includes("food") || lower.includes("cooking") || lower.includes("pantry")) return "food";
  if (lower.includes("drink") || lower.includes("beverage")) return "drinks";
  if (lower.includes("cosmetic")) return "skincare";
  if (lower.includes("skin") || lower.includes("personal care")) return "skincare";
  if (lower.includes("makeup") || lower.includes("beauty")) return "makeup";
  if (lower.includes("clean")) return "cleaning";
  if (lower.includes("supplement") || lower.includes("wellness")) return "wellness";
  if (lower.includes("baby") || lower.includes("kid")) return "baby";
  return "other";
}

function getRatingColor(rating?: string): string {
  switch (rating) {
    case "clean": return "#4CAF50";
    case "caution": return "#FFC107";
    case "avoid": return "#F44336";
    default: return "#999";
  }
}

function getRatingFromScore(score: number): "clean" | "caution" | "avoid" {
  if (score >= 70) return "clean";
  if (score >= 40) return "caution";
  return "avoid";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { user } = useAuth();
  const { key } = useLocalSearchParams<{ key: string }>();

  const categoryKey = key ?? "skincare";
  const label = CATEGORY_LABELS[categoryKey] ?? categoryKey;
  const subtitle = CATEGORY_SUBTITLES[categoryKey] ?? "Explore products and recipes";
  const headerImage = CATEGORY_IMAGES[categoryKey] ?? CATEGORY_IMAGES.skincare;

  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load saved products filtered by this category (user-scoped)
        const all = await getSavedProducts(user?.id);
        const filtered = all.filter((p) => normalizeCategoryKey(p.category, p.name, p.brand) === categoryKey);
        setSavedProducts(filtered);

        // Load recipes for this category
        const recipeCat = getRecipeCategoryName(categoryKey);
        const recipeList = recipeCat ? getRecipesByCategory(recipeCat) : [];
        setRecipes(recipeList);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryKey]);

  const isEmpty = !loading && savedProducts.length === 0 && recipes.length === 0;

  return (
    <View className="flex-1 bg-ivory">
      {/* ── Header ── */}
      <ImageBackground source={headerImage} resizeMode="cover">
        <View style={{ backgroundColor: "rgba(61,90,62,0.55)" }}>
          <SafeAreaView edges={["top"]}>
            <View className="px-6 pt-4 pb-8" style={{ minHeight: 180, justifyContent: "space-between" }}>
              {/* Back button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  goBack();
                }}
                className="flex-row items-center"
                hitSlop={8}
              >
                <Ionicons name="chevron-back" size={22} color="white" />
                <Text className="text-white/90 text-sm font-medium ml-1">Back</Text>
              </TouchableOpacity>

              {/* Title — pinned to bottom of header */}
              <View>
                <Text className="text-3xl font-bold text-white">{label}</Text>
                <Text className="text-sm text-white/70 mt-1">{subtitle}</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>

      {/* ── Content ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty state */}
        {isEmpty && (
          <View className="items-center px-8 py-16">
            <Ionicons name="leaf-outline" size={48} color="#A8B89C" />
            <Text className="text-base font-semibold text-dark/50 mt-4 text-center">
              No saved products or recipes yet
            </Text>
            <Text className="text-sm text-dark/30 mt-2 text-center">
              Scan products or browse recipes to get started
            </Text>
          </View>
        )}

        {/* ── Saved Products ── */}
        {savedProducts.length > 0 && (
          <View className="px-5 mb-6">
            <Text className="text-lg font-bold text-dark mb-3">Saved Products</Text>
            <View style={{ gap: 8 }}>
              {savedProducts.map((item) => {
                const score = item.scanData?.crunchyScore;
                const rating =
                  score != null ? getRatingFromScore(score) : item.rating ?? "caution";
                const ratingColor = getRatingColor(rating);

                const renderRightActions = () => (
                  <TouchableOpacity
                    onPress={async () => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      await unsaveProduct(item.id, user?.id);
                      setSavedProducts((prev) => prev.filter((p) => p.id !== item.id));
                    }}
                    className="bg-red-500 rounded-2xl items-center justify-center ml-2"
                    style={{ width: 80 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                    <Text className="text-white text-xs font-semibold mt-1">Delete</Text>
                  </TouchableOpacity>
                );

                return (
                  <Swipeable key={item.id} renderRightActions={renderRightActions} overshootRight={false}>
                    <TouchableOpacity
                      onPress={() => {
                        if (item.scanData) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push({
                            pathname: "/scan-result",
                            params: {
                              barcodeData: JSON.stringify(item.scanData),
                              source: "saved",
                            },
                          });
                        }
                      }}
                      activeOpacity={0.7}
                      className="bg-white rounded-2xl p-3.5 flex-row items-center"
                      style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: ratingColor + "18" }}
                      >
                        {score != null ? (
                          <Text className="text-xs font-bold" style={{ color: ratingColor }}>
                            {score}
                          </Text>
                        ) : (
                          <Ionicons name="leaf" size={16} color={ratingColor} />
                        )}
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-sm font-semibold text-dark"
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.brand ? (
                          <Text className="text-xs text-dark/50 mt-0.5">{item.brand}</Text>
                        ) : null}
                      </View>

                      <View
                        className="px-2 py-0.5 rounded-full mr-2"
                        style={{ backgroundColor: ratingColor + "18" }}
                      >
                        <Text className="text-xs font-semibold capitalize" style={{ color: ratingColor }}>
                          {rating}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={16} color="#A8B89C" />
                    </TouchableOpacity>
                  </Swipeable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── DIY Recipes ── */}
        {recipes.length > 0 && (
          <View className="px-5">
            <Text className="text-lg font-bold text-dark mb-3">DIY Recipes</Text>
            <View style={{ gap: 8 }}>
              {recipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/recipe-detail",
                      params: { id: recipe.id },
                    });
                  }}
                  activeOpacity={0.7}
                  className="bg-white rounded-2xl p-3.5 flex-row items-center"
                  style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}
                >
                  {/* Emoji icon */}
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: "rgba(61,90,62,0.10)" }}
                  >
                    <Text style={{ fontSize: 20 }}>{recipe.image}</Text>
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-dark"
                      numberOfLines={1}
                    >
                      {recipe.title}
                    </Text>
                    <Text className="text-xs text-dark/50 mt-0.5">
                      {recipe.difficulty} · {recipe.timeMinutes} min
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#A8B89C" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
