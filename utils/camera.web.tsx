import React from "react";
import { View, Text } from "react-native";

export function useCameraPermissions(): [any, () => Promise<any>] {
  return [{ granted: false, canAskAgain: false, status: "undetermined" }, async () => ({ granted: false })];
}

export function CameraView({ children, style, ...props }: any) {
  return (
    <View style={[{ flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }, style]}>
      <Text style={{ color: '#fff', fontSize: 48, marginBottom: 12 }}>📸</Text>
      <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }}>
        Camera is available on the mobile app
      </Text>
      {children}
    </View>
  );
}

export type BarcodeScanningResult = { type: string; data: string };
