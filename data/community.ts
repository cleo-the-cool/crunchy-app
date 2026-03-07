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
  crunchyScore: number;
  timestamp: string;
  content: string;
  image?: string;
  hashtags: string[];
  likes: number;
  comments: Comment[];
  postType: PostType;
};

export const COMMUNITY_USERS: CommunityUser[] = [
  {
    id: "user-1",
    username: "GreenGina",
    avatar: "🌻",
    bio: "Clean living mama of 3. Sharing my journey to a toxin-free home.",
    crunchyScore: 82,
    totalScans: 124,
    joinedDate: "2025-09-15",
    followers: 231,
    following: 58,
  },
  {
    id: "user-2",
    username: "NaturalNina",
    avatar: "🦋",
    bio: "Herbalist + DIY skincare. If I can't pronounce it, I won't use it.",
    crunchyScore: 91,
    totalScans: 287,
    joinedDate: "2025-07-22",
    followers: 512,
    following: 103,
  },
  {
    id: "user-3",
    username: "CrunchyChris",
    avatar: "🍄",
    bio: "Dad trying to keep it clean. One swap at a time.",
    crunchyScore: 45,
    totalScans: 38,
    joinedDate: "2026-01-10",
    followers: 29,
    following: 44,
  },
  {
    id: "user-4",
    username: "OrganicOlivia",
    avatar: "🥑",
    bio: "Holistic nutritionist. Meal prep queen.",
    crunchyScore: 78,
    totalScans: 156,
    joinedDate: "2025-11-03",
    followers: 189,
    following: 72,
  },
  {
    id: "user-5",
    username: "SageAndSoul",
    avatar: "🌿",
    bio: "Minimalist + zero waste. Less is more.",
    crunchyScore: 68,
    totalScans: 94,
    joinedDate: "2025-12-28",
    followers: 145,
    following: 61,
  },
];

export const TRENDING_HASHTAGS: string[] = [
  "#CleanSwap",
  "#ToxinFree",
  "#CrunchyLife",
  "#NaturalLiving",
  "#DIY",
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    userId: "user-2",
    username: "NaturalNina",
    avatar: "🦋",
    crunchyScore: 91,
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    content:
      "Just made my own tallow balm and it's incredible! 3 ingredients: rendered tallow, jojoba oil, and a few drops of lavender essential oil. My skin has never been softer. Who else makes their own skincare?",
    image: "🧴",
    hashtags: ["#DIY", "#NaturalLiving", "#ToxinFree"],
    likes: 34,
    comments: [
      {
        id: "c1",
        userId: "user-1",
        username: "GreenGina",
        avatar: "🌻",
        content: "I need this recipe! Where do you source your tallow?",
        timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
        likes: 5,
      },
      {
        id: "c2",
        userId: "user-5",
        username: "SageAndSoul",
        avatar: "🌿",
        content:
          "I add a little vitamin E oil to mine for extra shelf life. Game changer!",
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        likes: 3,
      },
    ],
    postType: "tip",
  },
  {
    id: "post-2",
    userId: "user-1",
    username: "GreenGina",
    avatar: "🌻",
    crunchyScore: 82,
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    content:
      "Scanned my kids' favorite cereal and it scored a 23... time to find a swap. Any recommendations for a clean breakfast cereal that kids will actually eat?",
    hashtags: ["#CleanSwap", "#CrunchyLife"],
    likes: 28,
    comments: [
      {
        id: "c3",
        userId: "user-4",
        username: "OrganicOlivia",
        avatar: "🥑",
        content:
          "We love Nature's Path! Their Envirokidz line is great and scores really well.",
        timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(),
        likes: 8,
      },
      {
        id: "c4",
        userId: "user-3",
        username: "CrunchyChris",
        avatar: "🍄",
        content:
          "Homemade granola is easier than you think! I do oats, honey, coconut oil, and whatever nuts/seeds I have.",
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        likes: 6,
      },
    ],
    postType: "question",
  },
  {
    id: "post-3",
    userId: "user-4",
    username: "OrganicOlivia",
    avatar: "🥑",
    crunchyScore: 78,
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    content:
      "My go-to all-purpose cleaner: 1 part white vinegar, 1 part water, 10 drops tea tree oil, 5 drops lemon. Works on everything and smells amazing. Costs pennies compared to store bought!",
    image: "🧼",
    hashtags: ["#DIY", "#ToxinFree", "#CleanSwap"],
    likes: 52,
    comments: [
      {
        id: "c5",
        userId: "user-2",
        username: "NaturalNina",
        avatar: "🦋",
        content: "This is basically what I use too! Works so well on countertops.",
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        likes: 4,
      },
    ],
    postType: "recipe",
  },
  {
    id: "post-4",
    userId: "user-3",
    username: "CrunchyChris",
    avatar: "🍄",
    crunchyScore: 45,
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    content:
      "Week 2 of my clean swap journey. Replaced our dish soap and hand soap so far. Baby steps but my score is already going up! This app is honestly motivating.",
    hashtags: ["#CrunchyLife", "#CleanSwap"],
    likes: 41,
    comments: [
      {
        id: "c6",
        userId: "user-1",
        username: "GreenGina",
        avatar: "🌻",
        content: "Every swap counts! You're doing great. The dish soap swap was my first one too.",
        timestamp: new Date(Date.now() - 7 * 3600000).toISOString(),
        likes: 9,
      },
      {
        id: "c7",
        userId: "user-5",
        username: "SageAndSoul",
        avatar: "🌿",
        content: "Which dish soap did you switch to? Looking for recs.",
        timestamp: new Date(Date.now() - 6.5 * 3600000).toISOString(),
        likes: 2,
      },
      {
        id: "c8",
        userId: "user-3",
        username: "CrunchyChris",
        avatar: "🍄",
        content: "Branch Basics concentrate! A little goes a long way.",
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        likes: 7,
      },
    ],
    postType: "review",
  },
  {
    id: "post-5",
    userId: "user-5",
    username: "SageAndSoul",
    avatar: "🌿",
    crunchyScore: 68,
    timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
    content:
      "Tip: always check the ingredients list, not just the front label. \"Natural\" means nothing legally. Companies can slap it on anything. The scanner catches this stuff instantly.",
    hashtags: ["#ToxinFree", "#NaturalLiving"],
    likes: 67,
    comments: [
      {
        id: "c9",
        userId: "user-2",
        username: "NaturalNina",
        avatar: "🦋",
        content: "THIS. Greenwashing is everywhere. So many \"clean\" brands are anything but.",
        timestamp: new Date(Date.now() - 13 * 3600000).toISOString(),
        likes: 12,
      },
    ],
    postType: "tip",
  },
  {
    id: "post-6",
    userId: "user-2",
    username: "NaturalNina",
    avatar: "🦋",
    crunchyScore: 91,
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    content:
      "Reviewed Primally Pure deodorant after 3 months. Verdict: actually works, even in summer. Scored 92 on the scanner. The charcoal one is my favorite. A bit pricey but worth it for clean pits!",
    image: "🧴",
    hashtags: ["#NaturalLiving", "#ToxinFree"],
    likes: 45,
    comments: [],
    postType: "review",
  },
  {
    id: "post-7",
    userId: "user-4",
    username: "OrganicOlivia",
    avatar: "🥑",
    crunchyScore: 78,
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    content:
      "Does anyone have a good recipe for homemade toothpaste? I've tried a few but they always taste weird or the texture is off. Want something my whole family will use.",
    hashtags: ["#DIY", "#CrunchyLife"],
    likes: 19,
    comments: [
      {
        id: "c10",
        userId: "user-2",
        username: "NaturalNina",
        avatar: "🦋",
        content:
          "Coconut oil + baking soda + peppermint EO. Start with less baking soda than you think, it can be abrasive.",
        timestamp: new Date(Date.now() - 34 * 3600000).toISOString(),
        likes: 5,
      },
    ],
    postType: "question",
  },
];

export function getPostById(id: string): CommunityPost | undefined {
  return COMMUNITY_POSTS.find((p) => p.id === id);
}

export function getUserById(id: string): CommunityUser | undefined {
  return COMMUNITY_USERS.find((u) => u.id === id);
}

export function getPostsByUserId(userId: string): CommunityPost[] {
  return COMMUNITY_POSTS.filter((p) => p.userId === userId);
}
