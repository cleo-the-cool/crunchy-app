import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import {
  findProductByBarcode,
  getDefaultProduct,
  type Product,
  type Ingredient,
  type IngredientRisk,
  type Rating,
  type Alternative,
} from "@/data/products";
import { Badge } from "@/components";

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

const RISK_CONFIG: Record<IngredientRisk, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  safe: { color: "#4CAF50", icon: "checkmark-circle", label: "Safe" },
  concern: { color: "#FFC107", icon: "alert-circle", label: "Concern" },
  toxic: { color: "#F44336", icon: "warning", label: "Toxic" },
};

export default function ScanResultScreen() {
  const router = useRouter();
  const { barcode, type } = useLocalSearchParams<{
    barcode?: string;
    type?: string;
  }>();

  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const shareCardRef = useRef<ViewShot>(null);

  const product: Product = barcode
    ? findProductByBarcode(barcode) ?? getDefaultProduct(barcode)
    : getDefaultProduct("unknown");

  const ratingInfo = RATING_CONFIG[product.rating];

  const toggleIngredient = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIngredient(expandedIngredient === name ? null : name);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    } catch {
      // Fallback to text share
    }
    try {
      await Share.share({
        message: `I scanned ${product.name} by ${product.brand} on Crunchy and it's rated ${ratingInfo.label}! Download Crunchy to check your products.`,
      });
    } catch {
      // User cancelled
    }
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

  const ingredientCounts = {
    safe: product.ingredients.filter((i) => i.risk === "safe").length,
    concern: product.ingredients.filter((i) => i.risk === "concern").length,
    toxic: product.ingredients.filter((i) => i.risk === "toxic").length,
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
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
              shadowOpacity: 0.06,
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
              shadowOpacity: 0.06,
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
        {/* Shareable Card - captured by ViewShot */}
        <ViewShot ref={shareCardRef} options={{ format: "png", quality: 1 }}>
          {/* Product Header */}
          <View className="mx-5 mt-2 bg-white rounded-3xl p-5" style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <View className="flex-row items-center">
              {/* Product Image Placeholder */}
              <View
                className="w-20 h-20 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: ratingInfo.color + "15" }}
              >
                <Text className="text-4xl">{product.image}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-dark/40 uppercase font-medium tracking-wide">
                  {product.category}
                </Text>
                <Text className="text-lg font-bold text-dark mt-0.5">
                  {product.name}
                </Text>
                <Text className="text-sm text-dark/50">{product.brand}</Text>
              </View>
            </View>

            {/* Overall Rating */}
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
                </View>
                <Text className="text-sm text-dark/60 mt-1">
                  {ratingInfo.description}
                </Text>
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Ingredient Summary */}
        <View className="flex-row mx-5 mt-4 gap-2">
          <View className="flex-1 bg-white rounded-2xl p-3 items-center" style={{
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}>
            <Text className="text-lg font-bold" style={{ color: "#4CAF50" }}>
              {ingredientCounts.safe}
            </Text>
            <Text className="text-xs text-dark/50">Safe</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 items-center" style={{
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}>
            <Text className="text-lg font-bold" style={{ color: "#FFC107" }}>
              {ingredientCounts.concern}
            </Text>
            <Text className="text-xs text-dark/50">Concern</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 items-center" style={{
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}>
            <Text className="text-lg font-bold" style={{ color: "#F44336" }}>
              {ingredientCounts.toxic}
            </Text>
            <Text className="text-xs text-dark/50">Toxic</Text>
          </View>
        </View>

        {/* Ingredients List */}
        <View className="mx-5 mt-4">
          <Text className="text-lg font-bold text-dark mb-3">Ingredients</Text>
          {product.ingredients.map((ingredient) => {
            const risk = RISK_CONFIG[ingredient.risk];
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
                    style={{ backgroundColor: risk.color + "18" }}
                  >
                    <Ionicons name={risk.icon} size={16} color={risk.color} />
                  </View>
                  <Text className="flex-1 text-base text-dark font-medium">
                    {ingredient.name}
                  </Text>
                  <View className="flex-row items-center">
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
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {/* Product Image */}
                  <View
                    className="h-28 items-center justify-center"
                    style={{ backgroundColor: "#4CAF50" + "10" }}
                  >
                    <Text className="text-5xl">{alt.image}</Text>
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
            style={{
              borderWidth: 1,
              borderColor: "#F4A574" + "30",
            }}
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
      </ScrollView>
    </SafeAreaView>
  );
}
