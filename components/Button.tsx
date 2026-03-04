import { Text, TouchableOpacity, ActivityIndicator } from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-sage",
  secondary: "bg-peach",
  outline: "bg-transparent border-2 border-sage",
};

const textStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-sage",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`rounded-2xl px-6 py-4 items-center justify-center ${variantStyles[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#8B9E7C" : "#FFFFFF"}
        />
      ) : (
        <Text
          className={`text-base font-semibold ${textStyles[variant]}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
