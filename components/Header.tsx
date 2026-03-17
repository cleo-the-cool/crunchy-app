import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export function Header({
  title,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
}: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <View className="w-10">
        {showBack && (
          <TouchableOpacity onPress={onBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#3D5A3E" />
          </TouchableOpacity>
        )}
      </View>
      <Text
        className="text-xl text-forest"
        style={{ fontFamily: "Georgia", fontWeight: "600" }}
      >
        {title}
      </Text>
      <View className="w-10 items-end">
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} hitSlop={8}>
            <Ionicons name={rightIcon} size={24} color="#3D5A3E" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
