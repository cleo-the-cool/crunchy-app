import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGoBack } from "@/lib/useGoBack";

export default function PrivacyPolicyScreen() {
  const goBack = useGoBack();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4">Privacy Policy</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm text-dark/50 mb-4">Last updated: March 6, 2026</Text>

        <Section title="Introduction">
          Crunchy ("we", "our", or "us") is committed to protecting your privacy. This Privacy
          Policy explains how we collect, use, and safeguard your information when you use our
          mobile application.
        </Section>

        <Section title="Information We Collect">
          <BulletList
            items={[
              "Account Information: Your name, email address, and password when you create an account.",
              "Profile Data: Display name, avatar selection, quiz answers, interests, and crunchy score.",
              "Scan Data: Photos you take to scan products, and the resulting product analysis data (ingredients, scores, alternatives).",
              "Usage Data: How you interact with the app, including scans performed, recipes viewed, and community activity.",
              "Device Information: Device type, operating system, and app version for troubleshooting.",
            ]}
          />
        </Section>

        <Section title="How We Use Your Information">
          <BulletList
            items={[
              "To provide product scanning and ingredient analysis via the Google Gemini Vision API.",
              "To calculate and display your crunchy score and tier.",
              "To personalize your experience with relevant recipes and product alternatives.",
              "To enable community features such as posts, comments, and follows.",
              "To improve our app and develop new features.",
              "To communicate with you about your account and app updates.",
            ]}
          />
        </Section>

        <Section title="Google Gemini API Usage">
          When you scan a product, the image is sent to Google's Gemini Vision API for analysis.
          Google processes this image to identify ingredients and provide safety assessments.
          We do not store the raw images on our servers after processing. The analyzed results
          (product name, ingredients, scores) are cached in our database to provide faster results
          for repeat scans and to reduce unnecessary API calls.
        </Section>

        <Section title="Data Storage and Security">
          Your data is stored securely using Supabase, a trusted cloud infrastructure provider.
          We implement industry-standard security measures including encrypted connections,
          secure authentication, and access controls to protect your personal information.
        </Section>

        <Section title="We Do Not Sell Your Data">
          We do not sell, trade, or rent your personal data to third parties. Your information
          is used solely to provide and improve the Crunchy app experience. We will never
          monetize your personal data through advertising or data brokerage.
        </Section>

        <Section title="Data Sharing">
          We only share your data in the following limited circumstances:
          <BulletList
            items={[
              "With Google Gemini API to process product scans (image data only, processed and not retained).",
              "When required by law or to protect our legal rights.",
              "Community content you choose to make public (posts, comments, public lists).",
            ]}
          />
        </Section>

        <Section title="Your Rights">
          <BulletList
            items={[
              "Access: You can view all your personal data within the app.",
              "Deletion: You can request deletion of your account and all associated data by contacting us.",
              "Correction: You can update your profile information at any time.",
              "Data Export: You can request a copy of your data by contacting us.",
            ]}
          />
        </Section>

        <Section title="Children's Privacy">
          This app is designed for users aged 13 and older. We do not knowingly collect
          personal information from children under 13. If we become aware that we have
          collected personal information from a child under 13, we will take steps to
          delete that information promptly.
        </Section>

        <Section title="Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of any
          significant changes through the app or via email. Continued use of the app after
          changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="Contact Us">
          If you have questions about this Privacy Policy or your data, please contact us at:{"\n"}
          <Text className="text-sage font-semibold">cleothecoolest@proton.me</Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="text-base font-bold text-dark mb-2">{title}</Text>
      <Text className="text-sm text-dark/70 leading-5">{children}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View className="mt-1">
      {items.map((item, i) => (
        <View key={i} className="flex-row mb-1.5">
          <Text className="text-sm text-dark/70 mr-2">{"\u2022"}</Text>
          <Text className="text-sm text-dark/70 leading-5 flex-1">{item}</Text>
        </View>
      ))}
    </View>
  );
}
