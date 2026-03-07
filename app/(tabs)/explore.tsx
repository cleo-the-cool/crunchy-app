import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../../utils/haptics";
import { Badge, ProductCardSkeleton } from "@/components";
import {
  PRODUCTS,
  CATEGORIES,
  type Product,
  type Rating,
  type ProductCategory,
} from "@/data/products";
import { RECIPES, type Recipe } from "@/data/recipes";

type FilterRating = Rating | "all";

const FILTER_OPTIONS: { label: string; value: FilterRating }[] = [
  { label: "All", value: "all" },
  { label: "Clean", value: "clean" },
  { label: "Caution", value: "caution" },
  { label: "Avoid", value: "avoid" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [filterRating, setFilterRating] = useState<FilterRating>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  // Simulate initial load
  useState(() => {
    setTimeout(() => setIsLoading(false), 600);
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const filteredProducts = useMemo(() => {
    let results = PRODUCTS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      results = results.filter((p) => p.category === selectedCategory);
    }

    if (filterRating !== "all") {
      results = results.filter((p) => p.rating === filterRating);
    }

    return results;
  }, [searchQuery, selectedCategory, filterRating]);

  // Search recipes when there's a search query
  const matchingRecipes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return RECIPES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery]);

  const handleCategoryPress = (category: ProductCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleProductPress = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product-detail?barcode=${product.barcode}`);
  };

  const handleSaveToggle = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory(null);
    setFilterRating("all");
  };

  const hasActiveFilters =
    searchInput.trim() !== "" ||
    selectedCategory !== null ||
    filterRating !== "all";

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-2xl font-bold text-dark">Explore</Text>
        <Text className="text-sm text-dark/50 mt-0.5">
          Discover clean alternatives
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 mt-2">
        <View
          className="bg-white rounded-2xl flex-row items-center px-4 py-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            className="flex-1 ml-3 text-base text-dark"
            placeholder="Search products, recipes, brands..."
            placeholderTextColor="#999"
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchInput(""); setSearchQuery(""); }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B9E7C"
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Grid */}
        <View className="px-5 mt-4">
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => handleCategoryPress(cat.name)}
                  activeOpacity={0.7}
                  className={`rounded-2xl p-3 items-center justify-center ${
                    isSelected ? "bg-sage" : "bg-white"
                  }`}
                  style={{
                    width: "31%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.12 : 0.06,
                    shadowRadius: 6,
                    elevation: isSelected ? 4 : 2,
                  }}
                >
                  <Text className="text-2xl mb-1">{cat.icon}</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-white" : "text-dark"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filter Bar */}
        <View className="mt-4 px-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {FILTER_OPTIONS.map((opt) => {
              const isActive = filterRating === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setFilterRating(opt.value)}
                  className={`px-4 py-2 rounded-full ${
                    isActive ? "bg-sage" : "bg-white"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isActive ? "text-white" : "text-dark/70"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={clearFilters}
                className="px-4 py-2 rounded-full bg-peach/10"
              >
                <Text className="text-sm font-medium text-peach-dark">
                  Clear all
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Recipe Results (shown when searching) */}
        {matchingRecipes.length > 0 && (
          <View className="px-5 mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-dark">
                Recipes ({matchingRecipes.length})
              </Text>
              <TouchableOpacity onPress={() => router.push("/recipes")}>
                <Text className="text-sm text-sage font-medium">See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {matchingRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/recipe-detail?id=${recipe.id}`);
                  }}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl p-3 items-center"
                  style={{
                    width: 120,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <Text className="text-3xl mb-1">{recipe.image}</Text>
                  <Text className="text-xs font-semibold text-dark text-center" numberOfLines={2}>
                    {recipe.title}
                  </Text>
                  <Text className="text-xs text-dark/40 mt-0.5">{recipe.timeMinutes} min</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results Count */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-sm text-dark/50">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} found
          </Text>
        </View>

        {/* Product List */}
        {isLoading ? (
          <View className="px-5" style={{ gap: 12 }}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : filteredProducts.length === 0 && matchingRecipes.length === 0 ? (
          <View className="items-center px-5 mt-12">
            <Text className="text-5xl mb-4">🔍</Text>
            <Text className="text-lg font-bold text-dark text-center">
              No results found
            </Text>
            <Text className="text-sm text-dark/50 text-center mt-2">
              {searchQuery.trim()
                ? "Try a different search term or adjust your filters"
                : "Try adjusting your filters to see more products"}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={clearFilters}
                className="bg-sage rounded-2xl px-6 py-3 mt-4"
              >
                <Text className="text-white font-semibold">Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : filteredProducts.length === 0 ? (
          <View className="px-5 mt-4">
            <Text className="text-sm text-dark/50">
              No matching products found
            </Text>
          </View>
        ) : (
          <View className="px-5" style={{ gap: 12 }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSaved={savedItems.has(product.id)}
                onPress={() => handleProductPress(product)}
                onSave={() => handleSaveToggle(product.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({
  product,
  isSaved,
  onPress,
  onSave,
}: {
  product: Product;
  isSaved: boolean;
  onPress: () => void;
  onSave: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row p-4">
        {/* Product Image */}
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mr-3"
          style={{
            backgroundColor:
              product.rating === "clean"
                ? "#4CAF5015"
                : product.rating === "caution"
                ? "#FFC10715"
                : "#F4433615",
          }}
        >
          <Text className="text-3xl">{product.image}</Text>
        </View>

        {/* Product Info */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-2">
              <Text
                className="text-base font-semibold text-dark"
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text className="text-xs text-dark/50 mt-0.5">
                {product.brand}
              </Text>
            </View>
            <TouchableOpacity onPress={onSave} hitSlop={8}>
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isSaved ? "#8B9E7C" : "#999"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mt-2 gap-2">
            <Badge rating={product.rating} size="sm" />
            <Text className="text-xs text-dark/40">{product.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
