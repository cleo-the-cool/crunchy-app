import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "../../utils/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components";
import { getDefaultStats } from "@/lib/crunchyScore";
import { getRecentScans, getScanStats, type ScanHistoryItem } from "@/lib/scanHistory";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";

const DAILY_TIPS = [
  { icon: "", tip: "Check your shampoo ingredients — sulfates can strip your hair of natural oils." },
  { icon: "", tip: "Frozen veggies are just as nutritious as fresh and have fewer preservatives." },
  { icon: "", tip: "Vinegar and baking soda can replace most chemical cleaning products." },
  { icon: "", tip: "Look for 'fragrance-free' instead of 'unscented' — they're not the same!" },
  { icon: "", tip: "The Dirty Dozen list highlights produce with the most pesticide residue." },
  { icon: "", tip: "Parabens in cosmetics can mimic estrogen. Check your moisturizer!" },
  { icon: "", tip: "Glass and stainless steel containers don't leach chemicals like plastic can." },
  { icon: "", tip: "Start small — swap one product at a time for a cleaner alternative." },
  { icon: "", tip: "Wash new clothes before wearing — they often contain formaldehyde from manufacturing." },
  { icon: "", tip: "Lemon juice is a natural disinfectant and deodorizer for your kitchen." },
  { icon: "", tip: "Most bubble baths contain SLS. Try colloidal oatmeal for sensitive skin." },
  { icon: "", tip: "Avoid heating food in plastic containers — it increases chemical leaching." },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [hasTakenQuiz, setHasTakenQuiz] = useState<boolean | null>(null);
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [scanStats, setScanStats] = useState({ totalScans: 0, averageScore: 0 });
  const [checklist, setChecklist] = useState({ scanned: false, quiz: false, saved: false });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [quizData, scans, stats, savedData] = await Promise.all([
        AsyncStorage.getItem("@crunchy_quiz_score"),
        getRecentScans(5),
        getScanStats(),
        AsyncStorage.getItem("@crunchy_saved_products"),
      ]);
      setHasTakenQuiz(quizData !== null);
      setRecentScans(scans);
      setScanStats(stats);
      setChecklist({
        scanned: stats.totalScans > 0,
        quiz: quizData !== null,
        saved: savedData !== null && JSON.parse(savedData).length > 0,
      });
    } catch {
      setHasTakenQuiz(false);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/scan");
  };

  const firstName = user?.name?.split(" ")[0] ?? "Friend";
  const stats = getDefaultStats();
  const tierInfo = stats.tier;

  // Daily tip — rotates based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyTip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "clean": return "#4CAF50";
      case "caution": return "#FFC107";
      case "avoid": return "#F44336";
      default: return "#999";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const completedCount = [checklist.scanned, checklist.quiz, checklist.saved].filter(Boolean).length;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View className="flex-1 bg-ivory">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* Hero Section with Nature Image */}
        <ImageBackground
          source={require("@/assets/images/aesthetic/forest-canopy.jpg")}
          resizeMode="cover"
          style={{ width: "100%" }}
        >
          <View style={{ backgroundColor: "rgba(61,90,62,0.55)" }}>
            <SafeAreaView edges={["top"]}>
              <View className="px-6 pt-6 pb-8">
                <Text className="text-white/70 text-sm font-medium uppercase tracking-wider">
                  {greeting}
                </Text>
                <Text className="text-4xl font-bold text-white mt-1">
                  {firstName}
                </Text>
                <Text className="text-white/60 text-sm mt-1">Welcome to your clean living journey</Text>

                {/* Score Badge on Hero */}
                <TouchableOpacity
                  onPress={() => router.push("/score-detail")}
                  activeOpacity={0.85}
                  className="flex-row items-center mt-5"
                >
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" }}
                  >
                    <Text className="text-2xl font-bold text-white">{stats.crunchyScore}</Text>
                  </View>
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-2"></Text>
                      <Text className="text-white font-bold text-lg">{tierInfo.label}</Text>
                    </View>
                    <View className="flex-row items-center mt-0.5">
                      <Text className="text-white/50 text-xs">View Score Details</Text>
                      <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.5)" style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </ImageBackground>

        {/* Quick Action Buttons */}
        <View className="flex-row px-6 mt-5 gap-3">
          <QuickActionButton icon="scan" label="Scan" onPress={handleScan} />
          <QuickActionButton icon="leaf-outline" label="Score" onPress={() => router.push("/score-detail")} />
          <QuickActionButton icon="bookmark-outline" label="Saved" onPress={() => router.push("/(tabs)/profile")} />
        </View>

        {/* Quick Stats Row */}
        {scanStats.totalScans > 0 && (
          <View className="flex-row px-6 mt-4 gap-3">
            <View className="flex-1 bg-white rounded-2xl p-3.5 items-center" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
              <Text className="text-2xl font-bold text-forest">{scanStats.totalScans}</Text>
              <Text className="text-xs text-dark/50 mt-0.5">Products Scanned</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-3.5 items-center" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
              <Text className="text-2xl font-bold text-forest">{scanStats.averageScore}</Text>
              <Text className="text-xs text-dark/50 mt-0.5">Avg Score</Text>
            </View>
          </View>
        )}

        {/* Quiz CTA - only show if user hasn't taken quiz */}
        {hasTakenQuiz === false && (
          <View className="px-6 mt-5">
            <ImageBackground
              source={require("@/assets/images/aesthetic/eucalyptus.jpg")}
              resizeMode="cover"
              imageStyle={{ borderRadius: 16 }}
            >
              <TouchableOpacity
                onPress={() => router.push("/quiz")}
                activeOpacity={0.85}
                className="rounded-2xl p-5"
                style={{ backgroundColor: "rgba(61,90,62,0.7)" }}
              >
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-white text-xs font-semibold uppercase tracking-wider opacity-80">
                      Get Started
                    </Text>
                    <Text className="text-white text-xl font-bold mt-1">
                      Take the Crunchy Quiz
                    </Text>
                    <Text className="text-white/80 text-sm mt-1.5">
                      Discover your clean living score
                    </Text>
                  </View>
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center ml-3"
                    style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                  >
                    <Ionicons name="leaf" size={28} color="white" />
                  </View>
                </View>
                <View className="flex-row items-center mt-3">
                  <Text className="text-white font-semibold text-sm">Start Quiz</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            </ImageBackground>
          </View>
        )}

        {/* Recent Scans - Horizontal Scroll */}
        {recentScans.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-6 mb-3">
              <Text className="text-lg font-bold text-dark">
                Recent Scans
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/scan")} hitSlop={8}>
                <Text className="text-sm text-forest font-semibold">See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {recentScans.map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/scan-result",
                      params: {
                        barcodeData: JSON.stringify({
                          productName: scan.productName,
                          brand: scan.brand,
                          category: scan.category,
                          rating: scan.rating,
                          crunchyScore: scan.crunchyScore,
                          ingredients: (scan.ingredients || []).map(i => ({
                            name: i.name,
                            risk: i.risk,
                            explanation: "",
                          })),
                          concerns: scan.concerns || [],
                          cleanAlternatives: [],
                          summary: scan.summary || "",
                        }),
                        source: "history",
                      },
                    });
                  }}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl w-40 p-3.5"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.12)",
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: getRatingColor(scan.rating) + "15" }}
                  >
                    <Text className="text-lg font-bold" style={{ color: getRatingColor(scan.rating) }}>
                      {scan.crunchyScore}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-dark" numberOfLines={1}>
                    {scan.productName}
                  </Text>
                  <Text className="text-xs text-dark/40 mt-0.5" numberOfLines={1}>
                    {scan.brand}
                  </Text>
                  <Text className="text-xs text-dark/30 mt-1">
                    {formatTimeAgo(scan.scannedAt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Daily Tip with botanical background */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Daily Tip
          </Text>
          <ImageBackground
            source={require("@/assets/images/aesthetic/herbs.jpg")}
            resizeMode="cover"
            imageStyle={{ borderRadius: 16 }}
          >
            <View className="rounded-2xl p-4 flex-row items-start" style={{ backgroundColor: "rgba(61,90,62,0.75)" }}>
              {dailyTip.icon ? <Text className="text-2xl mr-3">{dailyTip.icon}</Text> : null}
              <Text className="text-sm text-white/90 flex-1 leading-5">{dailyTip.tip}</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Browse Categories */}
        <View className="mt-6 px-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Browse Categories
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {[
              { key: "food", label: "Food", emoji: "" },
              { key: "drinks", label: "Drinks", emoji: "" },
              { key: "skincare", label: "Skincare", emoji: "" },
              { key: "makeup", label: "Makeup", emoji: "" },
              { key: "cleaning", label: "Cleaning", emoji: "" },
              { key: "clothing", label: "Clothing", emoji: "" },
              { key: "home", label: "Home", emoji: "" },
              { key: "baby", label: "Baby", emoji: "" },
              { key: "wellness", label: "Wellness", emoji: "" },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: "/(tabs)/explore", params: { category: cat.label } });
                }}
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
                    style={{ backgroundColor: "rgba(0,0,0,0.35)", height: 120 }}
                  >
                    {cat.emoji ? <Text className="text-2xl mb-1">{cat.emoji}</Text> : null}
                    <Text className="text-white font-bold text-base">{cat.label}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Getting Started Checklist */}
        {completedCount < 3 && (
          <View className="px-6 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-dark">
                Getting Started
              </Text>
              <Text className="text-xs text-dark/40">{completedCount}/3 complete</Text>
            </View>
            <View className="bg-white rounded-2xl p-4" style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
              <ChecklistItem
                done={checklist.scanned}
                label="Scan your first product"
                onPress={handleScan}
              />
              <ChecklistItem
                done={checklist.quiz}
                label="Take the Crunchy Quiz"
                onPress={() => router.push("/quiz")}
              />
              <ChecklistItem
                done={checklist.saved}
                label="Save a product"
                onPress={handleScan}
              />
            </View>
          </View>
        )}

        {/* Welcome CTA for brand new users */}
        {scanStats.totalScans === 0 && (
          <View className="px-6 mt-6">
            <ImageBackground
              source={require("@/assets/images/aesthetic/monstera.jpg")}
              resizeMode="cover"
              imageStyle={{ borderRadius: 16 }}
            >
              <View className="rounded-2xl items-center py-6 px-4" style={{ backgroundColor: "rgba(61,90,62,0.7)" }}>
                <Text className="text-base font-bold text-white text-center">
                  Start your clean living journey!
                </Text>
                <Text className="text-sm text-white/70 text-center mt-2 px-4">
                  Scan your first product to discover what{"'"}s really inside.
                </Text>
                <TouchableOpacity
                  onPress={handleScan}
                  activeOpacity={0.85}
                  className="mt-4 bg-white px-6 py-3 rounded-2xl"
                >
                  <Text className="text-forest font-semibold">Scan Your First Product</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      activeOpacity={0.8}
      className="flex-1 bg-white rounded-3xl py-4 items-center"
      style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)", shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
    >
      <View className="w-11 h-11 rounded-full bg-forest/8 items-center justify-center mb-2">
        <Ionicons name={icon} size={22} color="#3D5A3E" />
      </View>
      <Text className="text-sm font-semibold text-dark">{label}</Text>
    </TouchableOpacity>
  );
}

function ChecklistItem({
  done,
  label,
  onPress,
}: {
  done: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={done ? undefined : onPress}
      activeOpacity={done ? 1 : 0.7}
      className="flex-row items-center py-2.5"
    >
      <View
        className="w-6 h-6 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: done ? "#3D5A3E" : "transparent",
          borderWidth: done ? 0 : 2,
          borderColor: "#ddd",
        }}
      >
        {done && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
      <Text className={`text-sm flex-1 ${done ? "text-dark/40 line-through" : "text-dark font-medium"}`}>
        {label}
      </Text>
      {!done && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
    </TouchableOpacity>
  );
}
