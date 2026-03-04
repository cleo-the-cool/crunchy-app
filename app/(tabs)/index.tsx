import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-dark mb-2">Home</Text>
        <Text className="text-base text-dark/60 text-center">
          Your clean living dashboard
        </Text>
      </View>
    </SafeAreaView>
  );
}
