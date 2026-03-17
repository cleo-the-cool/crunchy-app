import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function SkeletonLoader({
  width = "100%",
  height = 16,
  borderRadius = 8,
  className = "",
}: SkeletonLoaderProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: "#A8B89C40",
        },
        animatedStyle,
      ]}
      className={className}
    />
  );
}

export function CardSkeleton() {
  return (
    <View
      className="bg-white rounded-3xl p-5 mb-3"
      style={{
        shadowColor: "#3D5A3E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center mb-3">
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View className="ml-3 flex-1">
          <SkeletonLoader width={120} height={14} />
          <View className="mt-2">
            <SkeletonLoader width={80} height={10} />
          </View>
        </View>
      </View>
      <SkeletonLoader height={14} />
      <View className="mt-2">
        <SkeletonLoader width="80%" height={14} />
      </View>
      <View className="mt-2">
        <SkeletonLoader width="60%" height={14} />
      </View>
    </View>
  );
}

export function ProductCardSkeleton() {
  return (
    <View
      className="bg-white rounded-3xl p-4 mb-3"
      style={{
        shadowColor: "#3D5A3E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        <SkeletonLoader width={48} height={48} borderRadius={16} />
        <View className="ml-3 flex-1">
          <SkeletonLoader width={140} height={14} />
          <View className="mt-2">
            <SkeletonLoader width={80} height={12} />
          </View>
        </View>
        <SkeletonLoader width={50} height={22} borderRadius={11} />
      </View>
    </View>
  );
}
