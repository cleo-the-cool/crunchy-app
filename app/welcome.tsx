import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("@/assets/images/aesthetic/leaves-hero.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(61,90,62,0.6)" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 justify-center items-center px-8">
            {/* Logo Mark */}
            <Animated.View
              entering={FadeIn.duration(800)}
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" }}
            >
              <Ionicons name="leaf" size={48} color="white" />
            </Animated.View>

            {/* App Name */}
            <Animated.Text
              entering={FadeInDown.delay(200).duration(500)}
              className="text-5xl font-bold text-white mb-3"
              style={{ fontFamily: "System", fontWeight: "700", letterSpacing: 0.3 }}
            >
              Crunchy
            </Animated.Text>

            {/* Tagline */}
            <Animated.Text
              entering={FadeInDown.delay(400).duration(500)}
              className="text-lg text-white/80 text-center leading-7"
            >
              Know what{"'"}s in your products.{"\n"}Live cleaner, feel better.
            </Animated.Text>
          </View>

          {/* CTA */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            className="px-8 pb-8"
          >
            <TouchableOpacity
              onPress={() => router.push("/onboarding")}
              activeOpacity={0.85}
              className="bg-white rounded-full px-7 py-4 items-center justify-center"
            >
              <Text className="text-forest text-base font-semibold tracking-wide">Get Started</Text>
            </TouchableOpacity>
            <Text className="text-center text-white/60 mt-4 text-sm">
              Already have an account?{" "}
              <Text
                className="text-white font-semibold"
                onPress={() => router.push("/login")}
              >
                Log in
              </Text>
            </Text>
          </Animated.View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
