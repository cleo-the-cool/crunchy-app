import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import {
  INTEREST_OPTIONS,
  InterestCategory,
  useInterests,
} from "@/contexts/InterestsContext";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function InterestChip({
  option,
  selected,
  onToggle,
  index,
}: {
  option: (typeof INTEREST_OPTIONS)[number];
  selected: boolean;
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
            shadowColor: selected ? "#8B9E7C" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: selected ? 0.2 : 0.06,
            shadowRadius: selected ? 8 : 4,
            elevation: selected ? 4 : 2,
          },
        ]}
        className={`flex-row items-center rounded-2xl px-4 py-4 mb-3 ${
          selected ? "bg-sage" : "bg-white"
        }`}
      >
        <Text className="text-2xl mr-3">{option.icon}</Text>
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              selected ? "text-white" : "text-dark"
            }`}
          >
            {option.label}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${
              selected ? "text-white/70" : "text-dark/50"
            }`}
          >
            {option.description}
          </Text>
        </View>
        <View
          className={`w-6 h-6 rounded-full items-center justify-center ${
            selected ? "bg-white/30" : "border-2 border-dark/15"
          }`}
        >
          {selected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
}

export default function InterestsScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { interests: savedInterests, setInterests } = useInterests();
  const [selected, setSelected] = useState<InterestCategory[]>(savedInterests);

  const toggleInterest = (id: InterestCategory) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await setInterests(selected);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (from === "settings") {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const isEditing = from === "settings";

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-5 pt-2">
        {/* Header */}
        {isEditing && (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            className="mb-2"
          >
            <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
          </TouchableOpacity>
        )}

        <Animated.View entering={FadeIn.duration(400)}>
          <Text className="text-2xl font-bold text-dark">
            {isEditing ? "Edit Your Interests" : "What are you into?"}
          </Text>
          <Text className="text-base text-dark/50 mt-2 mb-1">
            {isEditing
              ? "Update your interests to personalize your feed."
              : "Pick at least 2 topics to personalize your experience."}
          </Text>
          <Text className="text-sm text-sage font-medium mb-5">
            {selected.length} of {INTEREST_OPTIONS.length} selected
            {selected.length < 2 ? " (2 minimum)" : ""}
          </Text>
        </Animated.View>

        {/* Interest Chips */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {INTEREST_OPTIONS.map((option, index) => (
            <InterestChip
              key={option.id}
              option={option}
              selected={selected.includes(option.id)}
              onToggle={() => toggleInterest(option.id)}
              index={index}
            />
          ))}
        </ScrollView>

        {/* Bottom CTA */}
        <View
          className="absolute bottom-8 left-5 right-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          }}
        >
          <Button
            title={
              selected.length < 2
                ? `Select ${2 - selected.length} more`
                : isEditing
                  ? "Save Interests"
                  : "Continue"
            }
            onPress={handleContinue}
            disabled={selected.length < 2}
          />
          {!isEditing && (
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              className="items-center py-3 mt-1"
            >
              <Text className="text-sage font-medium">Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaWrapper>
  );
}
