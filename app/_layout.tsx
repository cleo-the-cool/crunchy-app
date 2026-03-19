import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { InterestsProvider } from "@/contexts/InterestsContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { View, ActivityIndicator, Text } from "react-native";
import { useNetworkStatus } from "@/lib/useNetworkStatus";
import { useFonts } from "expo-font";

function OfflineBanner() {
  const { isConnected, isChecking } = useNetworkStatus();
  if (isChecking || isConnected) return null;
  return (
    <View className="bg-amber-400 py-2 px-4 items-center">
      <Text className="text-amber-900 text-sm font-medium">No internet connection</Text>
    </View>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthFlow =
      segments[0] === "login" ||
      segments[0] === "signup" ||
      segments[0] === "welcome" ||
      segments[0] === "onboarding" ||
      segments[0] === "onboarding-profile" ||
      segments[0] === "quiz" ||
      segments[0] === "quiz-result" ||
      segments[0] === "interests" ||
      segments[0] === "onboarding-preferences";
    const inTabs = segments[0] === "(tabs)";

    if (!user && inTabs) {
      router.replace("/login");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-ivory items-center justify-center">
        <ActivityIndicator size="large" color="#3D5A3E" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 250,
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JosefinSans-Thin": require("@/assets/fonts/JosefinSans-Thin.ttf"),
    "JosefinSans-Regular": require("@/assets/fonts/JosefinSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <InterestsProvider>
          <PreferencesProvider>
            <RootNavigator />
          </PreferencesProvider>
        </InterestsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
