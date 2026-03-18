import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Modal,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "../../utils/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { ScoreCard } from "@/components";
import { getDefaultStats, getTierInfo, type CrunchyStats } from "@/lib/crunchyScore";

import { getSavedProducts, unsaveProduct, getRatingFromScore, type SavedProduct } from "@/lib/savedProducts";
import { getRecentScans, type ScanHistoryItem } from "@/lib/scanHistory";
import type { GeminiAnalysis } from "@/services/gemini";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";

const RISK_CONFIG = {
  safe: { color: "#4CAF50", icon: "checkmark-circle" as const, label: "Safe" },
  concern: { color: "#FFC107", icon: "alert-circle" as const, label: "Concern" },
  toxic: { color: "#F44336", icon: "warning" as const, label: "Toxic" },
};

function normalizeCategoryKey(cat?: string): string {
  if (!cat) return "Other";
  const lower = cat.toLowerCase();
  if (lower.includes("food") || lower.includes("cooking")) return "Food";
  if (lower.includes("drink") || lower.includes("beverage")) return "Drinks";
  if (lower.includes("skin") || lower.includes("personal care")) return "Skincare";
  if (lower.includes("makeup") || lower.includes("cosmetic")) return "Makeup";
  if (lower.includes("clean")) return "Cleaning";
  if (lower.includes("wellness") || lower.includes("supplement")) return "Wellness";
  if (lower.includes("baby") || lower.includes("kid")) return "Baby";
  return "Other";
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [detailProduct, setDetailProduct] = useState<SavedProduct | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const stats: CrunchyStats = getDefaultStats();
  const tier = getTierInfo(stats.crunchyScore);

  useFocusEffect(
    useCallback(() => {
      getSavedProducts().then(setSavedProducts);
      getRecentScans(5).then(setRecentScans);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      getSavedProducts().then(setSavedProducts),
      getRecentScans(5).then(setRecentScans),
    ]).then(() => setRefreshing(false));
  }, []);

  const displayName = user?.name ?? "Crunchy User";
  const firstInitial = displayName.charAt(0).toUpperCase();

  // Group saved products by category
  const savedByCategory = savedProducts.reduce<Record<string, SavedProduct[]>>((acc, p) => {
    const key = normalizeCategoryKey(p.category);
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const categoryOrder = ["Skincare", "Food", "Drinks", "Cleaning", "Makeup", "Wellness", "Baby", "Other"];
  const sortedCategories = categoryOrder.filter((c) => savedByCategory[c]?.length > 0);

  const toggleCategory = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <View className="flex-1 bg-ivory">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Profile Header with Botanical Background */}
        <ImageBackground
          source={require("@/assets/images/aesthetic/forest-canopy.jpg")}
          resizeMode="cover"
        >
          <View style={{ backgroundColor: "rgba(61,90,62,0.55)" }}>
            <SafeAreaView edges={["top"]}>
              {/* Header with Settings */}
              <View className="flex-row items-center justify-between px-6 pt-6 pb-1">
                <Text className="text-2xl font-bold text-white">Profile</Text>
                <TouchableOpacity
                  onPress={() => router.push("/settings")}
                  hitSlop={8}
                >
                  <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>

              {/* Profile Info */}
              <View className="px-6 pt-4 pb-8" style={{ minHeight: 140 }}>
                <Text className="text-2xl font-bold text-white">{displayName}</Text>

                {/* Tier Badge */}
                <View
                  className="flex-row items-center mt-3 px-4 py-1.5 rounded-full self-start"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Text className="text-sm font-semibold text-white">
                    {tier.label}
                  </Text>
                  <Text className="text-sm text-white/60 ml-2">
                    Score: {stats.crunchyScore}
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </ImageBackground>

        {/* Stats Row */}
        <View
          className="mx-6 mt-5 bg-white rounded-3xl flex-row py-4"
          style={{
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.15)",
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
          }}
        >
          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-dark">{stats.totalScans}</Text>
            <Text className="text-xs text-dark/50 mt-0.5">Total Scans</Text>
          </View>
          <View
            className="flex-1 items-center"
            style={{ borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(0,0,0,0.05)" }}
          >
            <Text className="text-xl font-bold text-dark">{stats.recipesMade}</Text>
            <Text className="text-xs text-dark/50 mt-0.5">Recipes Tried</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-dark">{savedProducts.length}</Text>
            <Text className="text-xs text-dark/50 mt-0.5">Saved</Text>
          </View>
        </View>

        {/* Screenshotable Score Card */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-dark px-6 mb-3">Your Crunchy Card</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/score-detail")}
          >
            <ScoreCard stats={stats} userName={displayName} />
          </TouchableOpacity>
        </View>

        {/* My Recent Scans - Horizontal Scroll */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text className="text-lg font-bold text-dark">Recent Scans</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/scan")}
              hitSlop={8}
            >
              <Text className="text-sm font-medium text-forest">Scan More</Text>
            </TouchableOpacity>
          </View>

          {recentScans.length > 0 ? (
            <FlatList
              horizontal
              data={recentScans}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => {
                const scanRating = getRatingFromScore(item.crunchyScore);
                const color = scanRating === "clean" ? "#4CAF50" : scanRating === "caution" ? "#FFC107" : "#F44336";
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      router.push({
                        pathname: "/scan-result",
                        params: {
                          barcodeData: JSON.stringify({
                            productName: item.productName,
                            brand: item.brand,
                            category: item.category,
                            rating: scanRating,
                            crunchyScore: item.crunchyScore,
                            ingredients: (item.ingredients || []).map((i) => ({ name: i.name, risk: i.risk, explanation: "" })),
                            concerns: item.concerns || [],
                            cleanAlternatives: [],
                            summary: item.summary || "",
                          }),
                          source: "history",
                        },
                      });
                    }}
                    className="bg-white rounded-3xl p-3 items-center"
                    style={{
                      width: 110,
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.15)",
                    }}
                  >
                    <Ionicons name="cube-outline" size={28} color="#A8B89C" style={{ marginBottom: 8 }} />
                    <Text className="text-xs font-medium text-dark text-center" numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <View
                      className="mt-1.5 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color + "18" }}
                    >
                      <Text className="text-xs font-bold" style={{ color }}>
                        {item.crunchyScore}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <View className="mx-6 bg-white rounded-3xl p-6 items-center" style={{
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.15)",
            }}>
              <Ionicons name="camera-outline" size={32} color="#A8B89C" style={{ marginBottom: 8 }} />
              <Text className="text-sm font-medium text-dark">No scans yet</Text>
              <Text className="text-xs text-dark/50 mt-1 text-center">
                Scan your first product to start tracking!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/scan")}
                className="mt-3 bg-forest px-5 py-2 rounded-3xl"
              >
                <Text className="text-sm font-semibold text-cream">Scan a Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Saved Products - Collapsible by Category */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text className="text-lg font-bold text-dark">Saved Products</Text>
            {savedProducts.length > 0 && (
              <Text className="text-xs text-dark/40">{savedProducts.length} total</Text>
            )}
          </View>

          {sortedCategories.length > 0 ? (
            <View className="px-6" style={{ gap: 10 }}>
              {sortedCategories.map((cat) => {
                const items = savedByCategory[cat];
                const isCollapsed = collapsedCategories.has(cat);
                return (
                  <View key={cat} className="bg-white rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}>
                    {/* Category Header */}
                    <TouchableOpacity
                      onPress={() => toggleCategory(cat)}
                      activeOpacity={0.7}
                      className="flex-row items-center justify-between px-4 py-3"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-sm font-bold text-dark">{cat}</Text>
                        <View className="ml-2 bg-forest/10 px-2 py-0.5 rounded-full">
                          <Text className="text-xs font-semibold text-forest">{items.length}</Text>
                        </View>
                      </View>
                      <Ionicons
                        name={isCollapsed ? "chevron-forward" : "chevron-down"}
                        size={16}
                        color="#A8B89C"
                      />
                    </TouchableOpacity>

                    {/* Products */}
                    {!isCollapsed && items.map((item, idx) => {
                      const score = item.scanData?.crunchyScore;
                      const derivedRating = score != null ? getRatingFromScore(score) : item.rating;
                      const ratingColor = derivedRating === "clean" ? "#4CAF50" : derivedRating === "caution" ? "#FFC107" : "#F44336";
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.7}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setDetailProduct(item);
                          }}
                          className="flex-row items-center px-4 py-2.5"
                          style={idx > 0 || true ? { borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" } : undefined}
                        >
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-dark" numberOfLines={1}>{item.name}</Text>
                            {item.brand && <Text className="text-xs text-dark/40">{item.brand}</Text>}
                          </View>
                          {score != null && (
                            <View className="items-center mr-2">
                              <Text className="text-base font-bold" style={{ color: ratingColor }}>{score}</Text>
                            </View>
                          )}
                          {derivedRating && (
                            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: ratingColor + "18" }}>
                              <Text className="text-[10px] font-bold capitalize" style={{ color: ratingColor }}>
                                {derivedRating}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="mx-6 rounded-3xl p-6 items-center" style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.15)",
            }}>
              <Ionicons name="bookmark-outline" size={32} color="#A8B89C" style={{ marginBottom: 8 }} />
              <Text className="text-sm font-medium text-dark">No saved products</Text>
              <Text className="text-xs text-dark/50 mt-1 text-center">
                Bookmark products from scan results to save them here!
              </Text>
            </View>
          )}
        </View>

        {/* Saved Product Detail Modal */}
        <SavedProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onUnsave={async (id) => {
            await unsaveProduct(id);
            setSavedProducts((prev) => prev.filter((p) => p.id !== id));
            setDetailProduct(null);
          }}
        />
      </ScrollView>
    </View>
  );
}

function SavedProductDetailModal({
  product,
  onClose,
  onUnsave,
}: {
  product: SavedProduct | null;
  onClose: () => void;
  onUnsave: (id: string) => void;
}) {
  if (!product) return null;
  const scan: GeminiAnalysis | undefined = product.scanData;
  const derivedRating = scan?.crunchyScore != null ? getRatingFromScore(scan.crunchyScore) : product.rating;
  const ratingColor = derivedRating === "clean" ? "#4CAF50" : derivedRating === "caution" ? "#FFC107" : "#F44336";
  const ratingLabel = derivedRating === "clean" ? "Clean" : derivedRating === "caution" ? "Caution" : "Avoid";

  return (
    <Modal visible={!!product} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View
          className="bg-ivory rounded-t-3xl max-h-[85%]"
          style={{ borderTopWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-dark/15" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-3">
            <View className="flex-1">
              <Text className="text-lg font-bold text-dark">
                {product.name}
              </Text>
              {product.brand && <Text className="text-sm text-dark/50">{product.brand}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            {/* Score + Rating Row */}
            <View className="flex-row items-center mb-4" style={{ gap: 12 }}>
              {scan?.crunchyScore != null && (
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: ratingColor + "15", borderWidth: 2, borderColor: ratingColor }}
                >
                  <Text className="text-xl font-bold" style={{ color: ratingColor }}>{scan.crunchyScore}</Text>
                </View>
              )}
              <View className="flex-1">
                <View className="px-3 py-1 rounded-full self-start" style={{ backgroundColor: ratingColor + "18" }}>
                  <Text className="text-sm font-bold" style={{ color: ratingColor }}>{ratingLabel}</Text>
                </View>
                {scan?.summary && (
                  <Text className="text-sm text-dark/60 mt-2 leading-5">{scan.summary}</Text>
                )}
              </View>
            </View>

            {/* Ingredients */}
            {scan?.ingredients && scan.ingredients.length > 0 && (
              <View className="mb-4">
                <Text className="text-base font-bold text-dark mb-2">Ingredients</Text>
                <View className="bg-white rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}>
                  {scan.ingredients.map((ing, i) => {
                    const risk = RISK_CONFIG[ing.risk] || RISK_CONFIG.concern;
                    return (
                      <View
                        key={i}
                        className="flex-row items-center px-3 py-2.5"
                        style={i > 0 ? { borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" } : undefined}
                      >
                        <View className="w-6 h-6 rounded-full items-center justify-center mr-2" style={{ backgroundColor: risk.color + "18" }}>
                          <Ionicons name={risk.icon} size={14} color={risk.color} />
                        </View>
                        <Text className="flex-1 text-sm text-dark">{ing.name}</Text>
                        <Text className="text-xs font-semibold" style={{ color: risk.color }}>{risk.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Concerns */}
            {scan?.concerns && scan.concerns.length > 0 && (
              <View className="mb-4">
                <Text className="text-base font-bold text-dark mb-2">Concerns</Text>
                <View className="bg-white rounded-2xl p-3" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}>
                  {scan.concerns.map((c, i) => (
                    <View key={i} className="flex-row items-start mb-1.5">
                      <Ionicons name="alert-circle" size={14} color="#F44336" style={{ marginTop: 2 }} />
                      <Text className="text-sm text-dark/70 ml-2 flex-1">{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Clean Alternatives */}
            {scan?.cleanAlternatives && scan.cleanAlternatives.length > 0 && (
              <View className="mb-4">
                <Text className="text-base font-bold text-dark mb-2">Clean Alternatives</Text>
                <View className="bg-white rounded-2xl p-3" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}>
                  {scan.cleanAlternatives.map((alt, i) => (
                    <View key={i} className="flex-row items-center mb-1.5">
                      <Ionicons name="leaf" size={14} color="#4CAF50" style={{ marginTop: 1 }} />
                      <Text className="text-sm text-dark/70 ml-2 flex-1">{alt}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Unsave Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onUnsave(product.id);
              }}
              className="bg-white rounded-2xl py-3.5 flex-row items-center justify-center mt-2"
              style={{ borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}
            >
              <Ionicons name="bookmark" size={18} color="#EF4444" />
              <Text className="text-base font-semibold ml-2" style={{ color: "#EF4444" }}>Unsave Product</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
