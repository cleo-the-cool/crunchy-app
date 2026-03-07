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
import * as Haptics from "../utils/haptics";

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

const PROFILE_STORAGE_KEY = "@crunchy_onboarding_profile";

export default function EditProfileScreen() {
  const goBack = useGoBack();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      const profile = JSON.parse(stored);
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setSelectedAvatar(profile.avatar ?? null);
    } else {
      setDisplayName(user?.name ?? "");
    }
  }

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert("Missing Name", "Please enter a display name.");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const profile = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar,
    };

    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setIsSaving(false);
    goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
            <TouchableOpacity onPress={goBack} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-dark">Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving} hitSlop={8}>
              <Text className={`text-base font-semibold ${isSaving ? "text-dark/30" : "text-sage"}`}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Selection */}
            <View className="items-center px-5 pt-4 pb-6">
              <View
                className="w-20 h-20 rounded-full bg-sage/15 items-center justify-center mb-4"
                style={{
                  shadowColor: "#8B9E7C",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-4xl">
                  {selectedAvatar
                    ? AVATAR_PRESETS.find((a) => a.id === selectedAvatar)?.emoji ?? "🌿"
                    : "🌿"}
                </Text>
              </View>
              <Text className="text-sm font-medium text-dark mb-3">
                Pick Your Avatar
              </Text>
              <View className="flex-row flex-wrap justify-center gap-3">
                {AVATAR_PRESETS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.id;
                  return (
                    <TouchableOpacity
                      key={avatar.id}
                      onPress={() => {
                        setSelectedAvatar(avatar.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      activeOpacity={0.7}
                      className={`w-14 h-14 rounded-2xl items-center justify-center ${
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
                      <Text className="text-2xl">{avatar.emoji}</Text>
                      {isSelected && (
                        <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sage items-center justify-center">
                          <Text className="text-white text-[8px] font-bold">
                            ✓
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Display Name */}
            <View className="px-5 mb-5">
              <Text className="text-sm font-medium text-dark mb-1.5">
                Display Name
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="What should we call you?"
                placeholderTextColor="#999"
                autoCapitalize="words"
                className="bg-white rounded-2xl px-4 py-3.5 text-base text-dark"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              />
            </View>

            {/* Bio */}
            <View className="px-5 mb-5">
              <Text className="text-sm font-medium text-dark mb-1.5">
                Bio
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us a bit about yourself..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-white rounded-2xl px-4 py-3.5 text-base text-dark"
                style={{
                  minHeight: 100,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              />
              <Text className="text-xs text-dark/40 mt-1 text-right">
                {bio.length}/150
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
