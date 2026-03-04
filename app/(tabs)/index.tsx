import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge } from "@/components";

const MOCK_SWAP = {
  name: "Tide Original Detergent",
  brand: "Tide",
  reason: "Contains synthetic fragrances, optical brighteners, and 1,4-dioxane",
  alternative: {
    name: "Branch Basics Concentrate",
    brand: "Branch Basics",
    rating: "clean" as const,
  },
};

const MOCK_TRENDING = [
  {
    id: "1",
    username: "cleanlivingmama",
    text: "Just switched to bar shampoo and my hair has never been better! #zerowaste #crunchyhair",
    likes: 142,
    comments: 23,
  },
  {
    id: "2",
    username: "earthygirl22",
    text: "Made my own all-purpose cleaner with vinegar and essential oils. So easy! #DIYclean #toxinfree",
    likes: 98,
    comments: 15,
  },
  {
    id: "3",
    username: "greenmomlife",
    text: "Found out my favorite moisturizer has parabens 😭 Any clean alternatives for dry skin?",
    likes: 76,
    comments: 31,
  },
];

const MOCK_STATS = {
  totalScans: 12,
  crunchyScore: 74,
  savedItems: 8,
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/scan");
  };

  const firstName = user?.name?.split(" ")[0] ?? "Friend";
  const scoreLabel = getScoreLabel(MOCK_STATS.crunchyScore);

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
        {/* Greeting */}
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark">
              Hey, {firstName}!
            </Text>
            <Text className="text-sm text-dark/50 mt-1">
              Your clean living dashboard
            </Text>
          </View>
          <View className="items-center">
            <Badge rating={scoreLabel.badge} size="md" label={String(MOCK_STATS.crunchyScore)} />
            <Text className="text-xs text-dark/50 mt-1">{scoreLabel.label}</Text>
          </View>
        </View>

        {/* Scan Button */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={handleScan}
            activeOpacity={0.85}
            className="bg-sage rounded-3xl py-6 items-center"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="bg-white/20 rounded-full w-16 h-16 items-center justify-center mb-3">
              <Ionicons name="scan" size={32} color="white" />
            </View>
            <Text className="text-white text-xl font-bold">Scan a Product</Text>
            <Text className="text-white/70 text-sm mt-1">
              Barcode, label, or photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View className="flex-row px-5 mt-5 gap-3">
          <StatCard
            icon="barcode-outline"
            value={MOCK_STATS.totalScans}
            label="Scans"
          />
          <StatCard
            icon="leaf-outline"
            value={MOCK_STATS.crunchyScore}
            label="Score"
          />
          <StatCard
            icon="bookmark-outline"
            value={MOCK_STATS.savedItems}
            label="Saved"
          />
        </View>

        {/* Clean Swap of the Day */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Clean Swap of the Day
          </Text>
          <Card>
            <View className="flex-row items-start">
              <View className="bg-rating-avoid/10 rounded-2xl w-14 h-14 items-center justify-center mr-3">
                <Ionicons name="warning" size={24} color="#F44336" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-dark">
                  {MOCK_SWAP.name}
                </Text>
                <Text className="text-xs text-dark/50">{MOCK_SWAP.brand}</Text>
                <Text className="text-sm text-dark/70 mt-1">
                  {MOCK_SWAP.reason}
                </Text>
              </View>
            </View>

            <View className="h-px bg-dark/10 my-3" />

            <View className="flex-row items-center">
              <View className="bg-rating-clean/10 rounded-2xl w-14 h-14 items-center justify-center mr-3">
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-dark/50">Try instead:</Text>
                <Text className="text-base font-bold text-dark">
                  {MOCK_SWAP.alternative.name}
                </Text>
                <Text className="text-xs text-dark/50">
                  {MOCK_SWAP.alternative.brand}
                </Text>
              </View>
              <Badge
                rating={MOCK_SWAP.alternative.rating}
                size="sm"
                label="Clean"
              />
            </View>
          </Card>
        </View>

        {/* Trending in Community */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Trending in Community
          </Text>
          {MOCK_TRENDING.map((post) => (
            <Card key={post.id} className="mb-3">
              <View className="flex-row items-center mb-2">
                <View className="bg-sage-light rounded-full w-8 h-8 items-center justify-center mr-2">
                  <Text className="text-white text-xs font-bold">
                    {post.username[0].toUpperCase()}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-dark">
                  @{post.username}
                </Text>
              </View>
              <Text className="text-sm text-dark/80 leading-5">
                {post.text}
              </Text>
              <View className="flex-row mt-2 gap-4">
                <View className="flex-row items-center">
                  <Ionicons name="heart-outline" size={16} color="#999" />
                  <Text className="text-xs text-dark/50 ml-1">
                    {post.likes}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="chatbubble-outline"
                    size={14}
                    color="#999"
                  />
                  <Text className="text-xs text-dark/50 ml-1">
                    {post.comments}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
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

function getScoreLabel(score: number): {
  label: string;
  badge: "clean" | "caution" | "avoid";
} {
  if (score >= 80) return { label: "Thriving", badge: "clean" };
  if (score >= 60) return { label: "Blooming", badge: "clean" };
  if (score >= 40) return { label: "Sprout", badge: "caution" };
  if (score >= 20) return { label: "Seedling", badge: "caution" };
  return { label: "Seedling", badge: "avoid" };
}
