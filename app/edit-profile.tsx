import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoBack } from "@/lib/useGoBack";
import { useAuth } from "@/contexts/AuthContext";
import { useInterests } from "@/contexts/InterestsContext";
import { INTEREST_OPTIONS, type InterestCategory } from "@/contexts/InterestsContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import * as Haptics from "../utils/haptics";

const PROFILE_STORAGE_KEY = "@crunchy_onboarding_profile";

export default function EditProfileScreen() {
  const goBack = useGoBack();
  const { user, updateName } = useAuth();
  const { interests, setInterests } = useInterests();
  const [displayName, setDisplayName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<InterestCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    setSelectedInterests(interests);
  }, [interests]);

  async function loadProfile() {
    const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      const profile = JSON.parse(stored);
      setDisplayName(profile.displayName ?? user?.name ?? "");
    } else {
      setDisplayName(user?.name ?? "");
    }
  }

  function toggleInterest(id: InterestCategory) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const profile = {
      displayName: displayName.trim(),
    };

    // Save to AsyncStorage
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

    // Update auth context name
    await updateName(displayName.trim());

    // Save interests via context
    await setInterests(selectedInterests);

    // Attempt Supabase persistence if configured
    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          display_name: profile.displayName,
          interests: selectedInterests,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Supabase save failed silently
      }
    }

    setIsSaving(false);
    goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
            <TouchableOpacity onPress={goBack} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-dark">Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving} hitSlop={8}>
              <Text className={`text-base font-semibold ${isSaving ? "text-dark/30" : "text-forest"}`}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <View className="px-6 mt-4 mb-5">
              <Text className="text-sm font-medium text-dark mb-1.5">
                Your Name
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="What should we call you?"
                placeholderTextColor="#A8B89C"
                autoCapitalize="words"
                className="bg-white rounded-3xl px-4 py-3.5 text-base text-dark"
                style={inputShadow}
              />
            </View>

            {/* Interests */}
            <View className="px-6 mb-5">
              <Text className="text-sm font-medium text-dark mb-1.5">
                Interests
              </Text>
              <Text className="text-xs text-dark/40 mb-3">
                Select categories you care about most
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((option) => {
                  const isSelected = selectedInterests.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => toggleInterest(option.id)}
                      activeOpacity={0.7}
                      className={`flex-row items-center px-3.5 py-2.5 rounded-3xl ${
                        isSelected ? "bg-forest/10 border border-forest" : "bg-cream border border-cream-dark"
                      }`}
                      style={isSelected ? selectedChipShadow : inputShadow}
                    >
                      <Text className="text-base mr-1.5">{option.icon}</Text>
                      <Text
                        className={`text-sm font-medium ${isSelected ? "text-forest" : "text-dark/70"}`}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <View className="ml-1.5 w-4 h-4 rounded-full bg-forest items-center justify-center">
                          <Text className="text-white text-[8px] font-bold">{"\u2713"}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const inputShadow = {
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.12)",
};

const selectedChipShadow = {
  shadowColor: "#3D5A3E",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 2,
};
