import { Platform } from "react-native";

export const impactAsync = async (style?: any) => {
  if (Platform.OS === "web") return;
  const Haptics = await import("expo-haptics");
  return Haptics.impactAsync(style);
};

export const notificationAsync = async (type?: any) => {
  if (Platform.OS === "web") return;
  const Haptics = await import("expo-haptics");
  return Haptics.notificationAsync(type);
};

export const selectionAsync = async () => {
  if (Platform.OS === "web") return;
  const Haptics = await import("expo-haptics");
  return Haptics.selectionAsync();
};

export const ImpactFeedbackStyle = {
  Light: "Light" as any,
  Medium: "Medium" as any,
  Heavy: "Heavy" as any,
};

export const NotificationFeedbackType = {
  Success: "Success" as any,
  Warning: "Warning" as any,
  Error: "Error" as any,
};
