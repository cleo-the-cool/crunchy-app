import { Text, View, Image, type ViewStyle } from "react-native";

interface BrandTextProps {
  size?: "sm" | "md" | "lg";
  showLogo?: boolean;
  color?: string;
  style?: ViewStyle;
}

const SIZES = {
  sm: { fontSize: 16, logoSize: 20 },
  md: { fontSize: 24, logoSize: 28 },
  lg: { fontSize: 32, logoSize: 36 },
};

export function BrandText({ size = "md", showLogo = true, color = "#3D5A3E", style }: BrandTextProps) {
  const { fontSize, logoSize } = SIZES[size];
  return (
    <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>
      {showLogo && (
        <Image
          source={require("@/assets/images/logo/logo-white-bg.jpg")}
          style={{ width: logoSize, height: logoSize, marginRight: 6, borderRadius: logoSize / 4 }}
          resizeMode="contain"
        />
      )}
      <Text style={{ fontFamily: "JosefinSans-Thin", fontSize, color, letterSpacing: 1 }}>
        Crunchy Living
      </Text>
    </View>
  );
}
