import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const sections = [
  {
    title: "Information We Collect",
    bullets: [
      "Account information (email, username, avatar) when you create an account",
      "Product scan data (photos are processed by Google Gemini AI and are not stored on our servers)",
      "Your scan history and saved products (stored locally on your device)",
      "Usage data and app preferences",
      "Concern preferences you set during onboarding",
    ],
  },
  {
    title: "How We Use Your Information",
    bullets: [
      "To provide product scanning and analysis features",
      "To calculate your Crunchy Score and track your clean living journey",
      "To personalize your experience based on your concern preferences",
      "To improve our product analysis accuracy",
      "We never sell your personal data to third parties",
    ],
  },
  {
    title: "Google Gemini API Usage",
    bullets: [
      "Product photos are sent to Google's Gemini AI for analysis",
      "Photos are processed in real-time and are not permanently stored by our app",
      "Google's API may process data according to their own privacy policy",
      "We recommend reviewing Google's AI privacy practices at ai.google.dev/terms",
    ],
  },
  {
    title: "Data Storage",
    bullets: [
      "Your scan history, saved products, and preferences are stored locally on your device using AsyncStorage",
      "Account data is stored securely in our Supabase database",
      "You can delete your data at any time through the Settings page",
    ],
  },
  {
    title: "Your Rights",
    bullets: [
      "Access your personal data at any time through the app",
      "Delete your account and all associated data",
      "Export your scan history",
      "Opt out of any data collection beyond what's required for core functionality",
    ],
  },
  {
    title: "Contact Us",
    bullets: [
      "If you have questions about this Privacy Policy, contact us at support@crunchyapp.com",
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-ivory">
      <View className="flex-row items-center px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-3" style={{ fontFamily: "Georgia" }}>
          Privacy Policy
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-dark/70 mb-6 leading-5">
          Crunchy ("we", "our", or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your
          information when you use our mobile application.
        </Text>

        {sections.map((section, i) => (
          <View key={i} className="mb-6">
            <Text className="text-base font-bold text-dark mb-2" style={{ fontFamily: "Georgia" }}>
              {section.title}
            </Text>
            {section.bullets.map((bullet, j) => (
              <View key={j} className="flex-row mb-2 pr-4">
                <Text className="text-dark/60 text-sm mr-2">•</Text>
                <Text className="text-sm text-dark/80 leading-5 flex-1">{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text className="text-xs text-dark/40 text-center mb-8 mt-4">
          Last updated: March 2026
        </Text>
      </ScrollView>
    </View>
  );
}
