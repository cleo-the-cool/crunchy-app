import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGoBack } from "@/lib/useGoBack";
import {
  LIST_CATEGORY_CONFIG,
  type ListCategory,
} from "@/data/lists";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

const CATEGORIES = Object.entries(LIST_CATEGORY_CONFIG) as [
  ListCategory,
  (typeof LIST_CATEGORY_CONFIG)[ListCategory]
][];

export default function CreateListScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListCategory>("general");
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleCreate = () => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Please enter a list name";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // In a real app this would save to Supabase
    Alert.alert("List Created!", `"${title}" has been created.`, [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4">
          Create List
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* List Name */}
        <View className="px-5 mb-5">
          <Text className="text-sm font-semibold text-dark mb-2">
            List Name
          </Text>
          <View
            className="bg-white rounded-2xl px-4 py-3"
            style={cardShadow}
          >
            <TextInput
              className="text-dark text-base"
              placeholder="e.g., My Clean Skincare Routine"
              placeholderTextColor="#999"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (errors.title) setErrors({});
              }}
            />
          </View>
          {errors.title && (
            <Text className="text-xs text-red-500 mt-1 ml-1">
              {errors.title}
            </Text>
          )}
        </View>

        {/* Description */}
        <View className="px-5 mb-5">
          <Text className="text-sm font-semibold text-dark mb-2">
            Description (optional)
          </Text>
          <View
            className="bg-white rounded-2xl px-4 py-3"
            style={cardShadow}
          >
            <TextInput
              className="text-dark text-sm"
              placeholder="Describe what this list is about..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 72, textAlignVertical: "top" }}
            />
          </View>
        </View>

        {/* Category */}
        <View className="px-5 mb-5">
          <Text className="text-sm font-semibold text-dark mb-2">
            Category
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {CATEGORIES.map(([key, config]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setCategory(key)}
                className={`flex-row items-center px-3 py-2.5 rounded-2xl ${
                  category === key ? "" : "bg-white"
                }`}
                style={[
                  category === key
                    ? { backgroundColor: config.color + "30" }
                    : cardShadow,
                ]}
              >
                <Text className="text-sm mr-1.5">{config.emoji}</Text>
                <Text
                  className={`text-sm font-medium ${
                    category === key ? "" : "text-dark/60"
                  }`}
                  style={category === key ? { color: config.color } : undefined}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibility */}
        <View className="px-5 mb-6">
          <View
            className="bg-white rounded-2xl px-4 py-4 flex-row items-center justify-between"
            style={cardShadow}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons
                name={isPublic ? "globe-outline" : "lock-closed-outline"}
                size={20}
                color="#8B9E7C"
              />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-dark">
                  {isPublic ? "Public" : "Private"}
                </Text>
                <Text className="text-xs text-dark/50 mt-0.5">
                  {isPublic
                    ? "Anyone can discover and view this list"
                    : "Only you can see this list"}
                </Text>
              </View>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: "#DDD", true: "#8B9E7C" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Info about adding products */}
        <View className="px-5 mb-6">
          <View
            className="bg-sage/10 rounded-2xl p-4 flex-row"
          >
            <Ionicons name="information-circle-outline" size={20} color="#8B9E7C" />
            <Text className="text-sm text-dark/60 ml-2.5 flex-1 leading-5">
              After creating your list, you can add products by scanning them or
              browsing your scan history.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View className="px-5 pb-5 pt-3 bg-cream">
        <TouchableOpacity
          onPress={handleCreate}
          className="bg-sage py-4 rounded-2xl items-center"
          style={{
            shadowColor: "#8B9E7C",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-white font-bold text-base">Create List</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
