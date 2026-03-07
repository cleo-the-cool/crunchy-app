import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "../../utils/haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import {
  COMMUNITY_POSTS,
  POST_TYPE_CONFIG,
  type CommunityPost,
  type Comment,
  type PostType,
} from "@/data/community";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CardSkeleton } from "@/components";

const AVATAR_EMOJI_MAP: Record<string, string> = {
  leaf: "🌿",
  sunflower: "🌻",
  mushroom: "🍄",
  avocado: "🥑",
  butterfly: "🦋",
  bee: "🐝",
  cherry: "🍒",
  rainbow: "🌈",
  star: "⭐",
  cactus: "🌵",
  peach: "🍑",
  herb: "🌱",
};

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

const POST_TYPE_FILTERS: { label: string; value: PostType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Questions", value: "question" },
  { label: "Reviews", value: "review" },
  { label: "Tips", value: "tip" },
  { label: "Recipes", value: "recipe" },
];

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commentSheetPostId, setCommentSheetPostId] = useState<string | null>(
    null
  );
  const [newComment, setNewComment] = useState("");
  const [selectedPostType, setSelectedPostType] = useState<PostType | "all">("all");
  const [userProfile, setUserProfile] = useState<{ displayName: string; avatar: string } | null>(null);

  // Load user profile from AsyncStorage
  useState(() => {
    setTimeout(() => setIsLoading(false), 800);
    AsyncStorage.getItem("@crunchy_onboarding_profile").then((stored) => {
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    });
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleLike = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: p.likes + (likedPosts.has(postId) ? -1 : 1) }
          : p
      )
    );
  };

  const handleOpenComments = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCommentSheetPostId(postId);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !commentSheetPostId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const avatarEmoji = userProfile?.avatar
      ? AVATAR_EMOJI_MAP[userProfile.avatar] ?? "🌿"
      : "🌿";
    const comment: Comment = {
      id: `comment-new-${Date.now()}`,
      userId: user?.id ?? "user-me",
      username: userProfile?.displayName ?? user?.name ?? "You",
      avatar: avatarEmoji,
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === commentSheetPostId
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );
    setNewComment("");
  };

  const handlePostTypeFilter = (type: PostType | "all") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPostType(type);
  };

  const handleReportPost = (postId: string) => {
    Alert.alert(
      "Report Post",
      "Are you sure you want to report this post for inappropriate content?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Reported",
              "Thank you for helping keep our community safe. We will review this report."
            );
          },
        },
      ]
    );
  };

  const handleReportComment = (commentId: string) => {
    Alert.alert(
      "Report Comment",
      "Are you sure you want to report this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Reported",
              "Thank you. We will review this comment."
            );
          },
        },
      ]
    );
  };

  const handleUserPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (userId === user?.id) {
      router.push("/(tabs)/profile");
    } else {
      router.push(`/user-profile?userId=${userId}`);
    }
  };

  const filteredPosts = useMemo(() => {
    if (selectedPostType === "all") return posts;
    return posts.filter((p) => p.postType === selectedPostType);
  }, [posts, selectedPostType]);

  const commentSheetPost = commentSheetPostId
    ? posts.find((p) => p.id === commentSheetPostId)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-2xl font-bold text-dark">Community</Text>
        <Text className="text-sm text-dark/50 mt-0.5">
          See what crunchy girls are sharing
        </Text>
      </View>

      {/* Post Type Filters */}
      <View className="mt-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {POST_TYPE_FILTERS.map((filter) => {
            const isActive = selectedPostType === filter.value;
            return (
              <TouchableOpacity
                key={filter.value}
                onPress={() => handlePostTypeFilter(filter.value)}
                className={`px-4 py-2 rounded-full ${
                  isActive ? "bg-sage" : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <Text
                  className={`text-sm font-medium ${
                    isActive ? "text-white" : "text-sage"
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Feed */}
      <ScrollView
        className="flex-1 mt-3"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B9E7C"
          />
        }
      >
        {isLoading ? (
          <View style={{ gap: 16 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View className="items-center mt-16">
            <Text className="text-5xl mb-4">💬</Text>
            <Text className="text-lg font-bold text-dark text-center">
              No posts yet
            </Text>
            <Text className="text-sm text-dark/50 text-center mt-2 px-8">
              Be the first to share something with the community!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/create-post")}
              className="mt-4 bg-sage px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-semibold">Create Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPosts.has(post.id)}
                onLike={() => handleLike(post.id)}
                onComment={() => handleOpenComments(post.id)}
                onUserPress={handleUserPress}
                onReport={() => handleReportPost(post.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Post FAB */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/create-post");
        }}
        activeOpacity={0.8}
        className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-sage items-center justify-center"
        style={{
          shadowColor: "#8B9E7C",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Comment Sheet Modal */}
      <Modal
        visible={!!commentSheetPostId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCommentSheetPostId(null)}
      >
        <SafeAreaView className="flex-1 bg-cream">
          <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-dark/10">
            <Text className="text-lg font-bold text-dark">Comments</Text>
            <TouchableOpacity onPress={() => setCommentSheetPostId(null)}>
              <Ionicons name="close" size={24} color="#2D2D2D" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={commentSheetPost?.comments ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, gap: 16 }}
            ListEmptyComponent={
              <View className="items-center mt-12">
                <Text className="text-4xl mb-3">💭</Text>
                <Text className="text-base font-semibold text-dark">
                  No comments yet
                </Text>
                <Text className="text-sm text-dark/50 mt-1">
                  Start the conversation!
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => {
                    setCommentSheetPostId(null);
                    handleUserPress(item.userId);
                  }}
                >
                  <View className="w-8 h-8 rounded-full bg-sage/15 items-center justify-center mr-3">
                    <Text className="text-base">{item.avatar}</Text>
                  </View>
                </TouchableOpacity>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        setCommentSheetPostId(null);
                        handleUserPress(item.userId);
                      }}
                    >
                      <Text className="text-sm font-semibold text-dark">
                        {item.username}
                      </Text>
                    </TouchableOpacity>
                    <Text className="text-xs text-dark/40">
                      {formatTimeAgo(item.timestamp)}
                    </Text>
                  </View>
                  <Text className="text-sm text-dark/80 mt-1">
                    {item.content}
                  </Text>
                  <View className="flex-row items-center mt-2 gap-3">
                    <TouchableOpacity
                      onPress={() => handleReportComment(item.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="flag-outline" size={13} color="#ccc" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="flex-row items-center px-5 py-3 border-t border-dark/10 bg-white">
              <TextInput
                className="flex-1 bg-cream rounded-2xl px-4 py-3 text-sm text-dark mr-3"
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={newComment}
                onChangeText={setNewComment}
                returnKeyType="send"
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Ionicons
                  name="send"
                  size={22}
                  color={newComment.trim() ? "#8B9E7C" : "#ccc"}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function AnimatedHeart({ isLiked, onLike, likeCount }: { isLiked: boolean; onLike: () => void; likeCount: number }) {
  const heartScale = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLikePress = () => {
    if (!isLiked) {
      heartScale.value = withSequence(
        withSpring(1.4, { damping: 4, stiffness: 400 }),
        withSpring(1, { damping: 8, stiffness: 300 })
      );
    }
    onLike();
  };

  return (
    <TouchableOpacity
      onPress={handleLikePress}
      className="flex-row items-center mr-5"
      hitSlop={8}
    >
      <Animated.View style={animatedHeartStyle}>
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={20}
          color={isLiked ? "#F44336" : "#999"}
        />
      </Animated.View>
      <Text className="text-sm text-dark/50 ml-1.5">
        {likeCount}
      </Text>
    </TouchableOpacity>
  );
}

function PostCard({
  post,
  isLiked,
  onLike,
  onComment,
  onUserPress,
  onReport,
}: {
  post: CommunityPost;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onUserPress: (userId: string) => void;
  onReport: () => void;
}) {
  const typeConfig = POST_TYPE_CONFIG[post.postType];

  return (
    <View
      className="bg-white rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* User Header */}
      <View className="flex-row items-center mb-2">
        <TouchableOpacity
          onPress={() => onUserPress(post.userId)}
          className="flex-row items-center flex-1"
        >
          <View className="w-10 h-10 rounded-full bg-sage/15 items-center justify-center mr-3">
            <Text className="text-xl">{post.avatar}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-dark">
              {post.username}
            </Text>
            <Text className="text-xs text-dark/40">
              {formatTimeAgo(post.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          {/* Post Type Badge */}
          <View
            className="px-2 py-1 rounded-full flex-row items-center"
            style={{ backgroundColor: typeConfig.color + "18" }}
          >
            <Text className="text-xs mr-0.5">{typeConfig.emoji}</Text>
            <Text
              className="text-xs font-medium"
              style={{ color: typeConfig.color }}
            >
              {typeConfig.label}
            </Text>
          </View>
          {/* Report */}
          <TouchableOpacity onPress={onReport} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <Text className="text-sm text-dark/80 leading-5">{post.content}</Text>

      {/* Image */}
      {post.image && (
        <View className="mt-3 rounded-2xl bg-sage/10 h-48 items-center justify-center">
          <Text className="text-6xl">{post.image}</Text>
        </View>
      )}

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <View className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
          {post.hashtags.map((tag) => (
            <Text key={tag} className="text-xs font-medium text-sage">{tag}</Text>
          ))}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center mt-3 pt-3 border-t border-dark/5">
        <AnimatedHeart isLiked={isLiked} onLike={onLike} likeCount={post.likes} />
        <TouchableOpacity
          onPress={onComment}
          className="flex-row items-center"
          hitSlop={8}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#999" />
          <Text className="text-sm text-dark/50 ml-1.5">
            {post.comments.length}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
