import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useGoBack } from "@/lib/useGoBack";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const goBack = useGoBack();
  const [communityNotifications, setCommunityNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/welcome");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <SettingsRow
            icon="person-outline"
            label="Name"
            value={user?.name ?? "Not set"}
          />
          <Divider />
          <SettingsRow
            icon="mail-outline"
            label="Email"
            value={user?.email ?? "Not set"}
          />
          <Divider />
          <SettingsRow
            icon="star-outline"
            label="Subscription"
            value="Free Plan"
            valueColor="#8B9E7C"
          />
        </View>

        {/* Personalization Section */}
        <SectionHeader title="Personalization" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={() => router.push({ pathname: "/interests", params: { from: "settings" } })}>
            <SettingsRow icon="heart-outline" label="My Interests" value="Edit" chevron />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <SettingsToggle
            icon="people-outline"
            label="Community"
            description="Likes and comments on your posts"
            value={communityNotifications}
            onToggle={setCommunityNotifications}
          />
          <Divider />
          <View className="flex-row items-center px-4 py-3">
            <View className="w-8 items-center">
              <Ionicons name="newspaper-outline" size={20} color="#8B9E7C" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-base text-dark">Weekly Digest</Text>
              <Text className="text-xs text-dark/40">Clean living tips and trends</Text>
            </View>
            <View className="bg-sage/15 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-medium text-sage">Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <Divider />
          <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
            <SettingsRow icon="document-text-outline" label="Privacy Policy" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => router.push("/terms-of-service")}>
            <SettingsRow icon="shield-checkmark-outline" label="Terms of Service" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => router.push("/help-support")}>
            <SettingsRow icon="help-circle-outline" label="Help & Support" chevron />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View className="mx-5 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-2xl py-4 items-center"
            style={cardShadow}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="#F44336" />
              <Text className="text-base font-semibold text-rating-avoid ml-2">
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-sm font-semibold text-dark/40 uppercase tracking-wider px-5 mt-6 mb-2">
      {title}
    </Text>
  );
}

function Divider() {
  return <View className="h-px bg-dark/5 ml-14" />;
}

function SettingsRow({
  icon,
  label,
  value,
  valueColor,
  chevron,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  valueColor?: string;
  chevron?: boolean;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5">
      <View className="w-8 items-center">
        <Ionicons name={icon} size={20} color="#8B9E7C" />
      </View>
      <Text className="text-base text-dark ml-2 flex-1">{label}</Text>
      {value && (
        <Text
          className="text-sm text-dark/50"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </Text>
      )}
      {chevron && (
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      )}
    </View>
  );
}

function SettingsToggle({
  icon,
  label,
  description,
  value,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="w-8 items-center">
        <Ionicons name={icon} size={20} color="#8B9E7C" />
      </View>
      <View className="flex-1 ml-2">
        <Text className="text-base text-dark">{label}</Text>
        <Text className="text-xs text-dark/40">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#ddd", true: "#8B9E7C" }}
        thumbColor="white"
      />
    </View>
  );
}
