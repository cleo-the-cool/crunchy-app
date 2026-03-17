import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ViewShot from "../utils/view-shot";
import * as Sharing from "../utils/sharing";
import type { CrunchyStats } from "@/lib/crunchyScore";

interface ScoreCardProps {
  stats: CrunchyStats;
  userName?: string;
}

const tierColors: Record<string, { bg: string; text: string; ring: string }> = {
  seedling: { bg: "#F4433610", text: "#F44336", ring: "#F44336" },
  sprout: { bg: "#FFC10712", text: "#E6A800", ring: "#FFC107" },
  sapling: { bg: "#8B9E7C12", text: "#3D5A3E", ring: "#8B9E7C" },
  bloom: { bg: "#4CAF5012", text: "#388E3C", ring: "#4CAF50" },
};

export function ScoreCard({ stats, userName }: ScoreCardProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const colors = tierColors[stats.tier.tier] || tierColors.seedling;

  const handleShare = async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch {
      Alert.alert("Oops", "Could not share your score card. Try again!");
    }
  };

  return (
    <View>
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
        <View
          className="mx-5 bg-white rounded-3xl p-6"
          style={{
            borderWidth: 1, borderColor: "rgba(0,0,0,0.12)"
          }}
        >
          {/* Header */}
          <View className="items-center mb-2">
            {userName && (
              <Text className="text-sm text-dark/40 mb-1">{userName}</Text>
            )}
            <Text className="text-5xl mb-3">{stats.tier.emoji}</Text>

            {/* Score Circle */}
            <View
              className="w-28 h-28 rounded-full items-center justify-center mb-3"
              style={{
                backgroundColor: colors.bg,
                borderWidth: 3,
                borderColor: colors.ring,
              }}
            >
              <Text
                className="text-3xl font-bold"
                style={{ color: colors.text }}
              >
                {stats.crunchyScore}
              </Text>
              <Text className="text-xs text-dark/40">/ 100</Text>
            </View>

            <Text
              className="text-lg"
              style={{ color: colors.text, fontFamily: "Georgia", fontWeight: "700" }}
            >
              {stats.tier.label}
            </Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row mt-4 pt-4 border-t border-sage/15">
            <View className="flex-1 items-center">
              <Ionicons name="barcode-outline" size={18} color="#8B9E7C" />
              <Text className="text-lg font-bold text-dark mt-1">
                {stats.totalScans}
              </Text>
              <Text className="text-xs text-dark/40">Scans</Text>
            </View>
            <View className="flex-1 items-center border-x border-sage/15">
              <Ionicons name="flask-outline" size={18} color="#8B9E7C" />
              <Text className="text-lg font-bold text-dark mt-1">
                {stats.recipesMade}
              </Text>
              <Text className="text-xs text-dark/40">Recipes</Text>
            </View>
            <View className="flex-1 items-center">
              <Ionicons name="calendar-outline" size={18} color="#8B9E7C" />
              <Text className="text-lg font-bold text-dark mt-1">
                {stats.daysActive}
              </Text>
              <Text className="text-xs text-dark/40">Days</Text>
            </View>
          </View>

          {/* Branding */}
          <View className="items-center mt-4 pt-3 border-t border-sage/15">
            <Text
              className="text-xs text-sage"
              style={{ fontWeight: "600", letterSpacing: 3 }}
            >
              CRUNCHY
            </Text>
          </View>
        </View>
      </ViewShot>

      {/* Share Button */}
      <View className="mx-5 mt-3">
        <TouchableOpacity
          onPress={handleShare}
          className="flex-row items-center justify-center bg-forest/8 py-3.5 rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={18} color="#3D5A3E" />
          <Text className="text-forest font-semibold ml-2">
            Share Your Score
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
