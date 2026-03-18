import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoBack } from "@/lib/useGoBack";
import {
  getPublicLists,
  searchLists,
  LIST_CATEGORY_CONFIG,
  type ProductList,
  type ListCategory,
} from "@/data/lists";

const LISTS_STORAGE_KEY = "@crunchy_user_lists";

const cardShadow = {
  borderWidth: 1,
        borderColor: "rgba(0,0,0,0.15)",
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 3,
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

type TabKey = "my-lists" | "browse";

export default function ListsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | ListCategory>(
    "all"
  );
  const [activeTab, setActiveTab] = useState<TabKey>("my-lists");
  const [myLists, setMyLists] = useState<ProductList[]>([]);

  const loadMyLists = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (stored) {
        setMyLists(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadMyLists();
  }, [loadMyLists]);

  // Reload lists when screen comes back into focus (e.g. after creating a list)
  useFocusEffect(
    useCallback(() => {
      loadMyLists();
    }, [loadMyLists])
  );

  // Browse lists come from the public data source
  const browseLists = getPublicLists();

  const baseLists = activeTab === "my-lists" ? myLists : browseLists;

  let filteredLists: ProductList[];
  if (searchQuery.trim()) {
    if (activeTab === "browse") {
      filteredLists = searchLists(searchQuery);
    } else {
      const q = searchQuery.toLowerCase();
      filteredLists = baseLists.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.products.some(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q)
          )
      );
    }
  } else {
    filteredLists = baseLists;
  }

  if (activeCategory !== "all") {
    filteredLists = filteredLists.filter(
      (l) => l.category === activeCategory
    );
  }

  const emptyMessage =
    activeTab === "my-lists"
      ? searchQuery
        ? "No matching lists found"
        : "You haven't created any lists yet"
      : searchQuery
        ? "No matching lists found"
        : "No public lists to browse yet";

  const emptySub =
    activeTab === "my-lists" && !searchQuery
      ? "Create your first list to organize your favorite products!"
      : searchQuery
        ? "Try a different search term"
        : "Check back later for community lists";

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4">
          Product Lists
        </Text>
        <View className="flex-1" />
        <TouchableOpacity
          onPress={() => router.push("/create-list")}
          className="bg-forest w-9 h-9 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Segments */}
      <View className="px-5 mb-3">
        <View className="flex-row bg-white rounded-3xl p-1" style={cardShadow}>
          <TouchableOpacity
            onPress={() => setActiveTab("my-lists")}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === "my-lists" ? "bg-forest" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "my-lists" ? "text-white" : "text-dark/50"
              }`}
            >
              My Lists
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("browse")}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === "browse" ? "bg-forest" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "browse" ? "text-white" : "text-dark/50"
              }`}
            >
              Browse Lists
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View className="px-5 mb-3">
        <View
          className="flex-row items-center bg-white rounded-3xl px-4 py-3"
          style={cardShadow}
        >
          <Ionicons name="search" size={18} color="#A8B89C" />
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
              activeCategory === cat.key ? "bg-forest" : "bg-cream"
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
        keyboardShouldPersistTaps="handled"
      >
        {filteredLists.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="list-outline" size={48} color="#A8B89C" style={{ marginBottom: 16 }} />
            <Text className="text-lg font-bold text-dark text-center">
              {emptyMessage}
            </Text>
            <Text className="text-sm text-dark/50 text-center mt-2">
              {emptySub}
            </Text>
            {activeTab === "my-lists" && !searchQuery && (
              <TouchableOpacity
                onPress={() => router.push("/create-list")}
                className="mt-4 bg-forest px-6 py-3 rounded-3xl"
              >
                <Text className="text-white font-semibold">Create a List</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))
        )}
      </ScrollView>
      </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

function ListCard({ list }: { list: ProductList }) {
  const router = useRouter();
  const catConfig = LIST_CATEGORY_CONFIG[list.category];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/list-detail?id=${list.id}`)}
      activeOpacity={0.7}
      className="mb-3"
    >
      <View className="bg-white rounded-3xl p-4" style={cardShadow}>
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
        {list.description ? (
          <Text className="text-sm text-dark/60 mt-1" numberOfLines={2}>
            {list.description}
          </Text>
        ) : null}

        {/* Product preview row */}
        {list.products.length > 0 && (
          <View className="flex-row mt-3" style={{ gap: 6 }}>
            {list.products.slice(0, 5).map((p) => (
              <View
                key={p.id}
                className="w-9 h-9 rounded-xl bg-forest/8 items-center justify-center"
              >
                {p.image ? <Text className="text-base">{p.image}</Text> : <Ionicons name="cube-outline" size={16} color="#A8B89C" />}
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

        {/* Visibility badge for own lists */}
        <View className="flex-row items-center mt-3 pt-2.5 border-t border-dark/5">
          <Ionicons
            name={list.isPublic ? "globe-outline" : "lock-closed-outline"}
            size={14}
            color="#A8B89C"
          />
          <Text className="text-xs text-dark/40 ml-1.5">
            {list.isPublic ? "Public" : "Private"}
          </Text>
          <Text className="text-xs text-dark/30 ml-auto">
            Updated {formatDate(list.updatedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
