import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaWrapper>
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo */}
        <Animated.View
          entering={FadeIn.duration(600)}
          className="w-28 h-28 bg-sage rounded-3xl items-center justify-center mb-8"
          style={{
            shadowColor: "#8B9E7C",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Ionicons name="leaf" size={56} color="#FFFFFF" />
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(500)}
          className="text-4xl font-bold text-dark mb-3"
        >
          Crunchy
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          entering={FadeInDown.delay(400).duration(500)}
          className="text-lg text-dark-light text-center leading-7"
        >
          The operating system for{"\n"}conscious living
        </Animated.Text>
      </View>

      {/* CTA */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        className="px-8 pb-8"
      >
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
      </Animated.View>
    </SafeAreaWrapper>
  );
}
