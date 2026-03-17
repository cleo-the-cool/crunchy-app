import { View, Text, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useGoBack } from "@/lib/useGoBack";
import { Badge } from "@/components";
import { getDefaultStats, type CrunchyStats } from "@/lib/crunchyScore";

const TIER_DETAILS = [
  { emoji: "🌱", label: "Seedling", range: "0-25", description: "Just starting your clean living journey" },
  { emoji: "🌿", label: "Sprout", range: "26-50", description: "Building healthy habits" },
  { emoji: "🌳", label: "Sapling", range: "51-75", description: "Making consistently clean choices" },
  { emoji: "🌸", label: "In Bloom", range: "76-100", description: "A true clean living champion" },
];

function BreakdownRow({
  icon,
  label,
  detail,
  weight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
  weight: string;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-dark/5">
      <View className="w-10 h-10 rounded-full bg-forest/8 items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#3D5A3E" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-dark">{label}</Text>
        <Text className="text-xs text-dark/50 mt-0.5">{detail}</Text>
      </View>
      <Text className="text-xs font-semibold text-forest">{weight}</Text>
    </View>
  );
}

export default function ScoreDetailScreen() {
  const goBack = useGoBack();
  const stats: CrunchyStats = getDefaultStats();
  const tierInfo = stats.tier;

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={goBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark" style={{ fontFamily: 'Georgia' }}>Your Crunchy Score</Text>
        </View>

        {/* Score Card with Nature Background */}
        <View className="mx-5 mt-4">
          <ImageBackground
            source={require("@/assets/images/aesthetic/water-leaf.jpg")}
            resizeMode="cover"
            imageStyle={{ borderRadius: 24 }}
          >
            <View
              className="rounded-3xl p-6 items-center"
              style={{ backgroundColor: "rgba(61,90,62,0.65)" }}
            >
              <Text className="text-5xl mb-1">{tierInfo.emoji}</Text>
              <Text className="text-5xl font-bold text-white mt-1">
                {stats.crunchyScore}
              </Text>
              <Text className="text-white/80 text-base mt-1">{tierInfo.label}</Text>
              <View className="mt-3">
                <Badge rating={tierInfo.badge} size="md" label={tierInfo.label} />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Stats Summary */}
        <View className="flex-row px-5 mt-5 gap-3">
          <View className="flex-1 bg-white rounded-3xl py-3 items-center">
            <Text className="text-lg font-bold text-dark">{stats.totalScans}</Text>
            <Text className="text-xs text-dark/50">Total Scans</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl py-3 items-center">
            <Text className="text-lg font-bold text-dark">{stats.recipesMade}</Text>
            <Text className="text-xs text-dark/50">Recipes Made</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl py-3 items-center">
            <Text className="text-lg font-bold text-dark">{stats.daysActive}</Text>
            <Text className="text-xs text-dark/50">{stats.daysActive === 1 ? "Day" : "Days"} Active</Text>
          </View>
        </View>

        {/* Score Breakdown */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>How Your Score Works</Text>
          <View className="bg-white rounded-3xl px-4 py-1">
            <BreakdownRow
              icon="barcode-outline"
              label="Scan History"
              detail="Average product ratings + engagement bonus"
              weight="80%"
            />
            <BreakdownRow
              icon="restaurant-outline"
              label="Recipes Made"
              detail="Clean recipes you've tried"
              weight="20%"
            />
            <BreakdownRow
              icon="school-outline"
              label="Quiz Baseline"
              detail="Initial score from onboarding quiz (decays over 1 year)"
              weight="Bonus"
            />
          </View>
        </View>

        {/* Tiers */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>Tiers</Text>
          <View className="bg-white rounded-3xl px-4 py-2">
            {TIER_DETAILS.map((t, i) => {
              const isCurrentTier = t.label === tierInfo.label;
              return (
                <View
                  key={t.label}
                  className={`flex-row items-center py-3 ${i < TIER_DETAILS.length - 1 ? "border-b border-dark/5" : ""}`}
                >
                  <Text className="text-2xl mr-3">{t.emoji}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className={`text-sm font-semibold ${isCurrentTier ? "text-forest" : "text-dark"}`}>
                        {t.label}
                      </Text>
                      {isCurrentTier && (
                        <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3D5A3E15" }}>
                          <Text className="text-xs text-forest font-semibold">You</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-dark/50 mt-0.5">{t.description}</Text>
                  </View>
                  <Text className="text-xs text-dark/40 font-medium">{t.range}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tips */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3" style={{ fontFamily: 'Georgia' }}>Level Up Your Score</Text>
          <View className="bg-white rounded-3xl p-4">
            <View className="flex-row items-start mb-3">
              <Ionicons name="scan-outline" size={18} color="#3D5A3E" />
              <Text className="text-sm text-dark/70 ml-2 flex-1">
                Scan more products to build your scan history
              </Text>
            </View>
            <View className="flex-row items-start mb-3">
              <Ionicons name="restaurant-outline" size={18} color="#3D5A3E" />
              <Text className="text-sm text-dark/70 ml-2 flex-1">
                Try clean recipes from the Explore tab
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="swap-horizontal-outline" size={18} color="#3D5A3E" />
              <Text className="text-sm text-dark/70 ml-2 flex-1">
                Choose cleaner alternatives when shopping
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
