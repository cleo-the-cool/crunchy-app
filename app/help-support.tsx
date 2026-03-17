import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGoBack } from "@/lib/useGoBack";

const CONTACT_EMAIL = "hello@crunchyliving.app";

const FAQ_ITEMS = [
  {
    question: "How does product scanning work?",
    answer:
      "Point your camera at a product, ingredient list, or nutrition label. Our AI (powered by Google Gemini) analyzes the image and provides a breakdown of ingredients, safety scores, and cleaner alternatives.",
  },
  {
    question: "What is my Crunchy Score?",
    answer:
      "Your Crunchy Score reflects your clean living journey. It is calculated based on your scan history, recipes you have tried, and your initial quiz results. The more you scan and try clean alternatives, the higher your score grows.",
  },
  {
    question: "Are the ingredient safety scores reliable?",
    answer:
      "Our scores are generated using AI analysis and should be used as a general guide. For medical or health-related concerns, always consult a healthcare professional. We recommend reading product labels directly for the most accurate information.",
  },
  {
    question: "How do I delete my account?",
    answer:
      `To delete your account and all associated data, please send an email to ${CONTACT_EMAIL} with the subject "Account Deletion Request" and the email address associated with your account.`,
  },
  {
    question: "Is my data sold to third parties?",
    answer:
      "No. We never sell, rent, or trade your personal information to third parties for marketing or advertising purposes. Your data is used solely to provide the Crunchy app experience. See our Privacy Policy for full details.",
  },
  {
    question: "What are the subscription tiers?",
    answer:
      "Crunchy offers a free tier with basic scanning and community access. Premium features including unlimited scans, full recipe library, and advanced product insights are available with a subscription. Check the app for current pricing.",
  },
  {
    question: "Can I use Crunchy offline?",
    answer:
      "Some features like browsing saved recipes and viewing past scan results work offline. However, scanning new products requires an internet connection to process images through our AI service.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "Tap the report button (flag icon) on any post or comment to flag it for review. Our team reviews all reports and takes appropriate action to maintain a safe community.",
  },
];

export default function HelpSupportScreen() {
  const goBack = useGoBack();

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4" style={{ fontFamily: 'Georgia' }}>Help & Support</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Card */}
        <View className="mx-5 mb-6 bg-white rounded-3xl overflow-hidden" style={cardShadow}>
          <View className="px-4 py-4 items-center">
            <View className="w-12 h-12 rounded-full bg-forest/8 items-center justify-center mb-2">
              <Ionicons name="mail-outline" size={24} color="#3D5A3E" />
            </View>
            <Text className="text-base font-bold text-dark mb-1">Need help?</Text>
            <Text className="text-sm text-dark/50 text-center mb-3">
              Send us an email and we will get back to you as soon as possible.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
              className="bg-forest rounded-2xl px-6 py-3"
            >
              <Text className="text-white font-semibold text-sm">
                {CONTACT_EMAIL}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <Text className="text-sm font-semibold text-dark/40 uppercase tracking-wider px-5 mb-2" style={{ fontFamily: 'Georgia' }}>
          Frequently Asked Questions
        </Text>
        <View className="mx-5 bg-white rounded-3xl overflow-hidden" style={cardShadow}>
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              showDivider={index < FAQ_ITEMS.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FAQItem({
  question,
  answer,
  showDivider,
}: {
  question: string;
  answer: string;
  showDivider: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center px-4 py-3.5"
        activeOpacity={0.7}
      >
        <View className="w-8 items-center">
          <Ionicons name="help-circle-outline" size={20} color="#3D5A3E" />
        </View>
        <Text className="text-base text-dark ml-2 flex-1">{question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#ccc"
        />
      </TouchableOpacity>
      {expanded && (
        <View className="px-4 pb-3.5 pl-14">
          <Text className="text-sm text-dark/60 leading-5">{answer}</Text>
        </View>
      )}
      {showDivider && <View className="h-px bg-dark/5 ml-14" />}
    </>
  );
}

const cardShadow = {
  borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
};
