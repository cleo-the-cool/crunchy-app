import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGoBack } from "@/lib/useGoBack";
import * as Haptics from "../utils/haptics";
import {
  useSubscription,
  SubscriptionTier,
} from "@/contexts/SubscriptionContext";

type TierInfo = {
  id: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  recommended: boolean;
  features: { text: string; included: boolean }[];
  highlight: string;
};

const TIERS: TierInfo[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    recommended: false,
    highlight: "Get started",
    features: [
      { text: "5 scans per day", included: true },
      { text: "Barcode scanning", included: true },
      { text: "Basic ingredient ratings", included: true },
      { text: "Community feed access", included: true },
      { text: "DIY recipe library", included: true },
      { text: "Label OCR scanning", included: false },
      { text: "AI product recognition", included: false },
      { text: "Unlimited scans", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9.99",
    period: "/mo",
    recommended: true,
    highlight: "Most popular",
    features: [
      { text: "50 scans per day", included: true },
      { text: "Barcode scanning", included: true },
      { text: "Detailed ingredient analysis", included: true },
      { text: "Community feed access", included: true },
      { text: "DIY recipe library", included: true },
      { text: "Label OCR scanning", included: true },
      { text: "AI product recognition", included: false },
      { text: "Unlimited scans", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$19.99",
    period: "/mo",
    recommended: false,
    highlight: "Everything",
    features: [
      { text: "Unlimited scans", included: true },
      { text: "Barcode scanning", included: true },
      { text: "Detailed ingredient analysis", included: true },
      { text: "Community feed access", included: true },
      { text: "DIY recipe library", included: true },
      { text: "Label OCR scanning", included: true },
      { text: "AI product recognition", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const params = useLocalSearchParams<{ reason?: string }>();
  const { tier: currentTier, subscribe } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("starter");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "COOL") {
      setCouponError("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await subscribe("premium");
      Alert.alert(
        "Welcome to Crunchy Premium!",
        "Your coupon has been applied. Enjoy full access!",
        [{ text: "Let's go!", onPress: () => router.back() }]
      );
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  const reasonText =
    params.reason === "scan_limit"
      ? "You've reached your daily scan limit"
      : params.reason === "premium_feature"
      ? "This is a premium feature"
      : "Upgrade for the full experience";

  const handleSubscribe = async () => {
    if (selectedTier === "free") {
      router.back();
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Mock subscription delay
    await new Promise((r) => setTimeout(r, 1500));

    await subscribe(selectedTier);
    setLoading(false);

    Alert.alert(
      "Welcome to Crunchy " + TIERS.find((t) => t.id === selectedTier)!.name + "!",
      "Your subscription is now active. Enjoy your clean living journey!",
      [{ text: "Let's go!", onPress: () => router.back() }]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      "Restore Purchases",
      "No previous purchases found. If you believe this is an error, please contact support.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
      {/* Close Button */}
      <View className="flex-row justify-end px-5 pt-2">
        <TouchableOpacity
          onPress={goBack}
          hitSlop={12}
          className="w-9 h-9 rounded-full bg-dark/10 items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#2D2D2D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-2 pb-4 items-center">
          <View className="bg-sage/15 rounded-full w-16 h-16 items-center justify-center mb-4">
            <Ionicons name="leaf" size={32} color="#8B9E7C" />
          </View>
          <Text className="text-2xl font-bold text-dark text-center">
            Unlock Your Full{"\n"}Clean Living Journey
          </Text>
          <Text className="text-base text-dark/60 text-center mt-2">
            {reasonText}
          </Text>

          {/* Social proof */}
          <View className="flex-row items-center mt-4 bg-sage/10 rounded-full px-4 py-2">
            <Ionicons name="people" size={16} color="#8B9E7C" />
            <Text className="text-sm text-sage-dark ml-2 font-medium">
              Join 10,000+ crunchy girls
            </Text>
          </View>
        </View>

        {/* Tier Cards */}
        <View className="px-5 mt-2">
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const isCurrent = currentTier === tier.id;

            return (
              <TouchableOpacity
                key={tier.id}
                onPress={() => {
                  setSelectedTier(tier.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.85}
                className={`rounded-3xl p-5 mb-3 border-2 ${
                  isSelected
                    ? tier.recommended
                      ? "border-sage bg-white"
                      : "border-sage bg-white"
                    : "border-transparent bg-white"
                }`}
                style={{
                  shadowColor: isSelected ? "#8B9E7C" : "#000",
                  shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                  shadowOpacity: isSelected ? 0.2 : 0.06,
                  shadowRadius: isSelected ? 12 : 6,
                  elevation: isSelected ? 6 : 2,
                }}
              >
                {/* Recommended badge */}
                {tier.recommended && (
                  <View className="absolute -top-3 left-1/2 bg-sage rounded-full px-4 py-1" style={{ transform: [{ translateX: -50 }] }}>
                    <Text className="text-white text-xs font-bold">
                      RECOMMENDED
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    {/* Radio indicator */}
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                        isSelected ? "border-sage" : "border-dark/20"
                      }`}
                    >
                      {isSelected && (
                        <View className="w-3.5 h-3.5 rounded-full bg-sage" />
                      )}
                    </View>
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-lg font-bold text-dark">
                          {tier.name}
                        </Text>
                        {isCurrent && (
                          <View className="bg-dark/10 rounded-full px-2 py-0.5 ml-2">
                            <Text className="text-xs text-dark/60 font-medium">
                              Current
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-dark/50">
                        {tier.highlight}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-dark">
                      {tier.price}
                    </Text>
                    {tier.period ? (
                      <Text className="text-xs text-dark/50">
                        {tier.period}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Features (only show for selected tier) */}
                {isSelected && (
                  <View className="mt-2 pt-3 border-t border-dark/5">
                    {tier.features.map((feature, index) => (
                      <View
                        key={index}
                        className="flex-row items-center mb-2"
                      >
                        <Ionicons
                          name={
                            feature.included
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={18}
                          color={feature.included ? "#4CAF50" : "#ccc"}
                        />
                        <Text
                          className={`text-sm ml-2 ${
                            feature.included
                              ? "text-dark"
                              : "text-dark/30"
                          }`}
                        >
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Value Highlights */}
        <View className="px-5 mt-4">
          <View className="bg-white rounded-3xl p-5" style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <Text className="text-base font-bold text-dark mb-3">
              What you get with Crunchy
            </Text>
            <ValueRow icon="scan" text="Scan any product instantly" />
            <ValueRow icon="flask" text="Know exactly what's in your products" />
            <ValueRow icon="swap-horizontal" text="Find clean alternatives in seconds" />
            <ValueRow icon="leaf" text="Live a healthier, toxin-free life" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-5 pb-4 pt-2 bg-cream">
        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
          className={`rounded-2xl py-4 items-center ${
            selectedTier === "free" ? "bg-dark/10" : "bg-sage"
          }`}
          style={
            selectedTier !== "free"
              ? {
                  shadowColor: "#8B9E7C",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }
              : undefined
          }
        >
          {loading ? (
            <Text className="text-white text-base font-bold">
              Activating...
            </Text>
          ) : selectedTier === "free" ? (
            <Text className="text-dark/60 text-base font-bold">
              Continue with Free
            </Text>
          ) : (
            <Text className="text-white text-base font-bold">
              Subscribe to{" "}
              {TIERS.find((t) => t.id === selectedTier)!.name} -{" "}
              {TIERS.find((t) => t.id === selectedTier)!.price}
              {TIERS.find((t) => t.id === selectedTier)!.period}
            </Text>
          )}
        </TouchableOpacity>

        {/* Coupon Code */}
        <View className="flex-row items-center mt-3 bg-white rounded-2xl border border-dark/10 overflow-hidden">
          <TextInput
            value={couponCode}
            onChangeText={(text) => {
              setCouponCode(text);
              if (couponError) setCouponError("");
            }}
            placeholder="Have a coupon code?"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            className="flex-1 px-4 py-3 text-sm text-dark"
          />
          <TouchableOpacity
            onPress={handleApplyCoupon}
            disabled={!couponCode.trim()}
            className="px-4 py-3"
          >
            <Text className={`text-sm font-bold ${couponCode.trim() ? "text-sage" : "text-dark/20"}`}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
        {couponError ? (
          <Text className="text-xs text-red-500 mt-1 ml-1">{couponError}</Text>
        ) : null}

        {/* Restore purchases */}
        <TouchableOpacity
          onPress={handleRestore}
          className="items-center mt-3 py-2"
        >
          <Text className="text-sm text-dark/40">Restore purchases</Text>
        </TouchableOpacity>
      </View>
      </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

function ValueRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center mb-2.5">
      <View className="bg-sage/10 rounded-full w-8 h-8 items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color="#8B9E7C" />
      </View>
      <Text className="text-sm text-dark/80 flex-1">{text}</Text>
    </View>
  );
}
