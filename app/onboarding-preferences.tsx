import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import RNSlider from "@react-native-community/slider";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "../utils/haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import {
  PREFERENCE_OPTIONS,
  usePreferences,
} from "@/contexts/PreferencesContext";
import { DEFAULT_PREFERENCES, type UserPreferences } from "@/lib/scoring";

export default function OnboardingPreferencesScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { preferences, setAllPreferences } = usePreferences();
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);
  const isEditing = from === "settings";

  const updatePref = (key: keyof UserPreferences, value: number) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: Math.round(value * 100) / 100 }));
  };

  const handleFinish = async () => {
    await setAllPreferences(localPrefs);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isEditing) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-5 pt-2">
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="mb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>

        <Animated.View entering={FadeIn.duration(400)}>
          <Text className="text-2xl font-bold text-dark">
            {isEditing ? "Edit Scan Preferences" : "What matters to you?"}
          </Text>
          <Text className="text-base text-dark/50 mt-2 mb-5">
            {isEditing
              ? "Adjust how much each category affects your product scores."
              : "Set how important each category is to you. We'll personalize your scores accordingly."}
          </Text>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {PREFERENCE_OPTIONS.map((option, index) => {
            const value = localPrefs[option.key];
            const pct = Math.round(value * 100);
            return (
              <Animated.View
                key={option.key}
                entering={FadeIn.delay(index * 60).duration(300)}
                className="bg-white rounded-3xl px-5 py-4 mb-3"
                style={{
                  shadowColor: "#3D5A3E",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-3">{option.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-dark">
                      {option.label}
                    </Text>
                    <Text className="text-xs text-dark/50 mt-0.5">
                      {option.description}
                    </Text>
                  </View>
                  <View className="bg-forest/10 rounded-full px-2.5 py-1">
                    <Text className="text-forest text-sm font-bold">{pct}%</Text>
                  </View>
                </View>

                <View className="flex-row items-center mt-1">
                  <Text numberOfLines={1} style={{ fontSize: 10, color: "rgba(45,45,45,0.3)", width: 56 }}>Don't care</Text>
                  <View className="flex-1 mx-2">
                    <RNSlider
                      value={value}
                      onValueChange={(v: number) => updatePref(option.key, v)}
                      minimumValue={0}
                      maximumValue={1}
                      step={0.05}
                      minimumTrackTintColor="#3D5A3E"
                      maximumTrackTintColor="#E5E7EB"
                      thumbTintColor="#3D5A3E"
                      style={{ flex: 1 }}
                    />
                  </View>
                  <Text numberOfLines={1} style={{ fontSize: 10, color: "rgba(45,45,45,0.3)", width: 56, textAlign: "right" }}>Very important</Text>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>

        <View
          className="absolute bottom-8 left-5 right-5"
          style={{
            shadowColor: "#3D5A3E",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          }}
        >
          <Button
            title={isEditing ? "Save Preferences" : "Continue"}
            onPress={handleFinish}
          />
          {!isEditing && (
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              className="items-center py-3 mt-1"
            >
              <Text className="text-forest font-medium">Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaWrapper>
  );
}
