import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "../../utils/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { ScoreCard } from "@/components";
import { getDefaultStats, getTierInfo, type CrunchyStats } from "@/lib/crunchyScore";
import { AVATAR_EMOJI_MAP, DEFAULT_AVATAR_EMOJI } from "@/lib/avatars";
const PROFILE_STORAGE_KEY = "@crunchy_onboarding_profile";

// Sample recent scans for demo
const SAMPLE_RECENT_SCANS = [
  { id: "1", name: "Dr. Bronner's Soap", score: 92, emoji: "\u{1F9FC}" },
  { id: "2", name: "Seventh Gen Cleaner", score: 88, emoji: "\u{1F9F9}" },
  { id: "3", name: "Tom's Toothpaste", score: 78, emoji: "\u{1FAA5}" },
  { id: "4", name: "Method Hand Soap", score: 85, emoji: "\u{1F9F4}" },
  { id: "5", name: "Mrs. Meyer's Dish", score: 72, emoji: "\u{1F37D}\uFE0F" },
];

// Sample lists for demo
const SAMPLE_LISTS = [
  { id: "1", name: "Clean Kitchen Staples", itemCount: 8, emoji: "\u{1F373}" },
  { id: "2", name: "Baby-Safe Products", itemCount: 12, emoji: "\u{1F476}" },
  { id: "3", name: "DIY Recipes to Try", itemCount: 5, emoji: "\u{1F52C}" },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileBio, setProfileBio] = useState<string>("");
  const [avatarEmoji, setAvatarEmoji] = useState<string>(DEFAULT_AVATAR_EMOJI);

  const stats: CrunchyStats = getDefaultStats();
  const tier = getTierInfo(stats.crunchyScore);

  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.displayName) setProfileName(profile.displayName);
          if (profile.bio) setProfileBio(profile.bio);
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
        <View className="flex-row items-center justify-between px-6 pt-2 pb-1">
          <Text className="text-xl font-bold text-dark">Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={24} color="#2D2D2D" />
          </TouchableOpacity>
        </View>

        {/* Profile Header - Large Avatar */}
        <View className="items-center px-6 pt-6 pb-2">
          <View
            className="w-28 h-28 rounded-full bg-sage/15 items-center justify-center mb-4"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text className="text-6xl">{avatarEmoji}</Text>
          </View>

          {/* Display Name */}
          <Text className="text-2xl font-bold text-dark">{displayName}</Text>

          {/* Tier Badge */}
          <View
            className="flex-row items-center mt-2 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: "#8B9E7C18" }}
          >
            <Text className="text-base mr-1">{tier.emoji}</Text>
            <Text className="text-sm font-semibold" style={{ color: "#8B9E7C" }}>
              {tier.label}
            </Text>
            <Text className="text-sm text-dark/40 ml-2">
              Score: {stats.crunchyScore}
            </Text>
          </View>

          {/* Bio */}
          {profileBio ? (
            <Text className="text-sm text-dark/60 text-center mt-3 px-8 leading-5">
              {profileBio}
            </Text>
          ) : null}

          {/* Edit Profile Button with Pencil Icon */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/edit-profile");
            }}
            className="mt-4 flex-row items-center bg-white border border-sage rounded-2xl px-5 py-2.5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="pencil-outline" size={16} color="#8B9E7C" />
            <Text className="text-sm font-semibold text-sage ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View
          className="mx-6 mt-5 bg-white rounded-2xl flex-row py-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
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
            <Text className="text-xl font-bold text-dark">0</Text>
            <Text className="text-xs text-dark/50 mt-0.5">Lists Created</Text>
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
              <Text className="text-sm font-medium text-sage">Scan More</Text>
            </TouchableOpacity>
          </View>

          {stats.totalScans > 0 ? (
            <FlatList
              horizontal
              data={SAMPLE_RECENT_SCANS}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => (
                <View
                  className="bg-white rounded-2xl p-3 items-center"
                  style={{
                    width: 110,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <Text className="text-3xl mb-2">{item.emoji}</Text>
                  <Text className="text-xs font-medium text-dark text-center" numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View
                    className="mt-1.5 px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: item.score >= 80 ? "#4CAF5018" : item.score >= 60 ? "#FFC10718" : "#F4433615",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: item.score >= 80 ? "#388E3C" : item.score >= 60 ? "#E6A800" : "#F44336",
                      }}
                    >
                      {item.score}
                    </Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <View className="mx-6 bg-white rounded-2xl p-6 items-center" style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}>
              <Text className="text-3xl mb-2">{"\u{1F4F7}"}</Text>
              <Text className="text-sm font-medium text-dark">No scans yet</Text>
              <Text className="text-xs text-dark/50 mt-1 text-center">
                Scan your first product to start tracking!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/scan")}
                className="mt-3 bg-sage px-5 py-2 rounded-2xl"
              >
                <Text className="text-sm font-semibold text-white">Scan a Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* My Lists Section */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text className="text-lg font-bold text-dark">My Lists</Text>
            <TouchableOpacity
              onPress={() => router.push("/lists")}
              hitSlop={8}
            >
              <Text className="text-sm font-medium text-sage">See All</Text>
            </TouchableOpacity>
          </View>

          {SAMPLE_LISTS.length > 0 ? (
            <View className="px-6" style={{ gap: 10 }}>
              {SAMPLE_LISTS.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  onPress={() => router.push("/lists")}
                  activeOpacity={0.7}
                  className="bg-white rounded-2xl p-4 flex-row items-center"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View className="w-11 h-11 rounded-xl bg-sage/10 items-center justify-center mr-3">
                    <Text className="text-xl">{list.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-dark">{list.name}</Text>
                    <Text className="text-xs text-dark/50 mt-0.5">
                      {list.itemCount} items
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#8B9E7C" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="mx-6 bg-white rounded-2xl p-6 items-center" style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}>
              <Text className="text-3xl mb-2">{"\u{1F4CB}"}</Text>
              <Text className="text-sm font-medium text-dark">No lists yet</Text>
              <Text className="text-xs text-dark/50 mt-1 text-center">
                Create lists to organize your favorite products!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/lists")}
                className="mt-3 bg-sage px-5 py-2 rounded-2xl"
              >
                <Text className="text-sm font-semibold text-white">Create a List</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
