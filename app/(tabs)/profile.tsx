import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge } from "@/components";

type TabKey = "history" | "saved" | "posts";

const MOCK_STATS = {
  totalScans: 12,
  recipesMade: 5,
  daysActive: 23,
  crunchyScore: 74,
};

const MOCK_SCAN_HISTORY = [
  { id: "s1", productName: "Gentle Skin Cleanser", brand: "Cetaphil", date: "2026-03-04", rating: "caution" as const, barcode: "3574661014647" },
  { id: "s2", productName: "All-Purpose Cleaner", brand: "Method", date: "2026-03-03", rating: "clean" as const, barcode: "0817939011690" },
  { id: "s3", productName: "Classic Shampoo", brand: "Head & Shoulders", date: "2026-03-03", rating: "avoid" as const, barcode: "0037000711148" },
  { id: "s4", productName: "Hydrating Facial Cream", brand: "CeraVe", date: "2026-03-02", rating: "clean" as const, barcode: "3606000537538" },
  { id: "s5", productName: "Fabuloso Multi-Purpose", brand: "Fabuloso", date: "2026-03-01", rating: "avoid" as const, barcode: "0035000458124" },
  { id: "s6", productName: "Natural Deodorant", brand: "Native", date: "2026-02-28", rating: "clean" as const, barcode: "0850012345001" },
  { id: "s7", productName: "Dish Soap", brand: "Dawn", date: "2026-02-27", rating: "caution" as const, barcode: "0037000973263" },
];

const MOCK_SAVED_ITEMS = [
  { id: "sv1", name: "Gentle Cleanser", brand: "CeraVe", type: "product" as const, image: "🧼", rating: "clean" as const, barcode: "3606000537538" },
  { id: "sv2", name: "All-Purpose Citrus Cleaner", type: "recipe" as const, image: "🍊", recipeId: "recipe-001" },
  { id: "sv3", name: "Calendula Cleanser", brand: "Weleda", type: "product" as const, image: "🌿", rating: "clean" as const, barcode: "4001638088602" },
  { id: "sv4", name: "Honey Oat Face Mask", type: "recipe" as const, image: "🍯", recipeId: "recipe-007" },
  { id: "sv5", name: "Natural Deodorant", brand: "Native", type: "product" as const, image: "🌱", rating: "clean" as const, barcode: "0850012345001" },
  { id: "sv6", name: "Lavender Linen Spray", type: "recipe" as const, image: "💜", recipeId: "recipe-022" },
];

const MOCK_USER_POSTS = [
  { id: "up1", content: "Just discovered that my 'natural' shampoo has sulfates! Switching to a truly clean option today.", timestamp: "2026-03-04T09:15:00Z", likes: 18, comments: 4, hashtags: ["#CleanSwap", "#ToxinFree"] },
  { id: "up2", content: "Made the all-purpose citrus cleaner recipe from the app and it works amazingly! My kitchen smells like a dream.", timestamp: "2026-03-02T14:30:00Z", likes: 35, comments: 8, hashtags: ["#DIYCleaner", "#CleanLiving"] },
  { id: "up3", content: "Day 23 of my clean living journey. Small swaps add up! Already replaced 7 products with cleaner alternatives.", timestamp: "2026-02-28T11:00:00Z", likes: 52, comments: 12, hashtags: ["#CrunchyLife", "#CleanLiving"] },
];

function getScoreLabel(score: number): {
  label: string;
  badge: "clean" | "caution" | "avoid";
} {
  if (score >= 80) return { label: "Fully Rooted", badge: "clean" };
  if (score >= 60) return { label: "Thriving", badge: "clean" };
  if (score >= 40) return { label: "Blooming", badge: "caution" };
  if (score >= 20) return { label: "Sprout", badge: "caution" };
  return { label: "Seedling", badge: "avoid" };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("history");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const scoreInfo = getScoreLabel(MOCK_STATS.crunchyScore);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CR";

  return (
    <SafeAreaView className="flex-1 bg-cream">
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
      >
        {/* Header with Settings */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
          <Text className="text-xl font-bold text-dark">Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={24} color="#2D2D2D" />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View className="items-center px-5 pt-4 pb-2">
          <View
            className="w-20 h-20 rounded-full bg-sage items-center justify-center mb-3"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-2xl font-bold text-white">{initials}</Text>
          </View>
          <Text className="text-xl font-bold text-dark">{user?.name ?? "Crunchy User"}</Text>
          <Text className="text-sm text-dark/50 mt-0.5">@{user?.email?.split("@")[0] ?? "user"}</Text>

          {/* Crunchy Score Badge */}
          <View className="items-center mt-3">
            <View
              className="rounded-2xl px-6 py-3 items-center"
              style={{
                backgroundColor: scoreInfo.badge === "clean" ? "#4CAF50" + "18" : scoreInfo.badge === "caution" ? "#FFC107" + "18" : "#F44336" + "18",
              }}
            >
              <Text
                className="text-3xl font-bold"
                style={{
                  color: scoreInfo.badge === "clean" ? "#4CAF50" : scoreInfo.badge === "caution" ? "#FFC107" : "#F44336",
                }}
              >
                {MOCK_STATS.crunchyScore}
              </Text>
              <Text className="text-sm font-semibold text-dark/70 mt-0.5">
                {scoreInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-5 mt-4 gap-3">
          <StatCard icon="barcode-outline" value={MOCK_STATS.totalScans} label="Scans" />
          <StatCard icon="flask-outline" value={MOCK_STATS.recipesMade} label="Recipes Made" />
          <StatCard icon="calendar-outline" value={MOCK_STATS.daysActive} label="Days Active" />
        </View>

        {/* Tab Sections */}
        <View className="mt-6">
          <View className="flex-row px-5 mb-4">
            {(
              [
                { key: "history", label: "Scan History" },
                { key: "saved", label: "Saved Items" },
                { key: "posts", label: "My Posts" },
              ] as { key: TabKey; label: string }[]
            ).map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 items-center border-b-2 ${
                  activeTab === tab.key
                    ? "border-sage"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? "text-sage" : "text-dark/40"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="px-5">
            {activeTab === "history" && <ScanHistoryTab router={router} />}
            {activeTab === "saved" && <SavedItemsTab router={router} />}
            {activeTab === "posts" && <MyPostsTab />}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View
      className="flex-1 bg-white rounded-2xl py-4 items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Ionicons name={icon} size={22} color="#8B9E7C" />
      <Text className="text-xl font-bold text-dark mt-1">{value}</Text>
      <Text className="text-xs text-dark/50">{label}</Text>
    </View>
  );
}

function ScanHistoryTab({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <View>
      {MOCK_SCAN_HISTORY.map((scan) => (
        <TouchableOpacity
          key={scan.id}
          onPress={() => router.push(`/scan-result?barcode=${scan.barcode}`)}
          activeOpacity={0.7}
        >
          <Card className="mb-3">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{
                  backgroundColor:
                    scan.rating === "clean"
                      ? "#4CAF50" + "15"
                      : scan.rating === "caution"
                      ? "#FFC107" + "15"
                      : "#F44336" + "15",
                }}
              >
                <Ionicons
                  name={
                    scan.rating === "clean"
                      ? "checkmark-circle"
                      : scan.rating === "caution"
                      ? "alert-circle"
                      : "close-circle"
                  }
                  size={20}
                  color={
                    scan.rating === "clean"
                      ? "#4CAF50"
                      : scan.rating === "caution"
                      ? "#FFC107"
                      : "#F44336"
                  }
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-dark">
                  {scan.productName}
                </Text>
                <Text className="text-xs text-dark/50">{scan.brand}</Text>
              </View>
              <View className="items-end">
                <Badge rating={scan.rating} size="sm" />
                <Text className="text-xs text-dark/40 mt-1">
                  {formatDate(scan.date)}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SavedItemsTab({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: 12 }}>
      {MOCK_SAVED_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            if (item.type === "product" && item.barcode) {
              router.push(`/scan-result?barcode=${item.barcode}`);
            } else if (item.type === "recipe" && item.recipeId) {
              router.push(`/recipe-detail?id=${item.recipeId}`);
            }
          }}
          activeOpacity={0.7}
          style={{ width: "47%" }}
        >
          <View
            className="bg-white rounded-2xl p-3 items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="w-14 h-14 rounded-2xl bg-sage/10 items-center justify-center mb-2">
              <Text className="text-2xl">{item.image}</Text>
            </View>
            <Text className="text-sm font-semibold text-dark text-center" numberOfLines={2}>
              {item.name}
            </Text>
            {item.type === "product" && item.brand && (
              <Text className="text-xs text-dark/50 mt-0.5">{item.brand}</Text>
            )}
            <View className="mt-1.5">
              {item.type === "product" && item.rating ? (
                <Badge rating={item.rating} size="sm" />
              ) : (
                <View className="bg-peach/20 px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-peach font-medium">Recipe</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MyPostsTab() {
  return (
    <View>
      {MOCK_USER_POSTS.map((post) => (
        <Card key={post.id} className="mb-3">
          <Text className="text-sm text-dark/80 leading-5">{post.content}</Text>
          {post.hashtags.length > 0 && (
            <View className="flex-row flex-wrap mt-1.5 gap-1">
              {post.hashtags.map((tag) => (
                <Text key={tag} className="text-sm text-sage font-medium">
                  {tag}
                </Text>
              ))}
            </View>
          )}
          <View className="flex-row items-center mt-2.5 pt-2 border-t border-dark/5">
            <View className="flex-row items-center mr-4">
              <Ionicons name="heart" size={14} color="#F4A574" />
              <Text className="text-xs text-dark/50 ml-1">{post.likes}</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <Ionicons name="chatbubble-outline" size={13} color="#999" />
              <Text className="text-xs text-dark/50 ml-1">{post.comments}</Text>
            </View>
            <Text className="text-xs text-dark/30 ml-auto">
              {formatDate(post.timestamp)}
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );
}
