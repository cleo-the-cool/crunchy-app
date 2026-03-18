import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../../utils/haptics";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";
import { analyzeProductByName } from "@/services/gemini";
import { getRecipesByCategory } from "@/data/recipes";
import { getSavedProducts, type SavedProduct } from "@/lib/savedProducts";

interface BrowseCategory {
  key: string;
  label: string;
}

const BROWSE_CATEGORIES: BrowseCategory[] = [
  { key: "skincare", label: "Skincare" },
  { key: "food", label: "Food & Pantry" },
  { key: "drinks", label: "Drinks" },
  { key: "cleaning", label: "Cleaning" },
  { key: "makeup", label: "Makeup & Beauty" },
  { key: "wellness", label: "Wellness & Supplements" },
  { key: "baby", label: "Baby & Kids" },
];

// Map browse category keys to recipe category names
function getRecipeCategoryName(key: string): string | null {
  const map: Record<string, string> = {
    skincare: "Skincare",
    cleaning: "Cleaning",
    food: "Home",
    drinks: "Home",
    baby: "Personal Care",
    makeup: "Skincare",
    wellness: "Personal Care",
  };
  return map[key] || null;
}

function normalizeCategoryKey(cat?: string): string {
  if (!cat) return "other";
  const lower = cat.toLowerCase();
  if (lower.includes("food") || lower.includes("cooking") || lower.includes("pantry")) return "food";
  if (lower.includes("drink") || lower.includes("beverage")) return "drinks";
  if (lower.includes("skin") || lower.includes("personal care")) return "skincare";
  if (lower.includes("makeup") || lower.includes("cosmetic") || lower.includes("beauty")) return "makeup";
  if (lower.includes("clean")) return "cleaning";
  if (lower.includes("wellness") || lower.includes("supplement")) return "wellness";
  if (lower.includes("baby") || lower.includes("kid")) return "baby";
  return "other";
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryRecipes, setCategoryRecipes] = useState<any[]>([]);
  const [categorySavedProducts, setCategorySavedProducts] = useState<SavedProduct[]>([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSearching(true);

    try {
      const analysis = await analyzeProductByName(query);
      router.push({
        pathname: "/scan-result",
        params: {
          barcodeData: JSON.stringify(analysis),
          source: "search",
        },
      });
    } catch (error: any) {
      if (error.message === "SCANNER_RATE_LIMITED") {
        Alert.alert("Rate Limited", "Too many searches today. Please try again tomorrow.");
      } else {
        Alert.alert("Search Failed", "Could not analyze this product. Please try again.");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleCategoryPress = async (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (expandedCategory === key) {
      setExpandedCategory(null);
      setCategoryRecipes([]);
      setCategorySavedProducts([]);
      return;
    }

    setExpandedCategory(key);

    // Load recipes for category
    const recipeCat = getRecipeCategoryName(key);
    const recipes = recipeCat ? getRecipesByCategory(recipeCat as any) : [];
    setCategoryRecipes(recipes.slice(0, 5));

    // Load saved products for category
    const saved = await getSavedProducts();
    const filtered = saved.filter((p) => normalizeCategoryKey(p.category) === key);
    setCategorySavedProducts(filtered);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "clean": return "#4CAF50";
      case "caution": return "#FFC107";
      case "avoid": return "#F44336";
      default: return "#999";
    }
  };

  return (
    <View className="flex-1 bg-ivory">
      {/* Hero Header */}
      <ImageBackground
        source={require("@/assets/images/aesthetic/forest-canopy.jpg")}
        resizeMode="cover"
      >
        <View style={{ backgroundColor: "rgba(61,90,62,0.55)" }}>
          <SafeAreaView edges={["top"]}>
            <View className="px-6 pt-6 pb-8">
              <Text className="text-3xl font-bold text-white">Search</Text>
              <Text className="text-sm text-white/70 mt-0.5">
                Search any product to analyze it
              </Text>

              {/* Search Bar */}
              <View className="mt-4">
                <View
                  className="bg-white rounded-3xl flex-row items-center px-4 py-3"
                  style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}
                >
                  <Ionicons name="search" size={20} color="#A8B89C" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-dark"
                    placeholder="Search any product..."
                    placeholderTextColor="#999"
                    value={searchInput}
                    onChangeText={setSearchInput}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                    editable={!searching}
                  />
                  {searching ? (
                    <ActivityIndicator size="small" color="#3D5A3E" />
                  ) : searchInput.length > 0 ? (
                    <TouchableOpacity onPress={() => setSearchInput("")}>
                      <Ionicons name="close-circle" size={20} color="#A8B89C" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5A3E" />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Searching indicator */}
        {searching && (
          <View className="items-center px-5 mt-10">
            <ActivityIndicator size="large" color="#3D5A3E" />
            <Text className="text-base font-semibold text-dark mt-4">Analyzing product...</Text>
            <Text className="text-sm text-dark/40 text-center mt-1">
              This may take a few seconds
            </Text>
          </View>
        )}

        {/* Category Grid */}
        {!searching && (
          <View className="px-5 mt-5">
            <Text className="text-lg font-bold text-dark mb-3">
              Browse by Category
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {BROWSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat.key)}
                  activeOpacity={0.8}
                  style={{ width: "48%", flexGrow: 1 }}
                >
                  <ImageBackground
                    source={CATEGORY_IMAGES[cat.key]}
                    resizeMode="cover"
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <View
                      className="rounded-2xl px-4 py-5 justify-end"
                      style={{
                        backgroundColor: expandedCategory === cat.key ? "rgba(61,90,62,0.6)" : "rgba(0,0,0,0.35)",
                        height: 100,
                        borderWidth: expandedCategory === cat.key ? 2 : 0,
                        borderColor: "#fff",
                        borderRadius: 16,
                      }}
                    >
                      <Text className="text-white font-bold text-base">{cat.label}</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Expanded Category Content */}
        {!searching && expandedCategory && (
          <View className="px-5 mt-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-dark">
                {BROWSE_CATEGORIES.find((c) => c.key === expandedCategory)?.label}
              </Text>
              <TouchableOpacity onPress={() => { setExpandedCategory(null); setCategoryRecipes([]); setCategorySavedProducts([]); }}>
                <Text className="text-sm text-forest font-medium">Close</Text>
              </TouchableOpacity>
            </View>

            {/* Saved Products in this Category */}
            {categorySavedProducts.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-dark/60 mb-2">Saved Products</Text>
                <View style={{ gap: 8 }}>
                  {categorySavedProducts.map((item) => {
                    const score = item.scanData?.crunchyScore;
                    const rating = score != null ? (score >= 70 ? "clean" : score >= 40 ? "caution" : "avoid") : item.rating;
                    const ratingColor = getRatingColor(rating || "caution");
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          if (item.scanData) {
                            router.push({
                              pathname: "/scan-result",
                              params: { barcodeData: JSON.stringify(item.scanData), source: "saved" },
                            });
                          }
                        }}
                        activeOpacity={0.7}
                        className="bg-white rounded-2xl p-3.5 flex-row items-center"
                        style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}
                      >
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-dark" numberOfLines={1}>{item.name}</Text>
                          {item.brand && <Text className="text-xs text-dark/50 mt-0.5">{item.brand}</Text>}
                        </View>
                        {score != null && (
                          <View className="px-2 py-1 rounded-full mr-2" style={{ backgroundColor: ratingColor + "18" }}>
                            <Text className="text-xs font-bold" style={{ color: ratingColor }}>{score}</Text>
                          </View>
                        )}
                        <Ionicons name="chevron-forward" size={16} color="#A8B89C" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Recipes in this Category */}
            {categoryRecipes.length > 0 && (
              <View>
                <Text className="text-sm font-semibold text-dark/60 mb-2">DIY Recipes</Text>
                <View style={{ gap: 8 }}>
                  {categoryRecipes.map((recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push({ pathname: "/recipe-detail", params: { id: recipe.id } });
                      }}
                      activeOpacity={0.7}
                      className="bg-white rounded-2xl p-3.5 flex-row items-center"
                      style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}
                    >
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-dark" numberOfLines={1}>{recipe.title}</Text>
                        <Text className="text-xs text-dark/50 mt-0.5">{recipe.difficulty} · {recipe.time}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#A8B89C" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {categorySavedProducts.length === 0 && categoryRecipes.length === 0 && (
              <View className="items-center py-6">
                <Ionicons name="leaf-outline" size={32} color="#A8B89C" />
                <Text className="text-sm text-dark/40 mt-2">No saved products or recipes in this category yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
