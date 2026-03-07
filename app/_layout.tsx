import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { InterestsProvider } from "@/contexts/InterestsContext";
import { View, ActivityIndicator } from "react-native";

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
      segments[0] === "interests";
    const inTabs = segments[0] === "(tabs)";

    if (!user && inTabs) {
      router.replace("/login");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#8B9E7C" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 250,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <InterestsProvider>
          <RootNavigator />
        </InterestsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
