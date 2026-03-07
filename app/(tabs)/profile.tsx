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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "../../utils/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { ScoreCard } from "@/components";
import { getDefaultStats, type CrunchyStats } from "@/lib/crunchyScore";

const AVATAR_EMOJI_MAP: Record<string, string> = {
  leaf: "🌿",
  sunflower: "🌻",
  mushroom: "🍄",
  avocado: "🥑",
  butterfly: "🦋",
  bee: "🐝",
  cherry: "🍒",
  rainbow: "🌈",
  star: "⭐",
  cactus: "🌵",
  peach: "🍑",
  herb: "🌱",
};

const DEFAULT_AVATAR_EMOJI = "🌳";
const PROFILE_STORAGE_KEY = "@crunchy_onboarding_profile";

type TabKey = "history" | "saved" | "posts";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("history");
  const [refreshing, setRefreshing] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState<string>(DEFAULT_AVATAR_EMOJI);

  const stats: CrunchyStats = getDefaultStats();

  // Load profile from AsyncStorage (reload on screen focus to pick up edits)
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.displayName) setProfileName(profile.displayName);
          if (profile.avatar && AVATAR_EMOJI_MAP[profile.avatar]) {
            setAvatarEmoji(AVATAR_EMOJI_MAP[profile.avatar]);
          } else {
            setAvatarEmoji(DEFAULT_AVATAR_EMOJI);
          }
        }
      }
      loadProfile();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const displayName = profileName ?? user?.name ?? "Crunchy User";

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
            className="w-20 h-20 rounded-full bg-sage/15 items-center justify-center mb-4"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-4xl">{avatarEmoji}</Text>
          </View>
          <Text className="text-xl font-bold text-dark">{displayName}</Text>
          <Text className="text-sm text-dark/50 mt-1">@{user?.email?.split("@")[0] ?? "user"}</Text>
          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            className="mt-3 bg-white border border-sage rounded-2xl px-5 py-2"
          >
            <Text className="text-sm font-semibold text-sage">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Screenshotable Score Card - tappable to score detail */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/score-detail")}
          className="mt-3"
        >
          <ScoreCard stats={stats} userName={displayName} />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View className="flex-row px-5 mt-4" style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push("/lists")}
            className="flex-1 bg-white rounded-2xl py-3.5 flex-row items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="list-outline" size={18} color="#8B9E7C" />
            <Text className="text-sm font-semibold text-sage ml-2">My Lists</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/lists")}
            className="flex-1 bg-white rounded-2xl py-3.5 flex-row items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="globe-outline" size={18} color="#8B9E7C" />
            <Text className="text-sm font-semibold text-sage ml-2">Browse Lists</Text>
          </TouchableOpacity>
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
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
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

function EmptyState({ icon, title, message, ctaLabel, onCta }: { icon: string; title: string; message: string; ctaLabel?: string; onCta?: () => void }) {
  return (
    <View className="items-center py-12">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-lg font-bold text-dark text-center">{title}</Text>
      <Text className="text-sm text-dark/50 text-center mt-2 px-4">{message}</Text>
      {ctaLabel && onCta && (
        <TouchableOpacity onPress={onCta} className="mt-4 bg-sage px-6 py-3 rounded-2xl">
          <Text className="text-white font-semibold">{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ScanHistoryTab({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <EmptyState
      icon="📷"
      title="No scans yet"
      message="Start your clean living journey by scanning your first product!"
      ctaLabel="Scan a Product"
      onCta={() => router.push("/(tabs)/scan")}
    />
  );
}

function SavedItemsTab({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <EmptyState
      icon="🔖"
      title="No saved items"
      message="Save products and recipes you love to find them easily later!"
      ctaLabel="Explore Products"
      onCta={() => router.push("/(tabs)/explore")}
    />
  );
}

function MyPostsTab() {
  const router = useRouter();
  return (
    <EmptyState
      icon="✍️"
      title="No posts yet"
      message="Share your clean living tips and connect with the community!"
      ctaLabel="Create Post"
      onCta={() => router.push("/create-post")}
    />
  );
}
