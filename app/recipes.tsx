import { useState, useCallback, useMemo } from "react";
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
import * as Haptics from "../utils/haptics";
import {
  RECIPES,
  RECIPE_CATEGORIES,
  type Recipe,
  type RecipeCategory,
  type Difficulty,
} from "@/data/recipes";

const DIFFICULTY_OPTIONS: { label: string; value: Difficulty | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Any time", value: null },
  { label: "< 10 min", value: 10 },
  { label: "< 30 min", value: 30 },
  { label: "< 60 min", value: 60 },
];

function DifficultyStars({ difficulty }: { difficulty: Difficulty }) {
  const count = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 2 : 3;
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Ionicons
          key={i}
          name="star"
          size={12}
          color={i <= count ? "#F4A574" : "#E0E0E0"}
        />
      ))}
      <Text className="text-xs text-dark/50 ml-1">{difficulty}</Text>
    </View>
  );
}

export default function RecipesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<RecipeCategory | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "all">(
    "all"
  );
  const [filterTime, setFilterTime] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const filteredRecipes = useMemo(() => {
    let results = RECIPES;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      results = results.filter((r) => r.category === selectedCategory);
    }

    if (filterDifficulty !== "all") {
      results = results.filter((r) => r.difficulty === filterDifficulty);
    }

    if (filterTime !== null) {
      results = results.filter((r) => r.timeMinutes <= filterTime);
    }

    return results;
  }, [searchQuery, selectedCategory, filterDifficulty, filterTime]);

  const handleCategoryPress = (category: RecipeCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleRecipePress = (recipe: Recipe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe-detail?id=${recipe.id}`);
  };

  const handleSaveToggle = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSavedRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFilterDifficulty("all");
    setFilterTime(null);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== null ||
    filterDifficulty !== "all" ||
    filterTime !== null;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="px-5 pt-3 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-dark">DIY Recipes</Text>
          <Text className="text-sm text-dark/50 mt-0.5">
            Make your own clean products
          </Text>
        </View>
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
            placeholder="Search recipes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
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
        {/* Category Tabs */}
        <View className="mt-4 px-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {RECIPE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => handleCategoryPress(cat.name)}
                  activeOpacity={0.7}
                  className={`rounded-2xl px-4 py-2.5 flex-row items-center ${
                    isSelected ? "bg-sage" : "bg-white"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text className="text-lg mr-1.5">{cat.icon}</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? "text-white" : "text-dark"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Bar */}
        <View className="mt-3 px-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isActive = filterDifficulty === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() =>
                    setFilterDifficulty(opt.value as Difficulty | "all")
                  }
                  className={`px-3.5 py-1.5 rounded-full ${
                    isActive ? "bg-peach" : "bg-white"
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
                    className={`text-xs font-medium ${
                      isActive ? "text-white" : "text-dark/70"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View className="w-px bg-dark/10 mx-1" />
            {TIME_OPTIONS.map((opt) => {
              const isActive = filterTime === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => setFilterTime(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full ${
                    isActive ? "bg-peach" : "bg-white"
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
                    className={`text-xs font-medium ${
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
                className="px-3.5 py-1.5 rounded-full bg-peach/10"
              >
                <Text className="text-xs font-medium text-peach-dark">
                  Clear all
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-sm text-dark/50">
            {filteredRecipes.length}{" "}
            {filteredRecipes.length === 1 ? "recipe" : "recipes"} found
          </Text>
        </View>

        {/* Recipe List */}
        {filteredRecipes.length === 0 ? (
          <View className="items-center px-5 mt-12">
            <Text className="text-5xl mb-4">🧪</Text>
            <Text className="text-lg font-bold text-dark text-center">
              No recipes found
            </Text>
            <Text className="text-sm text-dark/50 text-center mt-2">
              Try a different search or adjust your filters
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
        ) : (
          <View className="px-5" style={{ gap: 12 }}>
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={savedRecipes.has(recipe.id)}
                onPress={() => handleRecipePress(recipe)}
                onSave={() => handleSaveToggle(recipe.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecipeCard({
  recipe,
  isSaved,
  onPress,
  onSave,
}: {
  recipe: Recipe;
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
      {/* Hero Image Area */}
      <View
        className="h-32 items-center justify-center"
        style={{ backgroundColor: "#8B9E7C15" }}
      >
        <Text className="text-5xl">{recipe.image}</Text>
      </View>

      {/* Card Content */}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text
              className="text-base font-semibold text-dark"
              numberOfLines={1}
            >
              {recipe.title}
            </Text>
            <Text
              className="text-xs text-dark/50 mt-1"
              numberOfLines={2}
            >
              {recipe.description}
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

        {/* Meta Row */}
        <View className="flex-row items-center mt-3 gap-3">
          <DifficultyStars difficulty={recipe.difficulty} />
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#999" />
            <Text className="text-xs text-dark/50">{recipe.timeMinutes} min</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="wallet-outline" size={14} color="#999" />
            <Text className="text-xs text-dark/50">{recipe.costEstimate}</Text>
          </View>
        </View>

        {/* Made It Counter */}
        <View className="flex-row items-center mt-2">
          <Ionicons name="people-outline" size={14} color="#8B9E7C" />
          <Text className="text-xs text-sage ml-1">
            {recipe.madeItCount.toLocaleString()} people made this
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
