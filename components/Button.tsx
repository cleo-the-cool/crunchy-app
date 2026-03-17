import { Text, ActivityIndicator, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

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
  primary: "bg-forest",
  secondary: "bg-cream-dark border border-forest/10",
  outline: "bg-transparent border-2 border-forest/20",
};

const textStyles: Record<ButtonVariant, string> = {
  primary: "text-cream",
  secondary: "text-forest",
  outline: "text-forest",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={`rounded-full px-7 py-4 items-center justify-center ${variantStyles[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FAF8F5" : "#3D5A3E"}
        />
      ) : (
        <Text
          className={`text-base font-semibold tracking-wide ${textStyles[variant]}`}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}
