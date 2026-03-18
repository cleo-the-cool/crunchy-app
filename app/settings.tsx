import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import { useGoBack } from "@/lib/useGoBack";
import * as Haptics from "../utils/haptics";

export default function SettingsScreen() {
  const { user, signOut, deleteAccount, updateName, appleSignIn } = useAuth();
  const router = useRouter();
  const goBack = useGoBack();
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState("");

  const isAppleUser = user?.id?.startsWith("apple_");

  const handleChangeName = () => {
    setNewName(user?.name ?? "");
    setShowNameModal(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      Alert.alert("Missing Name", "Please enter a name.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateName(newName.trim());
    const stored = await AsyncStorage.getItem("@crunchy_onboarding_profile");
    const profile = stored ? JSON.parse(stored) : {};
    profile.displayName = newName.trim();
    await AsyncStorage.setItem("@crunchy_onboarding_profile", JSON.stringify(profile));
    setShowNameModal(false);
  };

  const handleAppleSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await appleSignIn();
    } catch {
      Alert.alert("Sign In Failed", "Could not sign in with Apple. Please try again.");
    }
  };

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

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/welcome");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark ml-4">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <SectionHeader title="Account" />
        <View className="mx-6 bg-white rounded-3xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={handleChangeName}>
            <SettingsRow icon="person-outline" label="Change Name" chevron />
          </TouchableOpacity>
          {!isAppleUser && (
            <>
              <Divider />
              <TouchableOpacity onPress={handleAppleSignIn}>
                <SettingsRow icon="logo-apple" label="Sign in with Apple" chevron />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View className="mx-6 bg-white rounded-3xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={() => router.push({ pathname: "/onboarding-preferences", params: { from: "settings" } })}>
            <SettingsRow icon="shield-outline" label="Scan Preferences" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => router.push({ pathname: "/interests", params: { from: "settings" } })}>
            <SettingsRow icon="heart-outline" label="Interests" chevron />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View className="mx-6 bg-white rounded-3xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={() => router.push("/help-support")}>
            <SettingsRow icon="help-circle-outline" label="Help & FAQ" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
            <SettingsRow icon="document-text-outline" label="Privacy Policy" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => router.push("/terms-of-service")}>
            <SettingsRow icon="shield-checkmark-outline" label="Terms of Service" chevron />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <SectionHeader title="Account Actions" />
        <View className="mx-6 bg-white rounded-3xl overflow-hidden" style={cardShadow}>
          <TouchableOpacity onPress={handleSignOut}>
            <SettingsRow icon="log-out-outline" label="Sign Out" chevron />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={handleDeleteAccount}>
            <View className="flex-row items-center px-4 py-3.5">
              <View className="w-8 items-center">
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <Text className="text-base ml-2 flex-1" style={{ color: "#EF4444" }}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Name Modal */}
      <Modal visible={showNameModal} transparent animationType="fade" onRequestClose={() => setShowNameModal(false)}>
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="bg-white rounded-3xl w-full p-6" style={cardShadow}>
            <Text className="text-lg font-bold text-dark mb-4">Change Name</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor="#A8B89C"
              autoCapitalize="words"
              autoFocus
              className="bg-ivory rounded-2xl px-4 py-3 text-base text-dark mb-4"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" }}
            />
            <View className="flex-row" style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowNameModal(false)}
                className="flex-1 py-3 rounded-2xl items-center"
                style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" }}
              >
                <Text className="text-base font-medium text-dark/60">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveName}
                className="flex-1 bg-forest py-3 rounded-2xl items-center"
              >
                <Text className="text-base font-semibold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const cardShadow = {
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.15)",
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 3,
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-sm font-semibold text-dark/40 uppercase tracking-wider px-6 mt-6 mb-2">
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
  chevron,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  chevron?: boolean;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5">
      <View className="w-8 items-center">
        <Ionicons name={icon} size={20} color="#3D5A3E" />
      </View>
      <Text className="text-base text-dark ml-2 flex-1">{label}</Text>
      {chevron && (
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      )}
    </View>
  );
}
