import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "../utils/haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import {
  CONCERN_OPTIONS,
  usePreferences,
  type CrunchyConcerns,
} from "@/contexts/PreferencesContext";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function ConcernCard({
  option,
  enabled,
  onToggle,
  index,
}: {
  option: (typeof CONCERN_OPTIONS)[number];
  enabled: boolean;
  onToggle: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 60).duration(300)}>
      <AnimatedTouchable
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          animStyle,
          {
            borderWidth: 1,
            borderColor: enabled ? "#3D5A3E" : "rgba(0,0,0,0.12)",
            shadowColor: "#3D5A3E",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: enabled ? 0.15 : 0.04,
            shadowRadius: enabled ? 8 : 4,
            elevation: enabled ? 4 : 1,
          },
        ]}
        className={`flex-row items-center rounded-3xl px-4 py-4 mb-3 ${
          enabled ? "bg-forest" : "bg-white"
        }`}
      >
        <Text className="text-2xl mr-3">{option.icon}</Text>
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              enabled ? "text-white" : "text-dark"
            }`}
          >
            {option.label}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${
              enabled ? "text-white/70" : "text-dark/50"
            }`}
          >
            {option.description}
          </Text>
        </View>
        <View
          className={`w-6 h-6 rounded-full items-center justify-center ${
            enabled ? "bg-cream/30" : "border-2 border-dark/15"
          }`}
        >
          {enabled && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
}

export default function OnboardingPreferencesScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { concerns, setConcerns } = usePreferences();
  const [localConcerns, setLocalConcerns] = React.useState<CrunchyConcerns>(concerns);
  const isEditing = from === "settings";

  const toggleConcern = (key: keyof CrunchyConcerns) => {
    setLocalConcerns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enabledCount = Object.values(localConcerns).filter(Boolean).length;

  const handleFinish = async () => {
    await setConcerns(localConcerns);
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
          <Text
            className="text-2xl font-bold text-dark"
            style={{ fontFamily: "Georgia" }}
          >
            {isEditing ? "Edit Scan Preferences" : "What matters to you?"}
          </Text>
          <Text className="text-base text-dark/50 mt-2 mb-1">
            {isEditing
              ? "Update what the scanner focuses on when analyzing products."
              : "Tell us your concerns and we'll personalize your scan results and scores."}
          </Text>
          <Text className="text-sm text-forest font-medium mb-5">
            {enabledCount} of {CONCERN_OPTIONS.length} selected
            {enabledCount < 1 ? " (select at least 1)" : " ✓"}
          </Text>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {CONCERN_OPTIONS.map((option, index) => (
            <ConcernCard
              key={option.key}
              option={option}
              enabled={localConcerns[option.key]}
              onToggle={() => toggleConcern(option.key)}
              index={index}
            />
          ))}
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
            title={
              enabledCount < 1
                ? "Select at least 1"
                : isEditing
                ? "Save Preferences"
                : "Continue"
            }
            onPress={handleFinish}
            disabled={enabledCount < 1}
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
