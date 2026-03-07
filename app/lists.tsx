import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGoBack } from "@/lib/useGoBack";
import {
  getPublicLists,
  searchLists,
  getListOwner,
  LIST_CATEGORY_CONFIG,
  type ProductList,
  type ListCategory,
} from "@/data/lists";
import { getUserById } from "@/data/community";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

const CATEGORY_FILTERS: { key: "all" | ListCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "skincare", label: "Skincare" },
  { key: "grocery", label: "Grocery" },
  { key: "cleaning", label: "Cleaning" },
  { key: "baby", label: "Baby" },
  { key: "wellness", label: "Wellness" },
  { key: "general", label: "General" },
];

export default function ListsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | ListCategory>(
    "all"
  );

  const allLists = getPublicLists();

  let filteredLists: ProductList[];
  if (searchQuery.trim()) {
    filteredLists = searchLists(searchQuery);
  } else {
    filteredLists = allLists;
  }

  if (activeCategory !== "all") {
    filteredLists = filteredLists.filter(
      (l) => l.category === activeCategory
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4">
          Product Lists
        </Text>
        <View className="flex-1" />
        <TouchableOpacity
          onPress={() => router.push("/create-list")}
          className="bg-sage w-9 h-9 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 mb-3">
        <View
          className="flex-row items-center bg-white rounded-2xl px-4 py-3"
          style={cardShadow}
        >
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            className="flex-1 ml-2 text-dark text-sm"
            placeholder="Search lists or products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="mb-3"
        style={{ maxHeight: 40 }}
      >
        {CATEGORY_FILTERS.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-full ${
              activeCategory === cat.key ? "bg-sage" : "bg-white"
            }`}
            style={activeCategory !== cat.key ? cardShadow : undefined}
          >
            <Text
              className={`text-sm font-medium ${
                activeCategory === cat.key ? "text-white" : "text-dark/60"
              }`}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lists */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredLists.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">📋</Text>
            <Text className="text-lg font-bold text-dark text-center">
              No lists found
            </Text>
            <Text className="text-sm text-dark/50 text-center mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to create a list!"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/create-list")}
              className="mt-4 bg-sage px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-semibold">Create a List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredLists.map((list) => (
            <ListCard key={list.id} list={list} router={router} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ListCard({
  list,
  router,
}: {
  list: ProductList;
  router: ReturnType<typeof useRouter>;
}) {
  const owner = getUserById(list.userId);
  const catConfig = LIST_CATEGORY_CONFIG[list.category];

  return (
    <TouchableOpacity
      onPress={() => router.push(`/list-detail?id=${list.id}`)}
      activeOpacity={0.7}
      className="mb-3"
    >
      <View className="bg-white rounded-2xl p-4" style={cardShadow}>
        {/* Top row: category badge + product count */}
        <View className="flex-row items-center justify-between mb-2">
          <View
            className="flex-row items-center px-2.5 py-1 rounded-full"
            style={{ backgroundColor: catConfig.color + "20" }}
          >
            <Text className="text-xs mr-1">{catConfig.emoji}</Text>
            <Text
              className="text-xs font-medium"
              style={{ color: catConfig.color }}
            >
              {catConfig.label}
            </Text>
          </View>
          <Text className="text-xs text-dark/40">
            {list.products.length} product{list.products.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Title + description */}
        <Text className="text-base font-bold text-dark" numberOfLines={1}>
          {list.title}
        </Text>
        <Text className="text-sm text-dark/60 mt-1" numberOfLines={2}>
          {list.description}
        </Text>

        {/* Product preview row */}
        {list.products.length > 0 && (
          <View className="flex-row mt-3" style={{ gap: 6 }}>
            {list.products.slice(0, 5).map((p) => (
              <View
                key={p.id}
                className="w-9 h-9 rounded-xl bg-sage/10 items-center justify-center"
              >
                <Text className="text-base">{p.image}</Text>
              </View>
            ))}
            {list.products.length > 5 && (
              <View className="w-9 h-9 rounded-xl bg-dark/5 items-center justify-center">
                <Text className="text-xs text-dark/50 font-medium">
                  +{list.products.length - 5}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Owner */}
        {owner && (
          <View className="flex-row items-center mt-3 pt-2.5 border-t border-dark/5">
            <View className="w-6 h-6 rounded-full bg-sage/20 items-center justify-center mr-2">
              <Text className="text-xs">{owner.avatar}</Text>
            </View>
            <Text className="text-xs text-dark/50">{owner.username}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
