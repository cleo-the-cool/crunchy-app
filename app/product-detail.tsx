import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "../utils/haptics";
import { useGoBack } from "@/lib/useGoBack";
import {
  findProductByBarcode,
  getDefaultProduct,
  type Product,
  type IngredientRisk,
  type Rating,
} from "@/data/products";
import { Badge } from "@/components";

const RATING_CONFIG: Record<Rating, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; description: string }> = {
  clean: {
    icon: "checkmark-circle",
    color: "#4CAF50",
    label: "Clean",
    description: "This product uses safe, non-toxic ingredients",
  },
  caution: {
    icon: "alert-circle",
    color: "#FFC107",
    label: "Caution",
    description: "This product contains some ingredients of concern",
  },
  avoid: {
    icon: "warning",
    color: "#F44336",
    label: "Avoid",
    description: "This product contains harmful or toxic ingredients",
  },
};

const RISK_CONFIG: Record<IngredientRisk, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  safe: { color: "#4CAF50", icon: "checkmark-circle", label: "Safe" },
  concern: { color: "#FFC107", icon: "alert-circle", label: "Concern" },
  toxic: { color: "#F44336", icon: "warning", label: "Toxic" },
};

export default function ProductDetailScreen() {
  const goBack = useGoBack();
  const { barcode } = useLocalSearchParams<{ barcode?: string }>();
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  const product: Product = barcode
    ? findProductByBarcode(barcode) ?? getDefaultProduct(barcode)
    : getDefaultProduct("unknown");

  const ratingInfo = RATING_CONFIG[product.rating];

  const ingredientCounts = {
    safe: product.ingredients.filter((i) => i.risk === "safe").length,
    concern: product.ingredients.filter((i) => i.risk === "concern").length,
    toxic: product.ingredients.filter((i) => i.risk === "toxic").length,
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `I checked ${product.name} by ${product.brand} on Crunchy and it's rated ${ratingInfo.label}! Download Crunchy to check your products.`,
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={goBack}
            className="w-10 h-10 rounded-full bg-cream items-center justify-center mr-3"
            style={{
              borderWidth: 1,
        borderColor: "rgba(0,0,0,0.15)",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#3D5A3E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark">Product Details</Text>
        </View>
        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 rounded-full bg-cream items-center justify-center"
          style={{
            borderWidth: 1,
        borderColor: "rgba(0,0,0,0.15)",
          }}
        >
          <Ionicons name="share-outline" size={20} color="#3D5A3E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Header */}
        <View className="mx-5 mt-2 bg-white rounded-3xl p-5" style={{
          shadowColor: "#3D5A3E",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}>
          <View className="flex-row items-center">
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mr-4"
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
            className="mt-4 rounded-3xl p-4 flex-row items-center"
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

        {/* Ingredient Summary */}
        <View className="flex-row mx-5 mt-4 gap-2">
          <View className="flex-1 bg-white rounded-3xl p-3 items-center" style={{
            shadowColor: "#3D5A3E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}>
            <Text className="text-lg font-bold" style={{ color: "#4CAF50" }}>
              {ingredientCounts.safe}
            </Text>
            <Text className="text-xs text-dark/50">Safe</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl p-3 items-center" style={{
            shadowColor: "#3D5A3E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}>
            <Text className="text-lg font-bold" style={{ color: "#FFC107" }}>
              {ingredientCounts.concern}
            </Text>
            <Text className="text-xs text-dark/50">Concern</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl p-3 items-center" style={{
            shadowColor: "#3D5A3E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
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
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedIngredient(isExpanded ? null : ingredient.name);
                }}
                activeOpacity={0.7}
                className="bg-white rounded-3xl mb-2 overflow-hidden"
                style={{
                  shadowColor: "#3D5A3E",
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
                      color="#A8B89C"
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
          <View className="mx-5 mt-4">
            <Text className="text-lg font-bold text-dark mb-3">
              Clean Alternatives
            </Text>
            <View className="bg-white rounded-3xl p-4" style={{
              shadowColor: "#3D5A3E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
            }}>
              {product.alternatives.map((alt) => (
                <View key={alt.id} className="flex-row items-center py-2 border-b border-dark/5 last:border-b-0">
                  <Text className="text-2xl mr-3">{alt.image}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-dark">{alt.name}</Text>
                    <Text className="text-xs text-dark/50">{alt.brand} - {alt.price}</Text>
                  </View>
                  <Badge rating={alt.rating} size="sm" />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
