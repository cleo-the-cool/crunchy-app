import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGoBack } from "@/lib/useGoBack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "../utils/haptics";
import { getRecipeById, type Recipe, type Difficulty } from "@/data/recipes";

const SAVED_RECIPES_KEY = "@crunchy_saved_recipes";

function DifficultyStars({ difficulty }: { difficulty: Difficulty }) {
  const count = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 2 : 3;
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Ionicons
          key={i}
          name="star"
          size={14}
          color={i <= count ? "#F4A574" : "#E0E0E0"}
        />
      ))}
      <Text className="text-sm text-dark/60 ml-1">{difficulty}</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const [madeIt, setMadeIt] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );

  const recipe = id ? getRecipeById(id) : undefined;

  useEffect(() => {
    if (!id) return;
    AsyncStorage.getItem(SAVED_RECIPES_KEY).then((val) => {
      if (val) {
        const saved: string[] = JSON.parse(val);
        setIsSaved(saved.includes(id));
      }
    });
  }, [id]);

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-ivory items-center justify-center">
        <Text className="text-5xl mb-4">🤔</Text>
        <Text className="text-lg font-bold text-dark">Recipe not found</Text>
        <TouchableOpacity
          onPress={goBack}
          className="bg-forest rounded-3xl px-6 py-3 mt-4"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    try {
      const val = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
      const saved: string[] = val ? JSON.parse(val) : [];
      if (newSaved) {
        if (!saved.includes(id!)) saved.push(id!);
      } else {
        const idx = saved.indexOf(id!);
        if (idx >= 0) saved.splice(idx, 1);
      }
      await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(saved));
    } catch {
      // Silently handle storage errors
    }
  };

  const handleMadeIt = () => {
    if (madeIt) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMadeIt(true);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out this DIY recipe from Crunchy: ${recipe.title}\n\n${recipe.description}\n\nDownload Crunchy to see the full recipe!`,
      });
    } catch {
      // User cancelled share
    }
  };

  const toggleIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const displayMadeItCount = recipe.madeItCount + (madeIt ? 1 : 0);

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handleSave} hitSlop={8}>
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? "#E57373" : "#3D5A3E"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} hitSlop={8}>
            <Ionicons name="share-outline" size={24} color="#3D5A3E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View
          className="mx-5 h-48 rounded-3xl items-center justify-center"
          style={{ backgroundColor: "#3D5A3E15" }}
        >
          <Text className="text-7xl">{recipe.image}</Text>
        </View>

        {/* Title & Meta */}
        <View className="px-5 mt-4">
          <Text className="text-2xl font-bold text-dark" style={{ fontFamily: 'Georgia' }}>{recipe.title}</Text>
          <Text className="text-sm text-dark/50 mt-1 leading-5">
            {recipe.description}
          </Text>

          {/* Meta Info */}
          <View
            className="flex-row mt-4 bg-white rounded-3xl p-4"
            style={{
              borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
            }}
          >
            <View className="flex-1 items-center">
              <DifficultyStars difficulty={recipe.difficulty} />
              <Text className="text-xs text-dark/40 mt-1">Difficulty</Text>
            </View>
            <View className="w-px bg-dark/10" />
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="#3D5A3E" />
                <Text className="text-sm font-semibold text-dark">
                  {recipe.timeMinutes} min
                </Text>
              </View>
              <Text className="text-xs text-dark/40 mt-1">Time</Text>
            </View>
            <View className="w-px bg-dark/10" />
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <Ionicons name="wallet-outline" size={16} color="#3D5A3E" />
                <Text className="text-sm font-semibold text-dark">
                  {recipe.costEstimate}
                </Text>
              </View>
              <Text className="text-xs text-dark/40 mt-1">Cost</Text>
            </View>
          </View>
        </View>

        {/* Cost Comparison */}
        <View className="px-5 mt-4">
          <View
            className="bg-forest/8 rounded-3xl p-4 flex-row items-center"
          >
            <Ionicons name="trending-down" size={24} color="#3D5A3E" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-dark">
                Save money making your own!
              </Text>
              <Text className="text-xs text-dark/60 mt-0.5">
                DIY: {recipe.costEstimate} vs Store: {recipe.storeBoughtCost}
              </Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>
            Ingredients
          </Text>
          <View
            className="bg-white rounded-3xl p-4"
            style={{
              borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
            }}
          >
            {recipe.ingredients.map((ing, index) => {
              const isChecked = checkedIngredients.has(index);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleIngredient(index)}
                  activeOpacity={0.7}
                  className={`flex-row items-start py-3 ${
                    index < recipe.ingredients.length - 1
                      ? "border-b border-dark/5"
                      : ""
                  }`}
                >
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center mr-3 mt-0.5 ${
                      isChecked ? "bg-forest" : "bg-forest/10"
                    }`}
                  >
                    {isChecked ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : (
                      <Ionicons name="leaf" size={12} color="#3D5A3E" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-medium ${
                        isChecked
                          ? "text-dark/40 line-through"
                          : "text-dark"
                      }`}
                    >
                      {ing.name}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        isChecked ? "text-dark/30" : "text-dark/50"
                      }`}
                    >
                      {ing.quantity}
                      {ing.note ? ` (${ing.note})` : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Steps */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>
            Instructions
          </Text>
          <View style={{ gap: 12 }}>
            {recipe.steps.map((step) => (
              <View
                key={step.step}
                className="bg-white rounded-3xl p-4"
                style={{
                  borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
                }}
              >
                <View className="flex-row items-start">
                  <View
                    className="w-8 h-8 rounded-full bg-forest items-center justify-center mr-3"
                  >
                    <Text className="text-sm font-bold text-white">
                      {step.step}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-dark leading-5">
                      {step.instruction}
                    </Text>
                    {step.tip && (
                      <View className="flex-row items-start mt-2 bg-gold/10 rounded-xl p-2.5">
                        <Ionicons
                          name="bulb-outline"
                          size={14}
                          color="#C4A76C"
                        />
                        <Text className="text-xs text-gold-dark ml-2 flex-1">
                          {step.tip}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {recipe.tips.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>
              Tips
            </Text>
            <View
              className="bg-white rounded-3xl p-4"
              style={{
                borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
              }}
            >
              {recipe.tips.map((tip, index) => (
                <View
                  key={index}
                  className={`flex-row items-start py-2.5 ${
                    index < recipe.tips.length - 1
                      ? "border-b border-dark/5"
                      : ""
                  }`}
                >
                  <Text className="text-forest mr-2">•</Text>
                  <Text className="text-sm text-dark/70 flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Made It Button */}
        <View className="px-5 mt-6">
          <TouchableOpacity
            onPress={handleMadeIt}
            activeOpacity={0.8}
            className={`rounded-3xl py-4 flex-row items-center justify-center ${
              madeIt ? "bg-forest" : "bg-gold"
            }`}
            style={{
              shadowColor: madeIt ? "#3D5A3E" : "#C4A76C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons
              name={madeIt ? "checkmark-circle" : "flask"}
              size={22}
              color="white"
            />
            <Text className="text-white font-bold text-base ml-2">
              {madeIt ? "You made it!" : "I Made It!"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mt-3">
            <Ionicons name="people-outline" size={16} color="#3D5A3E" />
            <Text className="text-sm text-forest ml-1.5">
              {displayMadeItCount.toLocaleString()} people made this
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
