import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGoBack } from "@/lib/useGoBack";
import * as Haptics from "../utils/haptics";
import { getTierInfo } from "@/lib/crunchyScore";
import {
  getUserById,
  getPostsByUserId,
  POST_TYPE_CONFIG,
  type CommunityPost,
} from "@/data/community";

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

export default function UserProfileScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [isFollowing, setIsFollowing] = useState(false);

  const user = userId ? getUserById(userId) : undefined;
  const userPosts = userId ? getPostsByUserId(userId) : [];
  const tierInfo = user ? getTierInfo(user.crunchyScore) : null;

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-row items-center px-5 pt-2 pb-4">
          <TouchableOpacity onPress={goBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark ml-4">Profile</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-5xl mb-4">👤</Text>
          <Text className="text-lg font-bold text-dark">User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFollowing(!isFollowing);
  };

  const handleReport = () => {
    Alert.alert(
      "Report User",
      "Are you sure you want to report this user for inappropriate content?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            Alert.alert("Reported", "Thank you for helping keep our community safe. We will review this report.");
          },
        },
      ]
    );
  };

  const joinedDate = new Date(user.joinedDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark">@{user.username}</Text>
        <TouchableOpacity onPress={handleReport} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#2D2D2D" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Name */}
        <View className="items-center px-5 pt-2 pb-4">
          <View
            className="w-20 h-20 rounded-full bg-sage/15 items-center justify-center mb-3"
            style={{
              shadowColor: "#8B9E7C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-4xl">{user.avatar}</Text>
          </View>
          <Text className="text-xl font-bold text-dark">{user.username}</Text>
          <Text className="text-sm text-dark/50 mt-1 text-center px-8">
            {user.bio}
          </Text>
          <Text className="text-xs text-dark/30 mt-2">
            Joined {joinedDate}
          </Text>
        </View>

        {/* Follow Button */}
        <View className="px-5 mb-4">
          <TouchableOpacity
            onPress={handleFollow}
            className={`py-3 rounded-2xl items-center ${
              isFollowing ? "bg-white border border-sage" : "bg-sage"
            }`}
            style={isFollowing ? cardShadow : undefined}
          >
            <Text
              className={`font-semibold ${
                isFollowing ? "text-sage" : "text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-5 mb-4" style={{ gap: 12 }}>
          <View
            className="flex-1 bg-white rounded-2xl py-3 items-center"
            style={cardShadow}
          >
            <Text className="text-lg font-bold text-dark">
              {tierInfo?.emoji} {user.crunchyScore}
            </Text>
            <Text className="text-xs text-dark/50">{tierInfo?.label}</Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl py-3 items-center"
            style={cardShadow}
          >
            <Text className="text-lg font-bold text-dark">
              {user.totalScans}
            </Text>
            <Text className="text-xs text-dark/50">Scans</Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl py-3 items-center"
            style={cardShadow}
          >
            <Text className="text-lg font-bold text-dark">
              {user.followers}
            </Text>
            <Text className="text-xs text-dark/50">Followers</Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl py-3 items-center"
            style={cardShadow}
          >
            <Text className="text-lg font-bold text-dark">
              {user.following}
            </Text>
            <Text className="text-xs text-dark/50">Following</Text>
          </View>
        </View>

        {/* Posts */}
        <View className="px-5">
          <Text className="text-base font-bold text-dark mb-3">
            Posts ({userPosts.length})
          </Text>
          {userPosts.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-sm text-dark/50">No posts yet</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {userPosts.map((post) => (
                <UserPostCard key={post.id} post={post} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function UserPostCard({ post }: { post: CommunityPost }) {
  const typeConfig = POST_TYPE_CONFIG[post.postType];
  return (
    <View className="bg-white rounded-2xl p-4" style={cardShadow}>
      {/* Post Type Badge */}
      <View className="flex-row items-center mb-2">
        <View
          className="px-2.5 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: typeConfig.color + "18" }}
        >
          <Text className="text-xs mr-1">{typeConfig.emoji}</Text>
          <Text
            className="text-xs font-medium"
            style={{ color: typeConfig.color }}
          >
            {typeConfig.label}
          </Text>
        </View>
        <Text className="text-xs text-dark/40 ml-auto">
          {formatTimeAgo(post.timestamp)}
        </Text>
      </View>

      <Text className="text-sm text-dark/80 leading-5">{post.content}</Text>

      {post.image && (
        <View className="mt-3 rounded-2xl bg-sage/10 h-36 items-center justify-center">
          <Text className="text-5xl">{post.image}</Text>
        </View>
      )}

      {post.hashtags.length > 0 && (
        <View className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
          {post.hashtags.map((tag) => (
            <Text key={tag} className="text-xs font-medium text-sage">
              {tag}
            </Text>
          ))}
        </View>
      )}

      <View className="flex-row items-center mt-3 pt-2.5 border-t border-dark/5">
        <View className="flex-row items-center mr-5">
          <Ionicons name="heart-outline" size={16} color="#999" />
          <Text className="text-xs text-dark/50 ml-1">{post.likes}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={15} color="#999" />
          <Text className="text-xs text-dark/50 ml-1">
            {post.comments.length}
          </Text>
        </View>
      </View>
    </View>
  );
}
