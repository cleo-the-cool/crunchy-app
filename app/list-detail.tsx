import { useState } from "react";
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
import { useGoBack } from "@/lib/useGoBack";
import {
  getListById,
  LIST_CATEGORY_CONFIG,
  type ListProduct,
} from "@/data/lists";
import { getUserById } from "@/data/community";
import { Badge } from "@/components";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

export default function ListDetailScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saved, setSaved] = useState(false);

  const list = getListById(id ?? "");

  if (!list) {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-row items-center px-5 pt-2 pb-4">
          <TouchableOpacity onPress={goBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark ml-4">Not Found</Text>
        </View>
        <View className="items-center py-16">
          <Text className="text-5xl mb-4">📋</Text>
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
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4 flex-1" numberOfLines={1}>
          {list.title}
        </Text>
        <TouchableOpacity onPress={handleSaveList} hitSlop={8} className="ml-2">
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? "#8B9E7C" : "#2D2D2D"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShareList} hitSlop={8} className="ml-3">
          <Ionicons name="share-outline" size={22} color="#2D2D2D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* List Info Card */}
        <View className="mx-5 bg-white rounded-2xl p-5 mb-4" style={cardShadow}>
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
          <Text className="text-sm text-dark/60 mt-2 leading-5">
            {list.description}
          </Text>

          {/* Owner row */}
          {owner && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/user-profile?userId=${owner.id}`)
              }
              className="flex-row items-center mt-4 pt-3 border-t border-dark/5"
            >
              <View className="w-8 h-8 rounded-full bg-sage/20 items-center justify-center mr-2.5">
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
        </View>

        {/* Products */}
        <View className="px-5">
          <Text className="text-base font-bold text-dark mb-3">
            Products ({list.products.length})
          </Text>

          {list.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({ product }: { product: ListProduct }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-2xl bg-sage/10 items-center justify-center mr-3">
          <Text className="text-2xl">{product.image}</Text>
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
  );
}
