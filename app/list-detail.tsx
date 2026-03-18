import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoBack } from "@/lib/useGoBack";
import {
  getListById,
  LIST_CATEGORY_CONFIG,
  type ProductList,
  type ListProduct,
} from "@/data/lists";
import { getUserById } from "@/data/community";
import { Badge } from "@/components";
import * as Haptics from "../utils/haptics";

const LISTS_STORAGE_KEY = "@crunchy_user_lists";

const cardShadow = {
  borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

export default function ListDetailScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saved, setSaved] = useState(false);
  const [list, setList] = useState<ProductList | null>(null);
  const [isOwnList, setIsOwnList] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    // First check MOCK_LISTS (public/browse lists)
    const mockList = getListById(id);
    if (mockList) {
      setList(mockList);
      setIsOwnList(false);
      setLoading(false);
      return;
    }

    // Then check AsyncStorage (user-created lists)
    try {
      const stored = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (stored) {
        const userLists: ProductList[] = JSON.parse(stored);
        const found = userLists.find((l) => l.id === id);
        if (found) {
          setList(found);
          setIsOwnList(true);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleRemoveProduct = useCallback(
    async (productId: string, productName: string) => {
      if (!list || !isOwnList) return;

      Alert.alert(
        "Remove Product",
        `Remove "${productName}" from this list?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const updatedProducts = list.products.filter(
                  (p) => p.id !== productId
                );
                const updatedList: ProductList = {
                  ...list,
                  products: updatedProducts,
                  updatedAt: new Date().toISOString(),
                };

                // Update AsyncStorage
                const stored = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
                if (stored) {
                  const userLists: ProductList[] = JSON.parse(stored);
                  const idx = userLists.findIndex((l) => l.id === list.id);
                  if (idx !== -1) {
                    userLists[idx] = updatedList;
                    await AsyncStorage.setItem(
                      LISTS_STORAGE_KEY,
                      JSON.stringify(userLists)
                    );
                  }
                }

                setList(updatedList);
              } catch {
                Alert.alert("Error", "Failed to remove product.");
              }
            },
          },
        ]
      );
    },
    [list, isOwnList]
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <View className="flex-row items-center px-5 pt-2 pb-4">
          <TouchableOpacity onPress={goBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark ml-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!list) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <View className="flex-row items-center px-5 pt-2 pb-4">
          <TouchableOpacity onPress={goBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark ml-4">Not Found</Text>
        </View>
        <View className="items-center py-16">
          <Ionicons name="list-outline" size={48} color="#A8B89C" style={{ marginBottom: 16 }} />
          <Text className="text-lg font-bold text-dark">List not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const owner = getUserById(list.userId);
  const catConfig = LIST_CATEGORY_CONFIG[list.category];

  const handleSaveList = () => {
    setSaved(!saved);
  };

  const handleShareList = () => {
    Alert.alert("Share List", `Share "${list.title}" with friends?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Share", onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4 flex-1" numberOfLines={1}>
          {list.title}
        </Text>
        <TouchableOpacity onPress={handleSaveList} hitSlop={8} className="ml-2">
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? "#3D5A3E" : "#3D5A3E"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShareList} hitSlop={8} className="ml-3">
          <Ionicons name="share-outline" size={22} color="#3D5A3E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* List Info Card */}
        <View className="mx-5 bg-white rounded-3xl p-5 mb-4" style={cardShadow}>
          {/* Category badge */}
          <View
            className="self-start flex-row items-center px-3 py-1.5 rounded-full mb-3"
            style={{ backgroundColor: catConfig.color + "20" }}
          >
            <Text className="text-sm mr-1.5">{catConfig.emoji}</Text>
            <Text
              className="text-sm font-medium"
              style={{ color: catConfig.color }}
            >
              {catConfig.label}
            </Text>
          </View>

          <Text className="text-lg font-bold text-dark">{list.title}</Text>
          {list.description ? (
            <Text className="text-sm text-dark/60 mt-2 leading-5">
              {list.description}
            </Text>
          ) : null}

          {/* Owner row (for public/browse lists) */}
          {owner && !isOwnList && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/user-profile?userId=${owner.id}`)
              }
              className="flex-row items-center mt-4 pt-3"
              style={{ borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" }}
            >
              <View className="w-8 h-8 rounded-full bg-forest/10 items-center justify-center mr-2.5">
                <Text className="text-sm">{owner.avatar}</Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-dark">
                  {owner.username}
                </Text>
                <Text className="text-xs text-dark/40">
                  {list.products.length} product
                  {list.products.length !== 1 ? "s" : ""} curated
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#CCC"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          )}

          {/* Own list info */}
          {isOwnList && (
            <View
              className="flex-row items-center mt-4 pt-3"
              style={{ borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" }}
            >
              <Ionicons
                name={list.isPublic ? "globe-outline" : "lock-closed-outline"}
                size={14}
                color="#A8B89C"
              />
              <Text className="text-xs text-dark/40 ml-1.5">
                {list.isPublic ? "Public" : "Private"}
              </Text>
              <Text className="text-xs text-dark/30 ml-auto">
                Updated {new Date(list.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Products */}
        <View className="px-5">
          <Text className="text-base font-bold text-dark mb-3">
            Products ({list.products.length})
          </Text>

          {list.products.length === 0 && (
            <View className="items-center py-8">
              <Ionicons name="cube-outline" size={40} color="#A8B89C" style={{ marginBottom: 12 }} />
              <Text className="text-sm text-dark/50 text-center">
                No products in this list yet
              </Text>
            </View>
          )}

          {list.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canRemove={isOwnList}
              onRemove={() => handleRemoveProduct(product.id, product.name)}
            />
          ))}

          {isOwnList && (
            <Text className="text-xs text-dark/30 text-center mt-2">
              Long press a product to remove it
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({
  product,
  canRemove,
  onRemove,
}: {
  product: ListProduct;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/product-detail?id=${product.id}`)}
      onLongPress={canRemove ? onRemove : undefined}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <View className="bg-white rounded-3xl p-4 mb-3" style={cardShadow}>
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-3xl bg-forest/8 items-center justify-center mr-3">
            {product.image ? <Text className="text-2xl">{product.image}</Text> : <Ionicons name="cube-outline" size={24} color="#A8B89C" />}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-dark">
              {product.name}
            </Text>
            <Text className="text-xs text-dark/50 mt-0.5">{product.brand}</Text>
          </View>
          <Badge rating={product.rating} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
