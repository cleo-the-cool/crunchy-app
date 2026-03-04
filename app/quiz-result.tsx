import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";

type ScoreLabel = {
  label: string;
  emoji: string;
  description: string;
  color: string;
};

function getScoreLabel(score: number): ScoreLabel {
  if (score <= 20) {
    return {
      label: "Seedling",
      emoji: "🌱",
      description: "You're just starting your clean living journey. Every step counts!",
      color: "#A8B89C",
    };
  } else if (score <= 40) {
    return {
      label: "Sprout",
      emoji: "🌿",
      description: "You're growing your awareness. Keep making swaps, one at a time!",
      color: "#8B9E7C",
    };
  } else if (score <= 60) {
    return {
      label: "Blooming",
      emoji: "🌸",
      description: "You're well on your way to a cleaner lifestyle. Looking good!",
      color: "#F4A574",
    };
  } else if (score <= 80) {
    return {
      label: "Thriving",
      emoji: "🌻",
      description: "You're seriously committed to clean living. Inspiring!",
      color: "#E88B4E",
    };
  } else {
    return {
      label: "Fully Rooted",
      emoji: "🌳",
      description: "You're a clean living icon. Time to help others on their journey!",
      color: "#6B7E5C",
    };
  }
}

function ShareableCard({
  score,
  scoreLabel,
  viewShotRef,
}: {
  score: number;
  scoreLabel: ScoreLabel;
  viewShotRef: React.RefObject<ViewShot | null>;
}) {
  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: "png", quality: 1 }}
    >
      <View
        className="rounded-3xl p-8 items-center"
        style={{ backgroundColor: "#FAF8F5" }}
      >
        {/* App branding */}
        <View className="flex-row items-center mb-6">
          <View className="w-8 h-8 rounded-lg bg-sage items-center justify-center mr-2">
            <Ionicons name="leaf" size={16} color="white" />
          </View>
          <Text className="text-lg font-bold text-dark">Crunchy</Text>
        </View>

        {/* Score circle */}
        <View
          className="w-36 h-36 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: scoreLabel.color + "20" }}
        >
          <Text className="text-4xl mb-1">{scoreLabel.emoji}</Text>
          <Text
            className="text-4xl font-bold"
            style={{ color: scoreLabel.color }}
          >
            {score}
          </Text>
        </View>

        {/* Label */}
        <Text className="text-2xl font-bold text-dark mb-2">
          {scoreLabel.label}
        </Text>
        <Text className="text-sm text-dark-light text-center px-4 mb-4">
          {scoreLabel.description}
        </Text>

        {/* Footer */}
        <View className="bg-sage/10 rounded-2xl px-4 py-2">
          <Text className="text-xs text-sage font-medium">
            Take the quiz at crunchy.app
          </Text>
        </View>
      </View>
    </ViewShot>
  );
}

export default function QuizResultScreen() {
  const router = useRouter();
  const { score: scoreParam } = useLocalSearchParams<{ score: string }>();
  const score = parseInt(scoreParam || "50", 10);
  const scoreLabel = getScoreLabel(score);
  const viewShotRef = useRef<ViewShot>(null);

  // Animation values
  const scoreAnim = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const labelOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animate card in
    cardScale.value = withSpring(1, { damping: 12 });
    cardOpacity.value = withTiming(1, { duration: 500 });

    // Animate score counting up
    scoreAnim.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });

    // Update display score via polling during animation
    const interval = setInterval(() => {
      // We'll use the label opacity trigger instead
    }, 50);

    // Show label after score animation
    labelOpacity.value = withDelay(1600, withTiming(1, { duration: 400 }));

    // Show buttons after label
    buttonsOpacity.value = withDelay(2000, withTiming(1, { duration: 400 }));

    // Simple score counter
    let frame = 0;
    const totalFrames = 45; // ~1.5s at 30fps
    const timer = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (frame >= totalFrames) clearInterval(timer);
    }, 33);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

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
          // Fallback to text share
          await Share.share({
            message: `I scored ${score}/100 on the Crunchy Quiz! I'm a ${scoreLabel.label} ${scoreLabel.emoji}. Take the quiz at crunchy.app`,
          });
        }
      }
    } catch (error) {
      // Fallback to text share
      await Share.share({
        message: `I scored ${score}/100 on the Crunchy Quiz! I'm a ${scoreLabel.label} ${scoreLabel.emoji}. Take the quiz at crunchy.app`,
      });
    }
  };

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="items-center mb-4">
          <Text className="text-lg font-semibold text-dark">Your Score</Text>
        </View>

        {/* Shareable Result Card */}
        <Animated.View style={cardAnimStyle} className="mb-6">
          <View
            className="rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <ShareableCard
              score={displayScore}
              scoreLabel={scoreLabel}
              viewShotRef={viewShotRef}
            />
          </View>
        </Animated.View>

        {/* Label and description (animated in) */}
        <Animated.View style={labelAnimStyle} className="items-center mb-8">
          <Text className="text-base text-dark-light text-center">
            You're a <Text className="font-bold text-dark">{scoreLabel.label}</Text> on the crunchy scale!
          </Text>
        </Animated.View>

        {/* Action Buttons (animated in) */}
        <Animated.View style={buttonsAnimStyle} className="gap-3">
          <TouchableOpacity
            onPress={handleShare}
            className="flex-row items-center justify-center py-4 rounded-2xl bg-sage"
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Share My Score
            </Text>
          </TouchableOpacity>

          <Button
            title="Create Account"
            variant="secondary"
            onPress={() => router.push("/(tabs)")}
          />

          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="items-center py-3"
          >
            <Text className="text-sage font-medium">Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaWrapper>
  );
}
