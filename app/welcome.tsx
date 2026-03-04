import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaWrapper>
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo */}
        <View className="w-24 h-24 bg-sage rounded-3xl items-center justify-center mb-6">
          <Ionicons name="leaf" size={48} color="#FFFFFF" />
        </View>

        {/* App Name */}
        <Text className="text-4xl font-bold text-dark mb-3">Crunchy</Text>

        {/* Tagline */}
        <Text className="text-lg text-dark-light text-center leading-7">
          The operating system for{"\n"}conscious living
        </Text>
      </View>

      {/* CTA */}
      <View className="px-8 pb-8">
        <Button
          title="Get Started"
          onPress={() => router.push("/onboarding")}
        />
        <Text className="text-center text-dark-light mt-4 text-sm">
          Already have an account?{" "}
          <Text
            className="text-sage font-semibold"
            onPress={() => router.push("/(tabs)")}
          >
            Log in
          </Text>
        </Text>
      </View>
    </SafeAreaWrapper>
  );
}
