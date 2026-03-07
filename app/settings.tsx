import { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { useGoBack } from "@/lib/useGoBack";

const NOTIF_STORAGE_KEY = "@crunchy_notification_prefs";

export default function SettingsScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const goBack = useGoBack();
  const [communityNotifications, setCommunityNotifications] = useState(true);
  const [scanReminders, setScanReminders] = useState(false);
  const [tipsAndUpdates, setTipsAndUpdates] = useState(true);

  useEffect(() => {
    loadNotifPrefs();
  }, []);

  async function loadNotifPrefs() {
    const stored = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
    if (stored) {
      const prefs = JSON.parse(stored);
      setCommunityNotifications(prefs.community ?? true);
      setScanReminders(prefs.scanReminders ?? false);
      setTipsAndUpdates(prefs.tipsAndUpdates ?? true);
    }
  }

  async function saveNotifPref(key: string, value: boolean) {
    const stored = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
    const prefs = stored ? JSON.parse(stored) : {};
    prefs[key] = value;
    await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(prefs));
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This will permanently remove all your data, including scans, lists, and profile information. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            await deleteAccount();
            router.replace("/welcome");
          },
        },
      ]
    );
  };

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
      <View className="flex-row items-center px-6 pt-2 pb-4">
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
        {/* ── Account ── */}
        <SectionHeader title="Account" />
        <View className="mx-6 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
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

        {/* ── Preferences ── */}
        <SectionHeader title="Preferences" />
        <View className="mx-6 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={() => router.push("/edit-profile")}>
            <SettingsRow icon="create-outline" label="Edit Profile" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => router.push({ pathname: "/interests", params: { from: "settings" } })}>
            <SettingsRow icon="heart-outline" label="My Interests" chevron />
          </TouchableOpacity>
          <Divider />
          <SettingsToggle
            icon="people-outline"
            label="Community Notifications"
            description="Likes and comments on your posts"
            value={communityNotifications}
            onToggle={(v) => {
              setCommunityNotifications(v);
              saveNotifPref("community", v);
            }}
          />
          <Divider />
          <SettingsToggle
            icon="scan-outline"
            label="Scan Reminders"
            description="Weekly reminders to scan products"
            value={scanReminders}
            onToggle={(v) => {
              setScanReminders(v);
              saveNotifPref("scanReminders", v);
            }}
          />
          <Divider />
          <SettingsToggle
            icon="bulb-outline"
            label="Tips & Updates"
            description="Clean living tips and new features"
            value={tipsAndUpdates}
            onToggle={(v) => {
              setTipsAndUpdates(v);
              saveNotifPref("tipsAndUpdates", v);
            }}
          />
        </View>

        {/* ── Legal ── */}
        <SectionHeader title="Legal" />
        <View className="mx-6 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
            <SettingsRow icon="document-text-outline" label="Privacy Policy" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => router.push("/terms-of-service")}>
            <SettingsRow icon="shield-checkmark-outline" label="Terms of Service" chevron />
          </TouchableOpacity>
        </View>

        {/* ── Support ── */}
        <SectionHeader title="Support" />
        <View className="mx-6 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={() => router.push("/help-support")}>
            <SettingsRow icon="help-circle-outline" label="Help & Support" chevron />
          </TouchableOpacity>
          <Divider />
          <SettingsRow icon="chatbubble-outline" label="Send Feedback" chevron />
        </View>

        {/* ── About Crunchy ── */}
        <SectionHeader title="About Crunchy" />
        <View className="mx-6 bg-white rounded-2xl overflow-hidden" style={cardShadow}>
          <SettingsRow icon="leaf-outline" label="App" value="Crunchy" valueColor="#8B9E7C" />
          <Divider />
          <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
        </View>

        {/* ── Log Out ── */}
        <View className="mx-6 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-2xl py-4 items-center"
            style={cardShadow}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="#8B9E7C" />
              <Text className="text-base font-semibold text-sage ml-2">
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Danger Zone ── */}
        <DangerZoneHeader />
        <View className="mx-6 bg-white rounded-2xl overflow-hidden" style={dangerCardShadow}>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="flex-row items-center px-4 py-4"
          >
            <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold" style={{ color: "#EF4444" }}>
                Delete Account
              </Text>
              <Text className="text-xs text-dark/40 mt-0.5">
                Permanently remove all your data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
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

const dangerCardShadow = {
  shadowColor: "#EF4444",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
  borderWidth: 1,
  borderColor: "rgba(239,68,68,0.15)",
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-sm font-semibold text-dark/40 uppercase tracking-wider px-6 mt-6 mb-2">
      {title}
    </Text>
  );
}

function DangerZoneHeader() {
  return (
    <Text
      className="text-sm font-semibold uppercase tracking-wider px-6 mt-8 mb-2"
      style={{ color: "#EF4444" }}
    >
      Danger Zone
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
