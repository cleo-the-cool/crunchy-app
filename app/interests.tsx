import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "../utils/haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInRight,
  FadeOutLeft,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import {
  INTEREST_OPTIONS,
  InterestCategory,
  useInterests,
} from "@/contexts/InterestsContext";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Map each interest to a personalized benefit message
const INTEREST_BENEFITS: Record<InterestCategory, string> = {
  food: "Food label analysis and clean eating inspiration",
  skincare: "Ingredient scanner optimized for beauty products",
  cleaning: "Cleaning product alternatives and DIY recipes",
  personal_care: "Toxin-free personal care swaps and ratings",
  clothing: "Sustainable fashion picks and fabric guides",
  home: "Non-toxic home product recommendations",
  baby: "Safe baby product ratings and alerts",
};

// Step indicator dots
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row items-center justify-center py-4 gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <Animated.View
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? "#3D5A3E" : "#3D5A3E40",
          }}
          entering={FadeIn.delay(i * 100)}
        />
      ))}
    </View>
  );
}

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
            shadowColor: selected ? "#3D5A3E" : "#3D5A3E",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: selected ? 0.2 : 0.06,
            shadowRadius: selected ? 8 : 4,
            elevation: selected ? 4 : 2,
          },
        ]}
        className={`flex-row items-center rounded-3xl px-4 py-4 mb-3 ${
          selected ? "bg-forest" : "bg-cream"
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
            selected ? "bg-cream/30" : "border-2 border-dark/15"
          }`}
        >
          {selected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
}

// Step 1: Welcome
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View
        entering={FadeIn.duration(600)}
        className="items-center mb-10"
      >
        {/* Creative icon arrangement */}
        <View className="flex-row items-center mb-6">
          <Animated.View entering={FadeIn.delay(200).duration(400)}>
            <Ionicons name="leaf" size={36} color="#3D5A3E" />
          </Animated.View>
          <Animated.View
            entering={FadeIn.delay(400).duration(400)}
            style={{ marginHorizontal: 8, marginTop: -16 }}
          >
            <Ionicons name="sparkles" size={28} color="#D4A574" />
          </Animated.View>
          <Animated.View entering={FadeIn.delay(600).duration(400)}>
            <Ionicons name="heart" size={36} color="#C97B7B" />
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeIn.delay(300).duration(500)}
          className="items-center"
        >
          <Text
            className="text-3xl font-bold text-dark text-center mb-3"
            style={{ fontFamily: 'Georgia' }}
          >
            Welcome to Crunchy
          </Text>
          <Text className="text-base text-dark/50 text-center leading-6">
            Your clean living journey starts here.{"\n"}We'll personalize
            everything based on your goals.
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(800).duration(400)}
        className="w-full"
      >
        <Button title="Let's Go 🌿" onPress={onNext} />
      </Animated.View>
    </View>
  );
}

// Step 2: Interest Selection
function InterestSelectionStep({
  selected,
  onToggle,
}: {
  selected: InterestCategory[];
  onToggle: (id: InterestCategory) => void;
}) {
  return (
    <View className="flex-1">
      <Animated.View entering={FadeIn.duration(400)}>
        <Text
          className="text-2xl font-bold text-dark"
          style={{ fontFamily: 'Georgia' }}
        >
          What matters most to you?
        </Text>
        <Text className="text-base text-dark/50 mt-2 mb-1">
          We'll customize your feed, recommendations, and tips based on what you
          care about.
        </Text>
        <Text className="text-sm text-forest font-medium mb-5">
          {selected.length} of {INTEREST_OPTIONS.length} selected
          {selected.length < 2 ? " (2 minimum)" : " ✓"}
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {INTEREST_OPTIONS.map((option, index) => (
          <InterestChip
            key={option.id}
            option={option}
            selected={selected.includes(option.id)}
            onToggle={() => onToggle(option.id)}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Step 3: Your Plan
function PlanStep({
  selected,
  onFinish,
}: {
  selected: InterestCategory[];
  onFinish: () => void;
}) {
  const selectedOptions = INTEREST_OPTIONS.filter((o) =>
    selected.includes(o.id)
  );
  const selectedLabels = selectedOptions.map((o) => o.label);

  // Build a nice comma-separated list
  const listText =
    selectedLabels.length <= 2
      ? selectedLabels.join(" and ")
      : selectedLabels.slice(0, -1).join(", ") +
        ", and " +
        selectedLabels[selectedLabels.length - 1];

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text
            className="text-2xl font-bold text-dark mb-2"
            style={{ fontFamily: 'Georgia' }}
          >
            Your Clean Living Plan
          </Text>
          <Text className="text-base text-dark/50 mb-6 leading-6">
            Based on your interest in {listText}, here's what we've set up for
            you:
          </Text>
        </Animated.View>

        {/* Personalized benefits */}
        {selected.map((id, index) => {
          const option = INTEREST_OPTIONS.find((o) => o.id === id);
          if (!option) return null;
          return (
            <Animated.View
              key={id}
              entering={FadeIn.delay(200 + index * 120).duration(400)}
              className="flex-row items-start bg-white rounded-3xl px-4 py-4 mb-3"
              style={{
                borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
              }}
            >
              <Text className="text-xl mr-3 mt-0.5">{option.icon}</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-dark">
                  {option.label}
                </Text>
                <Text className="text-sm text-dark/50 mt-1">
                  {INTEREST_BENEFITS[id]}
                </Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#3D5A3E"
                style={{ marginTop: 2 }}
              />
            </Animated.View>
          );
        })}

        {/* Crunchy Level teaser */}
        <Animated.View
          entering={FadeIn.delay(200 + selected.length * 120 + 100).duration(
            400
          )}
          className="bg-forest/8 rounded-3xl px-5 py-5 mt-4"
          style={{
            borderWidth: 1,
            borderColor: "#3D5A3E20",
          }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="trophy-outline" size={22} color="#3D5A3E" />
            <Text className="text-base font-semibold text-dark ml-2">
              Your Starting Crunchy Level
            </Text>
          </View>
          <Text className="text-sm text-dark/50 leading-5">
            Let's find out! Take the quiz in your profile to see where you land
            on the crunchy spectrum. 🌱
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

export default function InterestsScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { interests: savedInterests, setInterests } = useInterests();
  const [selected, setSelected] = useState<InterestCategory[]>(savedInterests);
  const isEditing = from === "settings";

  // For editing flow, skip welcome and plan steps
  const [step, setStep] = useState(isEditing ? 1 : 0);
  const totalSteps = 2;

  const toggleInterest = (id: InterestCategory) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isEditing) {
      router.back();
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  };

  const handleFinish = async () => {
    await setInterests(selected);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isEditing) {
      router.back();
    } else {
      router.push("/onboarding-preferences");
    }
  };

  // Editing mode: simplified single-step view
  if (isEditing) {
    return (
      <SafeAreaWrapper>
        <View className="flex-1 px-5 pt-2">
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
              style={{ fontFamily: 'Georgia' }}
            >
              Edit Your Interests
            </Text>
            <Text className="text-base text-dark/50 mt-2 mb-1">
              Update your interests to personalize your feed.
            </Text>
            <Text className="text-sm text-forest font-medium mb-5">
              {selected.length} of {INTEREST_OPTIONS.length} selected
              {selected.length < 2 ? " (2 minimum)" : " ✓"}
            </Text>
          </Animated.View>

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
                selected.length < 2
                  ? `Select ${2 - selected.length} more`
                  : "Save Interests"
              }
              onPress={handleFinish}
              disabled={selected.length < 2}
            />
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  // Onboarding multi-step flow
  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-5 pt-2">
        {/* Step indicator */}
        <StepDots current={step} total={totalSteps} />

        {/* Back button for steps > 0 */}
        {step > 0 && (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={8}
            className="mb-2"
          >
            <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
          </TouchableOpacity>
        )}

        {/* Step content */}
        {step === 0 && <WelcomeStep onNext={handleNext} />}

        {step === 1 && (
          <>
            <InterestSelectionStep
              selected={selected}
              onToggle={toggleInterest}
            />
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
                  selected.length < 2
                    ? `Select ${2 - selected.length} more`
                    : "Start Exploring 🚀"
                }
                onPress={handleFinish}
                disabled={selected.length < 2}
              />
              <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                className="items-center py-3 mt-1"
              >
                <Text className="text-forest font-medium">Skip for now</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaWrapper>
  );
}
