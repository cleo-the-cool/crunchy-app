import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../utils/haptics";
import { TRENDING_HASHTAGS } from "@/data/community";

const HASHTAG_SUGGESTIONS = [
  ...TRENDING_HASHTAGS,
  "#DIYCleaner",
  "#NaturalBeauty",
  "#MealPrep",
  "#Minimalism",
  "#Progress",
  "#Greenwashing",
];

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(
    new Set()
  );

  const handleToggleHashtag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHashtags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handlePickImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const placeholders = ["🧴", "🥗", "🌿", "🍯", "🧺", "🌱", "🧼"];
    const random = placeholders[Math.floor(Math.random() * placeholders.length)];
    setSelectedImage(selectedImage ? null : random);
  };

  const handlePost = () => {
    if (!content.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Posted!", "Your post has been shared with the community.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const canPost = content.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-dark/10">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark">New Post</Text>
          <TouchableOpacity onPress={handlePost} disabled={!canPost}>
            <Text
              className={`text-base font-semibold ${
                canPost ? "text-sage" : "text-dark/30"
              }`}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* User */}
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-sage/15 items-center justify-center mr-3">
              <Text className="text-xl">😊</Text>
            </View>
            <Text className="text-sm font-semibold text-dark">you</Text>
          </View>

          {/* Text Input */}
          <TextInput
            className="text-base text-dark min-h-[120px]"
            placeholder="What's on your mind? Share a tip, a swap, or something you're proud of..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          {/* Selected Image */}
          {selectedImage && (
            <View className="mt-4 rounded-2xl bg-sage/10 h-48 items-center justify-center relative">
              <Text className="text-6xl">{selectedImage}</Text>
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-dark/50 items-center justify-center"
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Selected Hashtags */}
          {selectedHashtags.size > 0 && (
            <View className="flex-row flex-wrap mt-4" style={{ gap: 6 }}>
              {Array.from(selectedHashtags).map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleToggleHashtag(tag)}
                  className="bg-sage/15 px-3 py-1.5 rounded-full flex-row items-center"
                >
                  <Text className="text-xs font-medium text-sage mr-1">
                    {tag}
                  </Text>
                  <Ionicons name="close-circle" size={14} color="#8B9E7C" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Hashtag Suggestions */}
          <View className="mt-6">
            <Text className="text-sm font-semibold text-dark/50 mb-3">
              Add hashtags
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {HASHTAG_SUGGESTIONS.map((tag) => {
                const isSelected = selectedHashtags.has(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => handleToggleHashtag(tag)}
                    className={`px-3 py-1.5 rounded-full ${
                      isSelected ? "bg-sage" : "bg-white"
                    }`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 3,
                      elevation: 1,
                    }}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        isSelected ? "text-white" : "text-sage"
                      }`}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Toolbar */}
        <View className="flex-row items-center px-5 py-3 border-t border-dark/10 bg-white">
          <TouchableOpacity
            onPress={handlePickImage}
            className="flex-row items-center mr-5"
            hitSlop={8}
          >
            <Ionicons
              name={selectedImage ? "image" : "image-outline"}
              size={24}
              color={selectedImage ? "#8B9E7C" : "#999"}
            />
            <Text className="text-sm text-dark/50 ml-2">Photo</Text>
          </TouchableOpacity>
          <View className="flex-1" />
          <Text className="text-xs text-dark/30">
            {content.length}/500
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
