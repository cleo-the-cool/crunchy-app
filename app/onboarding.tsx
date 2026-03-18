import { View, Text, Dimensions, TouchableOpacity, ImageBackground, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  FadeIn,
  FadeInUp,
  type SharedValue,
} from "react-native-reanimated";
import { useRef, useState } from "react";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    image: require("@/assets/images/aesthetic/leaves-hero.jpg"),
    title: "What is Crunchy?",
    subtitle: "Crunchy helps you understand what\u2019s really in your everyday products \u2014 from food to skincare to cleaning supplies.",
  },
  {
    image: require("@/assets/images/aesthetic/forest-canopy.jpg"),
    title: "Scan Anything",
    subtitle: "Point your camera at any product \u2014 scan barcodes, ingredient lists, or just the product itself for an instant health analysis.",
  },
  {
    image: require("@/assets/images/aesthetic/eucalyptus.jpg"),
    title: "Get Clean Swaps",
    subtitle: "Discover safer, cleaner alternatives personalized to your concerns. From skincare to snacks, we\u2019ve got you covered.",
  },
  {
    image: require("@/assets/images/aesthetic/monstera.jpg"),
    title: "Live Cleaner",
    subtitle: "Track your progress, try DIY recipes, and join a community of people making healthier choices every day.",
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
    return { width: dotWidth, opacity, backgroundColor: "#fff" };
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
  const [currentPage, setCurrentPage] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      const nextPage = currentPage + 1;
      scrollRef.current?.scrollTo({ x: nextPage * width, animated: true });
      setCurrentPage(nextPage);
    } else {
      router.push("/onboarding-preferences");
    }
  };

  const handleSkip = () => {
    router.push("/onboarding-preferences");
  };

  return (
    <View className="flex-1 bg-black">
      {/* Carousel */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentPage(page);
        }}
      >
        {slides.map((slide, index) => (
          <ImageBackground
            key={index}
            source={slide.image}
            resizeMode="cover"
            style={{ width, flex: 1 }}
          >
            <View style={{ flex: 1, backgroundColor: "rgba(61,90,62,0.6)" }}>
              <SafeAreaView style={{ flex: 1 }}>
                {/* Skip Button */}
                <View className="flex-row justify-end px-6 pt-2">
                  <TouchableOpacity onPress={handleSkip}>
                    <Text className="text-white/80 font-semibold text-base">Skip</Text>
                  </TouchableOpacity>
                </View>

                {/* Content - centered */}
                <View className="flex-1 justify-end px-10 pb-8">
                  <Text
                    className="text-4xl font-bold text-white mb-4"
                  >
                    {slide.title}
                  </Text>
                  <Text className="text-base text-white/80 leading-6">
                    {slide.subtitle}
                  </Text>
                </View>
              </SafeAreaView>
            </View>
          </ImageBackground>
        ))}
      </Animated.ScrollView>

      {/* Bottom Controls - overlaid */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{ backgroundColor: "rgba(61,90,62,0.85)" }}
      >
        <SafeAreaView edges={["bottom"]}>
          <View className="px-8 pt-5 pb-6">
            {/* Dot Indicators */}
            <View className="flex-row justify-center items-center mb-6">
              {slides.map((_, index) => (
                <Dot key={index} index={index} scrollX={scrollX} />
              ))}
            </View>

            {/* Next/Continue Button */}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              className="bg-white rounded-full px-7 py-4 items-center justify-center"
            >
              <Text className="text-forest text-base font-semibold tracking-wide">
                {currentPage === slides.length - 1 ? "Continue" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
