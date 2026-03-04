import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ScanResultScreen() {
  const router = useRouter();
  const { barcode, type } = useLocalSearchParams<{
    barcode?: string;
    type?: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-3 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">Scan Result</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-sage/10 rounded-full w-20 h-20 items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={40} color="#8B9E7C" />
        </View>
        <Text className="text-xl font-bold text-dark mb-2">Product Scanned</Text>
        {barcode && (
          <Text className="text-sm text-dark/50 mb-1">Barcode: {barcode}</Text>
        )}
        {type && (
          <Text className="text-xs text-dark/40">Type: {type}</Text>
        )}
        <Text className="text-sm text-dark/60 mt-4 text-center">
          Full product details coming soon. The complete scan result screen will show ingredient analysis, ratings, and alternatives.
        </Text>
      </View>
    </SafeAreaView>
  );
}
