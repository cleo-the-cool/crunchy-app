import { useState, useCallback, useEffect } from "react";
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
import * as Haptics from "../../utils/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components";
import { getDefaultStats } from "@/lib/crunchyScore";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [hasTakenQuiz, setHasTakenQuiz] = useState<boolean | null>(null);

  useEffect(() => {
    checkQuizStatus();
  }, []);

  async function checkQuizStatus() {
    try {
      const quizData = await AsyncStorage.getItem("@crunchy_quiz_score");
      setHasTakenQuiz(quizData !== null);
    } catch {
      setHasTakenQuiz(false);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkQuizStatus();
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
        contentContainerStyle={{ paddingBottom: 40 }}
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
        <View className="px-6 pt-5 pb-1">
          <Text className="text-2xl font-bold text-dark">
            Welcome back, {firstName}!
          </Text>
          <Text className="text-sm text-dark/50 mt-1">
            Your clean living dashboard
          </Text>
        </View>

        {/* Quiz CTA - only show if user hasn't taken quiz */}
        {hasTakenQuiz === false && (
          <View className="px-6 mt-5">
            <TouchableOpacity
              onPress={() => router.push("/quiz")}
              activeOpacity={0.85}
              className="bg-peach rounded-2xl p-5"
              style={{
                shadowColor: "#F4A574",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              }}
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
                    Discover your clean living score and get personalized tips
                  </Text>
                </View>
                <View
                  className="w-14 h-14 rounded-full items-center justify-center ml-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                >
                  <Text className="text-3xl">🌿</Text>
                </View>
              </View>
              <View className="flex-row items-center mt-3">
                <Text className="text-white font-semibold text-sm">Start Quiz</Text>
                <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Crunchy Score Card */}
        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() => router.push("/score-detail")}
            activeOpacity={0.85}
            className="bg-sage rounded-2xl p-6"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              Crunchy Score
            </Text>

            <View className="flex-row items-center justify-between mt-3">
              <View className="flex-1">
                <View className="flex-row items-baseline">
                  <Text className="text-white text-5xl font-bold">
                    {stats.crunchyScore}
                  </Text>
                  <Text className="text-white/40 text-xl ml-1.5">/ 100</Text>
                </View>
                <View className="flex-row items-center mt-2">
                  <Text className="text-3xl mr-2">{tierInfo.emoji}</Text>
                  <Text className="text-white font-bold text-lg">
                    {tierInfo.label}
                  </Text>
                </View>
              </View>
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Ionicons name="leaf" size={30} color="white" />
                </View>
              </View>
            </View>

            {/* Mini stats row */}
            <View
              className="flex-row mt-5 pt-4"
              style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)" }}
            >
              <View className="flex-1 flex-row items-center">
                <Ionicons name="barcode-outline" size={15} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/80 text-xs ml-1.5">{stats.totalScans} scans</Text>
              </View>
              <View className="flex-1 flex-row items-center justify-center">
                <Ionicons name="flask-outline" size={15} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/80 text-xs ml-1.5">{stats.recipesMade} recipes</Text>
              </View>
              <View className="flex-1 flex-row items-center justify-end">
                <Ionicons name="calendar-outline" size={15} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/80 text-xs ml-1.5">{stats.daysActive} days</Text>
              </View>
            </View>

            {/* View Details arrow */}
            <View className="flex-row items-center justify-center mt-4">
              <Text className="text-white/60 text-xs font-medium">View Details</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.6)" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Action Buttons */}
        <View className="flex-row px-6 mt-5 gap-3">
          <QuickActionButton
            icon="scan"
            label="Scan"
            onPress={handleScan}
          />
          <QuickActionButton
            icon="leaf-outline"
            label="Score"
            onPress={() => router.push("/score-detail")}
          />
          <QuickActionButton
            icon="bookmark-outline"
            label="Saved"
            onPress={() => router.push("/(tabs)/profile")}
          />
        </View>

        {/* Getting Started */}
        <View className="px-6 mt-7">
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
                activeOpacity={0.85}
                className="mt-4 bg-sage px-6 py-3 rounded-2xl"
              >
                <Text className="text-white font-semibold">
                  Scan Your First Product
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Community */}
        <View className="px-6 mt-7">
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
                activeOpacity={0.85}
                className="mt-3 bg-sage/10 px-5 py-2.5 rounded-2xl"
              >
                <Text className="text-sage font-semibold text-sm">
                  Explore Community
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
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
      className="flex-1 bg-white rounded-2xl py-4 items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="w-11 h-11 rounded-full bg-sage/10 items-center justify-center mb-2">
        <Ionicons name={icon} size={22} color="#8B9E7C" />
      </View>
      <Text className="text-sm font-semibold text-dark">{label}</Text>
    </TouchableOpacity>
  );
}
