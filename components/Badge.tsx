import { View, Text } from "react-native";

type BadgeRating = "clean" | "caution" | "avoid";

interface BadgeProps {
  rating: BadgeRating;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const ratingConfig: Record<
  BadgeRating,
  { bg: string; text: string; label: string }
> = {
  clean: { bg: "bg-rating-clean/15", text: "text-rating-clean", label: "Clean" },
  caution: { bg: "bg-rating-caution/15", text: "text-rating-caution", label: "Caution" },
  avoid: { bg: "bg-rating-avoid/15", text: "text-rating-avoid", label: "Avoid" },
};

const sizeStyles: Record<string, { container: string; text: string }> = {
  sm: { container: "px-2.5 py-1 rounded-full", text: "text-xs" },
  md: { container: "px-3.5 py-1.5 rounded-full", text: "text-sm" },
  lg: { container: "px-5 py-2.5 rounded-full", text: "text-base font-semibold" },
};

export function Badge({ rating, size = "md", label, className = "" }: BadgeProps) {
  const config = ratingConfig[rating];
  const sizes = sizeStyles[size];

  return (
    <View className={`${config.bg} ${sizes.container} ${className}`}>
      <Text className={`${config.text} ${sizes.text} font-semibold`}>
        {label ?? config.label}
      </Text>
    </View>
  );
}
