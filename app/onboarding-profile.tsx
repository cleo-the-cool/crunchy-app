import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "../utils/haptics";
import { SafeAreaWrapper, Button } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const AVATAR_PRESETS = [
  { id: "leaf", emoji: "🌿" },
  { id: "sunflower", emoji: "🌻" },
  { id: "mushroom", emoji: "🍄" },
  { id: "avocado", emoji: "🥑" },
  { id: "butterfly", emoji: "🦋" },
  { id: "bee", emoji: "🐝" },
  { id: "cherry", emoji: "🍒" },
  { id: "rainbow", emoji: "🌈" },
  { id: "star", emoji: "⭐" },
  { id: "cactus", emoji: "🌵" },
  { id: "peach", emoji: "🍑" },
  { id: "herb", emoji: "🌱" },
];

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }
    if (!selectedAvatar) {
      setError("Please pick an avatar");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Save avatar + display name to AsyncStorage for now
    // Will sync to Supabase profile when auth is wired up
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(
      "@crunchy_onboarding_profile",
      JSON.stringify({ displayName: displayName.trim(), avatar: selectedAvatar })
    );

    router.push("/quiz");
  };

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-6 pb-32"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(400)} className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-sage items-center justify-center mb-4">
              <Ionicons name="person-add" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-dark mb-1">
              Set Up Your Profile
            </Text>
            <Text className="text-base text-dark-light text-center">
              Choose a name and avatar for the community
            </Text>
          </Animated.View>

          {/* Display Name */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-8">
            <Text className="text-sm font-medium text-dark mb-1.5">
              Display Name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={(t) => {
                setDisplayName(t);
                if (error) setError("");
              }}
              placeholder="What should we call you?"
              placeholderTextColor="#999"
              autoCapitalize="words"
              className="border-2 border-cream-dark rounded-2xl px-4 py-3.5 text-base text-dark bg-white"
            />
          </Animated.View>

          {/* Avatar Picker */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text className="text-sm font-medium text-dark mb-3">
              Pick Your Avatar
            </Text>
            <View className="flex-row flex-wrap justify-center gap-3">
              {AVATAR_PRESETS.map((avatar, index) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <TouchableOpacity
                    key={avatar.id}
                    onPress={() => {
                      setSelectedAvatar(avatar.id);
                      if (error) setError("");
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.7}
                    className={`w-16 h-16 rounded-2xl items-center justify-center ${
                      isSelected
                        ? "bg-sage/15 border-2 border-sage"
                        : "bg-white border-2 border-cream-dark"
                    }`}
                    style={
                      isSelected
                        ? {
                            shadowColor: "#8B9E7C",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 6,
                            elevation: 3,
                          }
                        : undefined
                    }
                  >
                    <Text className="text-3xl">{avatar.emoji}</Text>
                    {isSelected && (
                      <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sage items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          ✓
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {error ? (
            <Text className="text-rating-avoid text-sm mt-4 text-center">
              {error}
            </Text>
          ) : null}
        </ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-8 left-6 right-6">
          <Button
            title="Continue to Quiz"
            onPress={handleContinue}
          />
          <TouchableOpacity
            onPress={() => router.push("/quiz")}
            className="items-center py-3 mt-1"
          >
            <Text className="text-sage font-medium">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
