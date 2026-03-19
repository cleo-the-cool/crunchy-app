import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../../utils/haptics";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";
import { analyzeProductByName } from "@/services/gemini";


interface BrowseCategory {
  key: string;
  label: string;
}

const BROWSE_CATEGORIES: BrowseCategory[] = [
  { key: "skincare", label: "Skincare" },
  { key: "food", label: "Food & Pantry" },
  { key: "drinks", label: "Drinks" },
  { key: "cleaning", label: "Cleaning" },
  { key: "makeup", label: "Makeup & Beauty" },
  { key: "wellness", label: "Wellness & Supplements" },
  { key: "baby", label: "Baby & Kids" },
  { key: "other", label: "Other" },
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSearching(true);

    try {
      const analysis = await analyzeProductByName(query);
      router.push({
        pathname: "/scan-result",
        params: {
          barcodeData: JSON.stringify(analysis),
          source: "search",
        },
      });
    } catch (error: any) {
      if (error.message === "SCANNER_RATE_LIMITED") {
        Alert.alert("Rate Limited", "Too many searches today. Please try again tomorrow.");
      } else {
        Alert.alert("Search Failed", "Could not analyze this product. Please try again.");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleCategoryPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/category", params: { key } });
  };

  return (
    <View className="flex-1 bg-ivory">
      {/* Hero Header */}
      <ImageBackground
        source={require("@/assets/images/aesthetic/forest-canopy.jpg")}
        resizeMode="cover"
      >
        <View style={{ backgroundColor: "rgba(61,90,62,0.55)" }}>
          <SafeAreaView edges={["top"]}>
            <View className="px-6 pt-6 pb-8" style={{ minHeight: 180, justifyContent: "flex-end" }}>
              <Text className="text-3xl font-bold text-white">Search</Text>
              <Text className="text-sm text-white/70 mt-0.5">
                Search any product to analyze it
              </Text>

              {/* Search Bar */}
              <View className="mt-4">
                <View
                  className="bg-white rounded-3xl flex-row items-center px-4 py-3"
                  style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.15)" }}
                >
                  <Ionicons name="search" size={20} color="#A8B89C" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-dark"
                    placeholder="Search any product..."
                    placeholderTextColor="#999"
                    value={searchInput}
                    onChangeText={setSearchInput}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                    editable={!searching}
                  />
                  {searching ? (
                    <ActivityIndicator size="small" color="#3D5A3E" />
                  ) : searchInput.length > 0 ? (
                    <TouchableOpacity onPress={() => setSearchInput("")}>
                      <Ionicons name="close-circle" size={20} color="#A8B89C" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5A3E" />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Searching indicator */}
        {searching && (
          <View className="items-center px-5 mt-10">
            <ActivityIndicator size="large" color="#3D5A3E" />
            <Text className="text-base font-semibold text-dark mt-4">Analyzing product...</Text>
            <Text className="text-sm text-dark/40 text-center mt-1">
              This may take a few seconds
            </Text>
          </View>
        )}

        {/* Category Grid */}
        {!searching && (
          <View className="px-5 mt-5">
            <Text className="text-lg font-bold text-dark mb-3">
              Browse by Category
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {BROWSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat.key)}
                  activeOpacity={0.8}
                  style={{ width: "48%", flexGrow: 1 }}
                >
                  <ImageBackground
                    source={CATEGORY_IMAGES[cat.key]}
                    resizeMode="cover"
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <View
                      className="rounded-2xl px-4 py-5 justify-end"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.35)",
                        height: 100,
                        borderRadius: 16,
                      }}
                    >
                      <Text className="text-white font-bold text-base">{cat.label}</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


      </ScrollView>
    </View>
  );
}
