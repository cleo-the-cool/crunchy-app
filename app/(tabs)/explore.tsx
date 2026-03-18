import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../../utils/haptics";
import { CATEGORY_IMAGES } from "@/lib/categoryImages";

interface ProductSuggestion {
  name: string;
  brand: string;
  emoji: string;
  tip: string;
}

interface BrowseCategory {
  key: string;
  label: string;
  emoji: string;
  products: ProductSuggestion[];
}

const BROWSE_CATEGORIES: BrowseCategory[] = [
  {
    key: "skincare",
    label: "Skincare",
    emoji: "",
    products: [
      { name: "CeraVe Moisturizing Cream", brand: "CeraVe", emoji: "", tip: "Fragrance-free, dermatologist recommended" },
      { name: "Thayers Witch Hazel Toner", brand: "Thayers", emoji: "", tip: "Alcohol-free, natural ingredients" },
      { name: "Cocokind Daily SPF", brand: "Cocokind", emoji: "", tip: "Mineral sunscreen, clean ingredients" },
      { name: "Versed Dew Point Gel Cream", brand: "Versed", emoji: "", tip: "Lightweight, non-toxic formula" },
      { name: "Weleda Skin Food", brand: "Weleda", emoji: "", tip: "Plant-based, ultra-nourishing" },
    ],
  },
  {
    key: "food",
    label: "Food & Pantry",
    emoji: "",
    products: [
      { name: "Primal Kitchen Mayo", brand: "Primal Kitchen", emoji: "", tip: "Avocado oil based, no seed oils" },
      { name: "Hu Chocolate Bars", brand: "Hu", emoji: "", tip: "No refined sugar, clean ingredients" },
      { name: "Siete Tortilla Chips", brand: "Siete", emoji: "", tip: "Grain-free, avocado oil" },
      { name: "Chosen Foods Avocado Oil", brand: "Chosen Foods", emoji: "", tip: "Pure avocado oil for cooking" },
      { name: "Purely Elizabeth Granola", brand: "Purely Elizabeth", emoji: "", tip: "Ancient grains, low sugar" },
    ],
  },
  {
    key: "drinks",
    label: "Drinks",
    emoji: "",
    products: [
      { name: "Olipop Prebiotic Soda", brand: "Olipop", emoji: "", tip: "Gut-friendly, low sugar" },
      { name: "Rishi Matcha", brand: "Rishi", emoji: "", tip: "Organic, ceremonial grade" },
      { name: "Harmless Harvest Coconut Water", brand: "Harmless Harvest", emoji: "", tip: "Raw, organic, never heated" },
      { name: "Poppi Prebiotic Soda", brand: "Poppi", emoji: "", tip: "Apple cider vinegar based" },
      { name: "Four Sigmatic Mushroom Coffee", brand: "Four Sigmatic", emoji: "", tip: "Adaptogens + organic coffee" },
    ],
  },
  {
    key: "cleaning",
    label: "Cleaning",
    emoji: "",
    products: [
      { name: "Branch Basics Concentrate", brand: "Branch Basics", emoji: "", tip: "One cleaner for everything, non-toxic" },
      { name: "Blueland Cleaning Tablets", brand: "Blueland", emoji: "", tip: "Eco-friendly, zero plastic waste" },
      { name: "Dr. Bronner's Castile Soap", brand: "Dr. Bronner's", emoji: "", tip: "Multi-use, organic, fair trade" },
      { name: "Force of Nature Cleaner", brand: "Force of Nature", emoji: "", tip: "Electrolyzed water, kills 99.9% germs" },
      { name: "Seventh Generation Dish Soap", brand: "Seventh Generation", emoji: "", tip: "Plant-based, no synthetic fragrances" },
    ],
  },
  {
    key: "makeup",
    label: "Makeup & Beauty",
    emoji: "",
    products: [
      { name: "ILIA Super Serum Skin Tint", brand: "ILIA", emoji: "", tip: "Clean coverage with skincare benefits" },
      { name: "Tower 28 ShineOn Lip Jelly", brand: "Tower 28", emoji: "", tip: "Non-toxic, great for sensitive skin" },
      { name: "RMS Beauty Lip2Cheek", brand: "RMS", emoji: "", tip: "Organic, multi-use color" },
      { name: "Kosas Cloud Set Powder", brand: "Kosas", emoji: "", tip: "Clean, lightweight, skin-friendly" },
      { name: "Saie Dew Blush", brand: "Saie", emoji: "", tip: "Clean beauty, buildable color" },
    ],
  },
  {
    key: "wellness",
    label: "Wellness & Supplements",
    emoji: "",
    products: [
      { name: "Seed Daily Synbiotic", brand: "Seed", emoji: "", tip: "Science-backed probiotic" },
      { name: "Moon Juice Magnesi-Om", brand: "Moon Juice", emoji: "", tip: "Magnesium for sleep + calm" },
      { name: "Athletic Greens AG1", brand: "AG1", emoji: "", tip: "All-in-one daily supplement" },
      { name: "Vital Proteins Collagen", brand: "Vital Proteins", emoji: "", tip: "Grass-fed, pasture-raised collagen" },
      { name: "Liquid IV Hydration", brand: "Liquid IV", emoji: "", tip: "Electrolyte mix, non-GMO" },
    ],
  },
  {
    key: "baby",
    label: "Baby & Kids",
    emoji: "",
    products: [
      { name: "Pipette Baby Lotion", brand: "Pipette", emoji: "", tip: "Dermatologist tested, clean formula" },
      { name: "Attitude Baby Diapers", brand: "Attitude", emoji: "", tip: "Hypoallergenic, plant-based" },
      { name: "Babyganics Sunscreen", brand: "Babyganics", emoji: "", tip: "Mineral SPF, tear-free" },
      { name: "Earth Mama Organic Balm", brand: "Earth Mama", emoji: "", tip: "Organic herbs, gentle on skin" },
      { name: "Honest Company Wipes", brand: "Honest", emoji: "", tip: "Plant-based, hypoallergenic" },
    ],
  },
  {
    key: "home",
    label: "Home",
    emoji: "",
    products: [
      { name: "Coyuchi Organic Sheets", brand: "Coyuchi", emoji: "", tip: "100% organic cotton, GOTS certified" },
      { name: "Vitruvi Essential Oil Diffuser", brand: "Vitruvi", emoji: "", tip: "Ceramic, no plastic parts" },
      { name: "Beeswax Candles", brand: "Various", emoji: "", tip: "No paraffin, clean burning" },
      { name: "Molly Suds Laundry Powder", brand: "Molly Suds", emoji: "", tip: "Plant-based, no synthetic fragrances" },
      { name: "Public Goods Hand Soap", brand: "Public Goods", emoji: "", tip: "Essential oils, no sulfates" },
    ],
  },
  {
    key: "clothing",
    label: "Clothing & Fashion",
    emoji: "",
    products: [
      { name: "Pact Organic Basics", brand: "Pact", emoji: "", tip: "Fair trade, organic cotton" },
      { name: "Girlfriend Collective Leggings", brand: "Girlfriend", emoji: "", tip: "Made from recycled materials" },
      { name: "Allbirds Sneakers", brand: "Allbirds", emoji: "", tip: "Merino wool, sustainable materials" },
      { name: "Quince Cashmere", brand: "Quince", emoji: "", tip: "Affordable, sustainably sourced" },
      { name: "Everlane Basics", brand: "Everlane", emoji: "", tip: "Transparent pricing, ethical factories" },
    ],
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredCategories = searchInput.trim()
    ? BROWSE_CATEGORIES.filter((cat) => {
        const q = searchInput.toLowerCase();
        return (
          cat.label.toLowerCase().includes(q) ||
          cat.key.toLowerCase().includes(q) ||
          cat.products.some(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q)
          )
        );
      })
    : BROWSE_CATEGORIES;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleProductPress = (_product: ProductSuggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to scanner so user can scan this product
    router.push("/(tabs)/scan");
  };

  const handleCategoryPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  return (
    <View className="flex-1 bg-ivory">
      {/* Hero Header with Nature Image */}
      <ImageBackground
        source={require("@/assets/images/aesthetic/forest-canopy.jpg")}
        resizeMode="cover"
      >
        <View style={{ backgroundColor: "rgba(61,90,62,0.6)" }}>
          <SafeAreaView edges={["top"]}>
            <View className="px-5 pt-4 pb-5">
              <Text className="text-3xl font-bold text-white">Explore</Text>
              <Text className="text-sm text-white/70 mt-0.5">
                Browse clean products by category
              </Text>

              {/* Search Bar */}
              <View className="mt-4">
                <View
                  className="bg-white rounded-3xl flex-row items-center px-4 py-3"
                  style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" }}
                >
                  <Ionicons name="search" size={20} color="#A8B89C" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-dark"
                    placeholder="Search categories and products..."
                    placeholderTextColor="#999"
                    value={searchInput}
                    onChangeText={setSearchInput}
                    returnKeyType="search"
                  />
                  {searchInput.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchInput("")}>
                      <Ionicons name="close-circle" size={20} color="#A8B89C" />
                    </TouchableOpacity>
                  )}
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
        {/* Scan CTA */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/scan");
            }}
            activeOpacity={0.85}
            className="bg-forest rounded-3xl py-4 flex-row items-center justify-center"
            style={{
              shadowColor: "#3D5A3E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="scan-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Scan a Product to Analyze It
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Grid (when not filtering) */}
        {!searchInput.trim() && (
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
                      style={{ backgroundColor: "rgba(0,0,0,0.35)", height: 100 }}
                    >
                      {cat.emoji ? <Text className="text-2xl mb-1">{cat.emoji}</Text> : null}
                      <Text className="text-white font-bold text-base">{cat.label}</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Expanded Category or Search Results */}
        {(searchInput.trim() ? filteredCategories : expandedCategory ? BROWSE_CATEGORIES.filter((c) => c.key === expandedCategory) : []).map((cat) => (
          <View key={cat.key} className="px-5 mt-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                {cat.emoji ? <Text className="text-xl mr-2">{cat.emoji}</Text> : null}
                <Text className="text-lg font-bold text-dark">
                  {cat.label}
                </Text>
              </View>
              {!searchInput.trim() && (
                <TouchableOpacity onPress={() => setExpandedCategory(null)}>
                  <Text className="text-sm text-forest font-medium">Close</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ gap: 10 }}>
              {cat.products
                .filter((p) => {
                  if (!searchInput.trim()) return true;
                  const q = searchInput.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    p.brand.toLowerCase().includes(q)
                  );
                })
                .map((product, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleProductPress(product)}
                    activeOpacity={0.7}
                    className="bg-white rounded-3xl p-4 flex-row items-center"
                    style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
                  >
                    {product.emoji ? <Text className="text-2xl mr-3">{product.emoji}</Text> : null}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-dark" numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text className="text-xs text-dark/50 mt-0.5">{product.brand}</Text>
                      <Text className="text-xs text-forest/70 mt-1">{product.tip}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#A8B89C" />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        ))}

        {/* Popular Products section when nothing selected/searched */}
        {!searchInput.trim() && !expandedCategory && (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Popular Clean Swaps
            </Text>
            <View style={{ gap: 10 }}>
              {[
                BROWSE_CATEGORIES[0].products[0], // Skincare
                BROWSE_CATEGORIES[1].products[0], // Food
                BROWSE_CATEGORIES[2].products[0], // Drinks
                BROWSE_CATEGORIES[3].products[0], // Cleaning
                BROWSE_CATEGORIES[4].products[0], // Makeup
                BROWSE_CATEGORIES[5].products[0], // Wellness
              ].map((product, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.7}
                  className="bg-white rounded-3xl p-4 flex-row items-center"
                  style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <Text className="text-2xl mr-3">{product.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-dark" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-xs text-dark/50 mt-0.5">{product.brand}</Text>
                    <Text className="text-xs text-forest/70 mt-1">{product.tip}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#A8B89C" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* No results */}
        {searchInput.trim() && filteredCategories.length === 0 && (
          <View className="items-center px-5 mt-10">
            <Ionicons name="search-outline" size={40} color="#A8B89C" />
            <Text className="text-base font-semibold text-dark mt-3">No results found</Text>
            <Text className="text-sm text-dark/40 text-center mt-1">
              Try a different search term, or use the scanner to analyze a specific product
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
