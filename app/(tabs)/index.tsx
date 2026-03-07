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
import * as Haptics from "../../utils/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components";
import { getDefaultStats } from "@/lib/crunchyScore";

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
  const stats = getDefaultStats();
  const tierInfo = stats.tier;

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
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-dark">
            Hey, {firstName}!
          </Text>
          <Text className="text-sm text-dark/50 mt-1">
            Your clean living dashboard
          </Text>
        </View>

        {/* Crunchy Score Card */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={() => router.push("/score-detail")}
            activeOpacity={0.8}
            className="bg-sage rounded-2xl p-5"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white/70 text-sm font-medium">Crunchy Score</Text>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-white text-4xl font-bold">{stats.crunchyScore}</Text>
                  <Text className="text-white/50 text-lg ml-1">/ 100</Text>
                </View>
                <View className="flex-row items-center mt-2">
                  <Text className="text-2xl mr-1.5">{tierInfo.emoji}</Text>
                  <Text className="text-white font-semibold text-base">{tierInfo.label}</Text>
                </View>
              </View>
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Ionicons name="leaf" size={28} color="white" />
                </View>
                <View className="flex-row items-center mt-2">
                  <Text className="text-white/70 text-xs">View details</Text>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
            </View>

            {/* Mini stats row */}
            <View className="flex-row mt-4 pt-3 border-t" style={{ borderTopColor: "rgba(255,255,255,0.2)" }}>
              <View className="flex-1 flex-row items-center">
                <Ionicons name="barcode-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/80 text-xs ml-1">{stats.totalScans} scans</Text>
              </View>
              <View className="flex-1 flex-row items-center justify-center">
                <Ionicons name="flask-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/80 text-xs ml-1">{stats.recipesMade} recipes</Text>
              </View>
              <View className="flex-1 flex-row items-center justify-end">
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/80 text-xs ml-1">{stats.daysActive} days</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Scan Button */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={handleScan}
            activeOpacity={0.85}
            className="bg-white rounded-2xl py-5 flex-row items-center px-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="bg-sage rounded-full w-12 h-12 items-center justify-center mr-4">
              <Ionicons name="scan" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-dark text-lg font-bold">Scan a Product</Text>
              <Text className="text-dark/50 text-sm">
                Barcode, label, or photo
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B9E7C" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View className="flex-row px-5 mt-4 gap-3">
          <StatCard
            icon="barcode-outline"
            value={stats.totalScans}
            label="Scans"
            onPress={() => router.push("/(tabs)/scan")}
          />
          <StatCard
            icon="bookmark-outline"
            value={0}
            label="Saved"
            onPress={() => router.push("/(tabs)/profile")}
          />
        </View>

        {/* Getting Started */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Getting Started
          </Text>
          <Card>
            <View className="items-center py-4">
              <Text className="text-4xl mb-3">🌱</Text>
              <Text className="text-base font-bold text-dark text-center">
                Welcome to your clean living journey!
              </Text>
              <Text className="text-sm text-dark/50 text-center mt-2 px-4">
                Scan your first product to start building your crunchy score and discover cleaner alternatives.
              </Text>
              <TouchableOpacity
                onPress={handleScan}
                className="mt-4 bg-sage px-6 py-3 rounded-2xl"
              >
                <Text className="text-white font-semibold">Scan Your First Product</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Community */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Community
          </Text>
          <Card>
            <View className="items-center py-4">
              <Text className="text-4xl mb-3">💬</Text>
              <Text className="text-sm text-dark/50 text-center">
                Join the community to see trending tips and clean living inspiration!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/community")}
                className="mt-3 bg-sage/10 px-5 py-2.5 rounded-2xl"
              >
                <Text className="text-sage font-semibold text-sm">Explore Community</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
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
    </TouchableOpacity>
  );
}

