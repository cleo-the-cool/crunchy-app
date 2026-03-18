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

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Save display name to AsyncStorage
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(
      "@crunchy_onboarding_profile",
      JSON.stringify({ displayName: displayName.trim() })
    );

    router.push("/quiz");
  };

  const firstInitial = displayName.trim().charAt(0).toUpperCase() || "?";

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
            <View className="w-16 h-16 rounded-2xl bg-forest items-center justify-center mb-4">
              <Ionicons name="person-add" size={32} color="white" />
            </View>
            <Text
              className="text-2xl font-bold text-dark mb-1"
                         >
              Set Up Your Profile
            </Text>
            <Text className="text-base text-dark-light text-center">
              Choose a name for the community
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
              className="border-2 border-cream-dark rounded-2xl px-4 py-3.5 text-base text-dark bg-cream"
            />
          </Animated.View>

          {/* Avatar Preview */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="items-center">
            <Text className="text-sm font-medium text-dark mb-3">
              Your Avatar
            </Text>
            <View
              className="w-24 h-24 rounded-full bg-forest items-center justify-center"
              style={{
                shadowColor: "#3D5A3E",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-4xl font-bold text-white">{firstInitial}</Text>
            </View>
            <Text className="text-xs text-dark/40 mt-2">Your first initial will be your avatar</Text>
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
            <Text className="text-forest font-medium">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
