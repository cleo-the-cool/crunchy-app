import { View, Text } from "react-native";

type BadgeRating = "clean" | "caution" | "avoid";

interface BadgeProps {
  rating: BadgeRating;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ratingConfig: Record<
  BadgeRating,
  { bg: string; text: string; label: string }
> = {
  clean: { bg: "bg-rating-clean", text: "text-white", label: "Clean" },
  caution: { bg: "bg-rating-caution", text: "text-dark", label: "Caution" },
  avoid: { bg: "bg-rating-avoid", text: "text-white", label: "Avoid" },
};

const sizeStyles: Record<string, { container: string; text: string }> = {
  sm: { container: "px-2 py-0.5 rounded-full", text: "text-xs" },
  md: { container: "px-3 py-1 rounded-full", text: "text-sm" },
  lg: { container: "px-4 py-2 rounded-2xl", text: "text-base font-semibold" },
};

export function Badge({ rating, size = "md", className = "" }: BadgeProps) {
  const config = ratingConfig[rating];
  const sizes = sizeStyles[size];

  return (
    <View className={`${config.bg} ${sizes.container} ${className}`}>
      <Text className={`${config.text} ${sizes.text} font-medium`}>
        {config.label}
      </Text>
    </View>
  );
}
