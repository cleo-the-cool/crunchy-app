import { Platform } from "react-native";

// Web-safe camera exports
export const useCameraPermissions = Platform.OS === "web" 
  ? () => [{ granted: false, canAskAgain: false }, async () => ({ granted: false })] as const
  : require("expo-camera").useCameraPermissions;

export const CameraView = Platform.OS === "web"
  ? ({ children, ...props }: any) => {
      const { View, Text } = require("react-native");
      return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>📸 Camera preview available on mobile only</Text>
          {children}
        </View>
      );
    }
  : require("expo-camera").CameraView;
