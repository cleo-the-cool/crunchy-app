export type PostType = "general" | "review" | "tip" | "recipe" | "question";

export const POST_TYPE_CONFIG: Record<
  PostType,
  { label: string; emoji: string; color: string }
> = {
  general: { label: "General", emoji: "💬", color: "#8B9E7C" },
  review: { label: "Review", emoji: "⭐", color: "#F4A574" },
  tip: { label: "Tip", emoji: "💡", color: "#FFC107" },
  recipe: { label: "Recipe", emoji: "🧪", color: "#4CAF50" },
  question: { label: "Question", emoji: "❓", color: "#5C9CE6" },
};

export type CommunityUser = {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  crunchyScore: number;
  totalScans: number;
  joinedDate: string;
  followers: number;
  following: number;
};

export type Comment = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
};

export type CommunityPost = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  timestamp: string;
  content: string;
  image?: string;
  hashtags: string[];
  likes: number;
  comments: Comment[];
  postType: PostType;
};

export const COMMUNITY_USERS: CommunityUser[] = [];

export const TRENDING_HASHTAGS: string[] = [];

export const COMMUNITY_POSTS: CommunityPost[] = [];

export function getPostById(id: string): CommunityPost | undefined {
  return COMMUNITY_POSTS.find((p) => p.id === id);
}

export function getPostsByHashtag(hashtag: string): CommunityPost[] {
  return COMMUNITY_POSTS.filter((p) =>
    p.hashtags.some((h) => h.toLowerCase() === hashtag.toLowerCase())
  );
}

export function getUserById(id: string): CommunityUser | undefined {
  return COMMUNITY_USERS.find((u) => u.id === id);
}

export function getPostsByUserId(userId: string): CommunityPost[] {
  return COMMUNITY_POSTS.filter((p) => p.userId === userId);
}
