import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoBack } from "@/lib/useGoBack";
import { useAuth } from "@/contexts/AuthContext";
import {
  LIST_CATEGORY_CONFIG,
  type ProductList,
  type ListCategory,
} from "@/data/lists";
import { getSavedProducts, unsaveProduct, type SavedProduct } from "@/lib/savedProducts";

const LISTS_STORAGE_KEY = "@crunchy_user_lists";

const cardShadow = {
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.15)",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 3,
};

type TabKey = "my-lists" | "saved";

export default function ListsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("my-lists");
  const [myLists, setMyLists] = useState<ProductList[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);

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

  const loadSavedProducts = useCallback(async () => {
    try {
      const products = await getSavedProducts(user?.id);
      setSavedProducts(products);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    loadMyLists();
    loadSavedProducts();
  }, [loadMyLists, loadSavedProducts]);

  useFocusEffect(
    useCallback(() => {
      loadMyLists();
      loadSavedProducts();
    }, [loadMyLists, loadSavedProducts])
  );

  const handleDeleteSaved = useCallback(
    (product: SavedProduct) => {
      Alert.alert(
        "Remove Product",
        `Remove "${product.name}" from saved products?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              await unsaveProduct(product.id, user?.id);
              setSavedProducts((prev) =>
                prev.filter((p) => p.id !== product.id)
              );
            },
          },
        ]
      );
    },
    [user]
  );

  // Group saved products by category
  const savedByCategory = savedProducts.reduce<Record<string, SavedProduct[]>>(
    (acc, p) => {
      const cat = p.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    },
    {}
  );

  // Filter lists by search
  const filteredLists = searchQuery.trim()
    ? myLists.filter((l) => {
        const q = searchQuery.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.products.some(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q)
          )
        );
      })
    : myLists;

  // Filter saved products by search
  const filteredSaved = searchQuery.trim()
    ? savedProducts.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false) ||
          (p.category?.toLowerCase().includes(q) ?? false)
        );
      })
    : savedProducts;

  const filteredSavedByCategory = filteredSaved.reduce<
    Record<string, SavedProduct[]>
  >((acc, p) => {
    const cat = p.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-ivory">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1">
          {/* Header Image — matches homepage hero style */}
          <ImageBackground
            source={require("@/assets/images/aesthetic/lists-header.jpg")}
            resizeMode="cover"
            style={{ width: "100%" }}
          >
            <View style={{ backgroundColor: "rgba(61,90,62,0.55)" }}>
              <SafeAreaView edges={["top"]}>
                <View className="px-6 pt-6 pb-8" style={{ minHeight: 140, justifyContent: "space-between" }}>
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={goBack} hitSlop={8}>
                      <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View className="flex-1" />
                    <TouchableOpacity
                      onPress={() => router.push("/create-list")}
                      className="w-9 h-9 rounded-full items-center justify-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    >
                      <Ionicons name="add" size={22} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <Text className="text-4xl font-bold text-white">
                      Product Lists
                    </Text>
                    <Text className="text-white/60 text-sm mt-1">
                      Organize your favorite clean products
                    </Text>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </ImageBackground>

          {/* Tab Segments */}
          <View className="px-5 mb-3">
            <View
              className="flex-row bg-white rounded-3xl p-1"
              style={cardShadow}
            >
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
                onPress={() => setActiveTab("saved")}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  activeTab === "saved" ? "bg-forest" : ""
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === "saved" ? "text-white" : "text-dark/50"
                  }`}
                >
                  Saved Products
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
                placeholder={
                  activeTab === "my-lists"
                    ? "Search lists..."
                    : "Search saved products..."
                }
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

          {/* Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === "my-lists" ? (
              /* ── My Lists Tab ── */
              filteredLists.length === 0 ? (
                <View className="items-center py-16">
                  <Ionicons
                    name="list-outline"
                    size={48}
                    color="#A8B89C"
                    style={{ marginBottom: 16 }}
                  />
                  <Text className="text-lg font-bold text-dark text-center">
                    {searchQuery
                      ? "No matching lists found"
                      : "You haven't created any lists yet"}
                  </Text>
                  <Text className="text-sm text-dark/50 text-center mt-2">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create your first list to organize your favorite products!"}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity
                      onPress={() => router.push("/create-list")}
                      className="mt-4 bg-forest px-6 py-3 rounded-3xl"
                    >
                      <Text className="text-white font-semibold">
                        Create a List
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                filteredLists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))
              )
            ) : (
              /* ── Saved Products Tab ── */
              filteredSaved.length === 0 ? (
                <View className="items-center py-16">
                  <Ionicons
                    name="bookmark-outline"
                    size={48}
                    color="#A8B89C"
                    style={{ marginBottom: 16 }}
                  />
                  <Text className="text-lg font-bold text-dark text-center">
                    {searchQuery
                      ? "No matching products found"
                      : "No saved products yet"}
                  </Text>
                  <Text className="text-sm text-dark/50 text-center mt-2">
                    {searchQuery
                      ? "Try a different search term"
                      : "Scan products and save your favorites to see them here!"}
                  </Text>
                </View>
              ) : (
                Object.entries(filteredSavedByCategory)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, products]) => (
                    <View key={category} className="mb-4">
                      <Text className="text-xs font-semibold text-dark/40 uppercase tracking-wide mb-2 ml-1">
                        {category}
                      </Text>
                      <View
                        className="bg-white rounded-3xl px-4 py-1"
                        style={cardShadow}
                      >
                        {products.map((product, i) => (
                          <TouchableOpacity
                            key={product.id}
                            onPress={() =>
                              router.push(
                                `/product-detail?id=${product.id}`
                              )
                            }
                            className={`flex-row items-center py-3 ${
                              i < products.length - 1
                                ? "border-b border-dark/5"
                                : ""
                            }`}
                          >
                            <View
                              className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                              style={{
                                backgroundColor:
                                  product.rating === "clean"
                                    ? "#E8F5E9"
                                    : product.rating === "caution"
                                      ? "#FFF8E1"
                                      : "#FFEBEE",
                              }}
                            >
                              <Text className="text-base">
                                {product.rating === "clean"
                                  ? "✅"
                                  : product.rating === "caution"
                                    ? "⚠️"
                                    : "🚫"}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text
                                className="text-sm font-medium text-dark"
                                numberOfLines={1}
                              >
                                {product.name}
                              </Text>
                              {product.brand ? (
                                <Text className="text-xs text-dark/40">
                                  {product.brand}
                                </Text>
                              ) : null}
                            </View>
                            <TouchableOpacity
                              onPress={() => handleDeleteSaved(product)}
                              hitSlop={8}
                              className="ml-2 p-1"
                            >
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#E57373"
                              />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))
              )
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </View>
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
            {list.products.length} product
            {list.products.length !== 1 ? "s" : ""}
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
                {p.image ? (
                  <Text className="text-base">{p.image}</Text>
                ) : (
                  <Ionicons name="cube-outline" size={16} color="#A8B89C" />
                )}
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

        {/* Footer */}
        <View className="flex-row items-center mt-3 pt-2.5 border-t border-dark/5">
          <Ionicons name="time-outline" size={14} color="#A8B89C" />
          <Text className="text-xs text-dark/40 ml-1.5">
            Updated {formatDate(list.updatedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
