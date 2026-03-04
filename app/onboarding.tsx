import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaWrapper, Button } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  type SharedValue,
} from "react-native-reanimated";
import { useRef } from "react";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: "scan",
    iconColor: "#FFFFFF",
    iconBg: "#8B9E7C",
    title: "Scan Anything",
    subtitle:
      "Point your camera at any product to instantly see what is really inside. Barcodes, labels, or just the product itself.",
  },
  {
    icon: "sparkles",
    iconColor: "#FFFFFF",
    iconBg: "#F4A574",
    title: "Discover Clean Swaps",
    subtitle:
      "Get personalized recommendations for cleaner alternatives. From skincare to snacks, we have you covered.",
  },
  {
    icon: "people",
    iconColor: "#FFFFFF",
    iconBg: "#8B9E7C",
    title: "Join the Community",
    subtitle:
      "Connect with thousands of other conscious consumers. Share tips, recipes, and wins on your clean living journey.",
  },
];

function Dot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 24, 8],
      "clamp"
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.3, 1, 0.3],
      "clamp"
    );
    const backgroundColor = interpolateColor(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      ["#C4C4C4", "#8B9E7C", "#C4C4C4"]
    );
    return { width: dotWidth, opacity, backgroundColor };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="h-2 rounded-full mx-1"
    />
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const goToNextSlide = (currentIndex: number) => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      router.push("/(tabs)");
    }
  };

  return (
    <SafeAreaWrapper>
      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-2">
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <Text className="text-sage font-semibold text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View
            key={index}
            style={{ width }}
            className="flex-1 justify-center items-center px-10"
          >
            {/* Icon Placeholder */}
            <View
              style={{ backgroundColor: slide.iconBg }}
              className="w-32 h-32 rounded-3xl items-center justify-center mb-10"
            >
              <Ionicons name={slide.icon} size={64} color={slide.iconColor} />
            </View>

            {/* Title */}
            <Text className="text-3xl font-bold text-dark text-center mb-4">
              {slide.title}
            </Text>

            {/* Subtitle */}
            <Text className="text-base text-dark-light text-center leading-6">
              {slide.subtitle}
            </Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Dot Indicators */}
      <View className="flex-row justify-center items-center mb-8">
        {slides.map((_, index) => (
          <Dot key={index} index={index} scrollX={scrollX} />
        ))}
      </View>

      {/* Bottom Buttons */}
      <View className="px-8 pb-8">
        <Button
          title="Take the Crunchy Quiz"
          onPress={() => router.push("/(tabs)")}
        />
      </View>
    </SafeAreaWrapper>
  );
}
