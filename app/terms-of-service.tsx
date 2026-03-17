import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGoBack } from "@/lib/useGoBack";

export default function TermsOfServiceScreen() {
  const goBack = useGoBack();

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4" style={{ fontFamily: 'Georgia' }}>Terms of Service</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm text-dark/50 mb-4">Last updated: March 6, 2026</Text>

        <Section title="1. Acceptance of Terms">
          By creating an account or using the Crunchy app, you agree to be bound by these Terms of
          Service. If you do not agree to these terms, please do not use the app.
        </Section>

        <Section title="2. Description of Service">
          Crunchy is a mobile application that helps users identify and understand product
          ingredients through image scanning, provides clean product alternatives, curated
          recipes for DIY products, and a community platform for sharing clean living tips.
        </Section>

        <Section title="3. Account Registration">
          You must provide accurate and complete information when creating an account. You are
          responsible for maintaining the confidentiality of your password and for all activities
          under your account. You must be at least 13 years old to use this service.
        </Section>

        <Section title="4. Product Scanning and Analysis">
          Product analysis is provided for informational purposes only and should not be
          considered medical, health, or safety advice. Scores and ratings are generated using
          AI (Google Gemini Vision API) and may not always be perfectly accurate. Always consult
          product labels directly and seek professional advice for health-related decisions.
          We are not liable for any decisions made based on scan results.
        </Section>

        <Section title="5. User Content">
          You retain ownership of content you post (text, images, reviews). By posting content,
          you grant Crunchy a non-exclusive, royalty-free license to display it within the app.
          You agree not to post content that is illegal, harmful, threatening, abusive,
          defamatory, or otherwise objectionable. We reserve the right to remove content that
          violates these terms.
        </Section>

        <Section title="6. Community Guidelines">
          When using community features, you agree to:{"\n\n"}
          {"\u2022"} Be respectful of other users{"\n"}
          {"\u2022"} Not post spam, misleading, or deceptive content{"\n"}
          {"\u2022"} Not harass, bully, or intimidate other users{"\n"}
          {"\u2022"} Not impersonate others or misrepresent your affiliation{"\n"}
          {"\u2022"} Report content that violates these guidelines
        </Section>

        <Section title="7. Recipes and DIY Instructions">
          Recipes and DIY instructions are provided for informational and educational purposes.
          Always test products on a small area first. Crunchy is not responsible for any adverse
          reactions, injuries, or damages resulting from following recipes or instructions in
          the app.
        </Section>

        <Section title="8. Subscription and Premium Features">
          Some features may require a paid subscription. Subscription terms, pricing, and
          cancellation policies will be clearly presented before purchase. Free trial periods
          may be offered and will automatically convert to paid subscriptions unless canceled.
        </Section>

        <Section title="9. Intellectual Property">
          The Crunchy app, including its design, features, content, and branding, is owned by
          Crunchy and protected by applicable intellectual property laws. You may not copy,
          modify, distribute, or reverse-engineer any part of the app.
        </Section>

        <Section title="10. Limitation of Liability">
          Crunchy is provided "as is" without warranties of any kind. To the maximum extent
          permitted by law, we shall not be liable for any indirect, incidental, special, or
          consequential damages arising from your use of the app.
        </Section>

        <Section title="11. Termination">
          We may suspend or terminate your account if you violate these terms. You may delete
          your account at any time by contacting us. Upon termination, your right to use the
          app ceases immediately.
        </Section>

        <Section title="12. Changes to Terms">
          We may update these Terms of Service from time to time. Continued use of the app
          after changes constitutes acceptance of the new terms. We will notify users of
          significant changes through the app.
        </Section>

        <Section title="13. Contact">
          For questions about these Terms of Service, please contact us at:{"\n"}
          <Text className="text-forest font-semibold">cleothecoolest@proton.me</Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="text-base font-bold text-dark mb-2" style={{ fontFamily: 'Georgia' }}>{title}</Text>
      <Text className="text-sm text-dark/70 leading-5">{children}</Text>
    </View>
  );
}
