import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoBack } from "@/lib/useGoBack";
import {
  LIST_CATEGORY_CONFIG,
  type ListCategory,
  type ProductList,
  type ListProduct,
} from "@/data/lists";
import { PRODUCTS, type Product } from "@/data/products";

const LISTS_STORAGE_KEY = "@crunchy_user_lists";

const cardShadow = {
  borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
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
  const [saving, setSaving] = useState(false);

  // Product search + selection
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ListProduct[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);

  const searchResults = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [productSearch]);

  const addProduct = (product: Product) => {
    if (selectedProducts.some((p) => p.id === product.id)) return;
    const listProduct: ListProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      rating: product.rating,
      image: product.image,
      addedAt: new Date().toISOString(),
    };
    setSelectedProducts((prev) => [...prev, listProduct]);
    setProductSearch("");
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleCreate = async () => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Please enter a list name";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const newList: ProductList = {
        id: `list_${Date.now()}`,
        userId: "local",
        title: title.trim(),
        description: description.trim(),
        category,
        isPublic,
        products: selectedProducts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Load existing lists and append
      const stored = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      const existingLists: ProductList[] = stored ? JSON.parse(stored) : [];
      existingLists.unshift(newList);
      await AsyncStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(existingLists));

      // Navigate back to lists
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save list. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4" style={{ fontFamily: 'Georgia' }}>
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
            className="bg-white rounded-3xl px-4 py-3"
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
            className="bg-white rounded-3xl px-4 py-3"
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
                className={`flex-row items-center px-3 py-2.5 rounded-3xl ${
                  category === key ? "" : "bg-cream"
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
        <View className="px-5 mb-5">
          <View
            className="bg-white rounded-3xl px-4 py-4 flex-row items-center justify-between"
            style={cardShadow}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons
                name={isPublic ? "globe-outline" : "lock-closed-outline"}
                size={20}
                color="#3D5A3E"
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
              trackColor={{ false: "#DDD", true: "#3D5A3E" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Add Products */}
        <View className="px-5 mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-dark">
              Products ({selectedProducts.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowProductSearch(!showProductSearch)}
              className="flex-row items-center"
            >
              <Ionicons name="add-circle-outline" size={18} color="#3D5A3E" />
              <Text className="text-sm text-forest font-medium ml-1">
                Add Products
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product Search */}
          {showProductSearch && (
            <View className="mb-3">
              <View
                className="bg-white rounded-3xl px-4 py-3 flex-row items-center"
                style={cardShadow}
              >
                <Ionicons name="search" size={16} color="#A8B89C" />
                <TextInput
                  className="flex-1 ml-2 text-dark text-sm"
                  placeholder="Search products by name or brand..."
                  placeholderTextColor="#999"
                  value={productSearch}
                  onChangeText={setProductSearch}
                  autoFocus
                />
                {productSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setProductSearch("")}>
                    <Ionicons name="close-circle" size={16} color="#CCC" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <View className="mt-2 bg-white rounded-3xl overflow-hidden" style={cardShadow}>
                  {searchResults.map((product, idx) => {
                    const alreadyAdded = selectedProducts.some((p) => p.id === product.id);
                    return (
                      <TouchableOpacity
                        key={product.id}
                        onPress={() => !alreadyAdded && addProduct(product)}
                        className={`flex-row items-center px-4 py-3 ${
                          idx < searchResults.length - 1 ? "border-b border-dark/5" : ""
                        }`}
                        disabled={alreadyAdded}
                      >
                        <Text className="text-lg mr-3">{product.image}</Text>
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-dark" numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text className="text-xs text-dark/50">{product.brand}</Text>
                        </View>
                        {alreadyAdded ? (
                          <Ionicons name="checkmark-circle" size={20} color="#3D5A3E" />
                        ) : (
                          <Ionicons name="add-circle-outline" size={20} color="#3D5A3E" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {productSearch.trim().length > 0 && searchResults.length === 0 && (
                <View className="mt-2 items-center py-4">
                  <Text className="text-sm text-dark/50">No products found</Text>
                </View>
              )}
            </View>
          )}

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <View className="bg-white rounded-3xl overflow-hidden" style={cardShadow}>
              {selectedProducts.map((product, idx) => (
                <View
                  key={product.id}
                  className={`flex-row items-center px-4 py-3 ${
                    idx < selectedProducts.length - 1 ? "border-b border-dark/5" : ""
                  }`}
                >
                  <Text className="text-lg mr-3">{product.image}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-dark" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-xs text-dark/50">{product.brand}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeProduct(product.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={20} color="#E57373" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {selectedProducts.length === 0 && !showProductSearch && (
            <View className="bg-forest/8 rounded-3xl p-4 flex-row">
              <Ionicons name="information-circle-outline" size={20} color="#3D5A3E" />
              <Text className="text-sm text-dark/60 ml-2.5 flex-1 leading-5">
                Tap "Add Products" above to search and add products to your list.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Button */}
      <View className="px-5 pb-5 pt-3 bg-ivory">
        <TouchableOpacity
          onPress={handleCreate}
          disabled={saving}
          className={`py-4 rounded-3xl items-center ${saving ? "bg-forest/50" : "bg-forest"}`}
          style={{
            shadowColor: "#3D5A3E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-white font-bold text-base">
            {saving ? "Saving..." : "Save List"}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
