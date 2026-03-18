import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ViewShot from "../utils/view-shot";
import * as Sharing from "../utils/sharing";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import { getTierInfo, type TierInfo } from "@/lib/crunchyScore";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import * as Haptics from "../utils/haptics";

const TIER_COLORS: Record<string, string> = {
  seedling: "#A8B89C",
  sprout: "#8B9E7C",
  sapling: "#6B7E5C",
  bloom: "#C4A76C",
};

function getTierDescription(tier: TierInfo): string {
  switch (tier.tier) {
    case "seedling":
      return "You're just starting your clean living journey. Every step counts!";
    case "sprout":
      return "You're growing your awareness. Keep making swaps, one at a time!";
    case "sapling":
      return "You're well on your way to a cleaner lifestyle. Looking good!";
    case "bloom":
      return "You're a clean living icon. Time to help others on their journey!";
    default:
      return "Welcome to your clean living journey!";
  }
}

function ShareableCard({
  score,
  tier,
  viewShotRef,
}: {
  score: number;
  tier: TierInfo;
  viewShotRef: React.RefObject<ViewShot | null>;
}) {
  const color = TIER_COLORS[tier.tier] || "#8B9E7C";
  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: "png", quality: 1 }}
    >
      <View
        className="rounded-3xl p-8 items-center"
        style={{ backgroundColor: "#FFFDF8" }}
      >
        {/* App branding */}
        <View className="flex-row items-center mb-6">
          <View className="w-8 h-8 rounded-lg bg-forest items-center justify-center mr-2">
            <Ionicons name="leaf" size={16} color="white" />
          </View>
          <Text className="text-lg font-bold text-dark">Crunchy</Text>
        </View>

        {/* Score circle */}
        <View
          className="w-36 h-36 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: color + "20" }}
        >
          <Text className="text-4xl mb-1">{tier.emoji}</Text>
          <Text
            className="text-4xl font-bold"
            style={{ color }}
          >
            {score}
          </Text>
        </View>

        {/* Label */}
        <Text className="text-2xl font-bold text-dark mb-2">
          {tier.label}
        </Text>
        <Text className="text-sm text-dark-light text-center px-4 mb-4">
          {getTierDescription(tier)}
        </Text>

        {/* Footer */}
        <View className="bg-forest/8 rounded-3xl px-4 py-2">
          <Text className="text-xs text-forest font-medium">
            Take the quiz at crunchy.app
          </Text>
        </View>
      </View>
    </ViewShot>
  );
}

export default function QuizResultScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { score: scoreParam, quizAnswers: quizAnswersParam } = useLocalSearchParams<{ score: string; quizAnswers?: string }>();
  const score = parseInt(scoreParam || "50", 10);
  const quizAnswers = quizAnswersParam ? JSON.parse(quizAnswersParam) : null;
  const tier = getTierInfo(score);
  const viewShotRef = useRef<ViewShot>(null);
  const color = TIER_COLORS[tier.tier] || "#8B9E7C";

  // Animation values
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const labelOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Save quiz score to AsyncStorage + Supabase
    saveQuizScore();

    // Animate card in
    cardScale.value = withSpring(1, { damping: 12 });
    cardOpacity.value = withTiming(1, { duration: 500 });

    // Show label after score animation
    labelOpacity.value = withDelay(1600, withTiming(1, { duration: 400 }));

    // Show buttons after label
    buttonsOpacity.value = withDelay(2000, withTiming(1, { duration: 400 }));

    // Score counter animation
    let frame = 0;
    const totalFrames = 45;
    const timer = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (frame >= totalFrames) clearInterval(timer);
    }, 33);

    return () => clearInterval(timer);
  }, []);

  async function saveQuizScore() {
    try {
      const now = new Date().toISOString();
      // Save to AsyncStorage for local score calculation
      await AsyncStorage.setItem(
        "@crunchy_quiz_score",
        JSON.stringify({
          score,
          completedAt: now,
          quizAnswers,
          tier: tier.tier,
          tierLabel: tier.label,
        })
      );

      // Save to Supabase profiles if configured
      if (isSupabaseConfigured() && user) {
        try {
          // Try upsert - insert if profile doesn't exist, update if it does
          await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              quiz_answers: quizAnswers,
              quiz_completed_at: now,
              crunchy_score: score,
              crunchy_tier: tier.tier,
              display_name: user.name || null,
            }, { onConflict: "id" });
        } catch {
          // RLS or network error - local storage is the fallback
        }
      }
    } catch {
      // Never block the user from seeing results
    }
  }

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const buttonsAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your Crunchy Score",
          });
        } else {
          await Share.share({
            message: `I scored ${score}/100 on the Crunchy Quiz! I'm a ${tier.label} ${tier.emoji}. Take the quiz at crunchy.app`,
          });
        }
      }
    } catch {
      await Share.share({
        message: `I scored ${score}/100 on the Crunchy Quiz! I'm a ${tier.label} ${tier.emoji}. Take the quiz at crunchy.app`,
      });
    }
  };

  // If user is signed in, this is post-signup onboarding; otherwise pre-signup
  const isPostSignup = !!user;

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <Animated.View style={labelAnimStyle} className="items-center mb-4">
          <Text className="text-lg font-semibold text-dark">Your Crunchy Score</Text>
        </Animated.View>

        {/* Shareable Result Card */}
        <Animated.View style={cardAnimStyle} className="mb-6">
          <View
            className="rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#3D5A3E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <ShareableCard
              score={displayScore}
              tier={tier}
              viewShotRef={viewShotRef}
            />
          </View>
        </Animated.View>

        {/* Label and description (animated in) */}
        <Animated.View style={labelAnimStyle} className="items-center mb-8">
          <Text className="text-base text-dark-light text-center">
            You're a{" "}
            <Text className="font-bold text-dark">{tier.label}</Text> on the
            crunchy scale!
          </Text>
        </Animated.View>

        {/* Action Buttons (animated in) */}
        <Animated.View style={buttonsAnimStyle} className="gap-3">
          <TouchableOpacity
            onPress={handleShare}
            className="flex-row items-center justify-center py-4 rounded-3xl bg-forest"
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Share My Score
            </Text>
          </TouchableOpacity>

          {isPostSignup ? (
            <Button
              title="Pick Your Interests"
              variant="secondary"
              onPress={() => router.replace("/interests")}
            />
          ) : (
            <Button
              title="Create Account"
              variant="secondary"
              onPress={() => router.push("/signup")}
            />
          )}

          <TouchableOpacity
            onPress={() =>
              isPostSignup
                ? router.replace("/(tabs)")
                : router.push("/interests")
            }
            className="items-center py-3"
          >
            <Text className="text-forest font-medium">Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaWrapper>
  );
}
