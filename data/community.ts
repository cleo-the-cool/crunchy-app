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

export const COMMUNITY_USERS: CommunityUser[] = [
  {
    id: "user-001",
    username: "sage.mama",
    avatar: "🌿",
    bio: "Mom of 2 on a clean living journey. DIY everything. Sharing what works for our family.",
    crunchyScore: 82,
    totalScans: 147,
    joinedDate: "2025-09-15",
    followers: 234,
    following: 89,
  },
  {
    id: "user-002",
    username: "crunchy.claire",
    avatar: "🍃",
    bio: "Curly hair enthusiast going clean. One product swap at a time.",
    crunchyScore: 65,
    totalScans: 89,
    joinedDate: "2025-11-01",
    followers: 156,
    following: 112,
  },
  {
    id: "user-003",
    username: "eco.elle",
    avatar: "🌸",
    bio: "Skincare minimalist. Oil cleansing convert. Clean beauty advocate.",
    crunchyScore: 91,
    totalScans: 203,
    joinedDate: "2025-08-20",
    followers: 412,
    following: 67,
  },
  {
    id: "user-004",
    username: "green.goddess",
    avatar: "🌱",
    bio: "6 months into my crunchy journey and never looking back. Clean home, clean food, clean skin.",
    crunchyScore: 78,
    totalScans: 124,
    joinedDate: "2025-09-01",
    followers: 567,
    following: 134,
  },
  {
    id: "user-005",
    username: "natural.nina",
    avatar: "🌻",
    bio: "DIY skincare lover. If I can make it at home, I will.",
    crunchyScore: 73,
    totalScans: 95,
    joinedDate: "2025-10-15",
    followers: 189,
    following: 98,
  },
  {
    id: "user-006",
    username: "wellness.wren",
    avatar: "🕊️",
    bio: "Minimalism meets clean living. Less products, better ingredients.",
    crunchyScore: 88,
    totalScans: 176,
    joinedDate: "2025-07-10",
    followers: 345,
    following: 45,
  },
  {
    id: "user-007",
    username: "pure.poppy",
    avatar: "🌺",
    bio: "Swapping toxic for clean, one product at a time. Glass everything.",
    crunchyScore: 71,
    totalScans: 68,
    joinedDate: "2025-12-01",
    followers: 123,
    following: 156,
  },
  {
    id: "user-008",
    username: "rootedrose",
    avatar: "🌹",
    bio: "DIY toothpaste maker. Natural home advocate. Dentist-approved!",
    crunchyScore: 85,
    totalScans: 112,
    joinedDate: "2025-08-01",
    followers: 278,
    following: 73,
  },
  {
    id: "user-009",
    username: "earth.emma",
    avatar: "🌍",
    bio: "Teaching my kids to read labels. Clean living is a family affair.",
    crunchyScore: 76,
    totalScans: 198,
    joinedDate: "2025-06-15",
    followers: 456,
    following: 201,
  },
  {
    id: "user-010",
    username: "bloom.bea",
    avatar: "🌼",
    bio: "New to the crunchy world! Learning and sharing as I go.",
    crunchyScore: 42,
    totalScans: 34,
    joinedDate: "2026-01-15",
    followers: 67,
    following: 189,
  },
];

export const TRENDING_HASHTAGS = [
  "#CleanLiving",
  "#CrunchyLife",
  "#DIYSkincare",
  "#ToxinFree",
  "#GreenBeauty",
  "#NaturalHome",
  "#CleanSwap",
  "#EcoFriendly",
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-001",
    userId: "user-001",
    username: "sage.mama",
    avatar: "🌿",
    timestamp: "2026-03-04T10:30:00Z",
    content:
      "Just made my own all-purpose cleaner with vinegar and citrus peels! Smells amazing and works better than the store-bought stuff. So satisfying knowing exactly what's in it.",
    hashtags: ["#CleanLiving", "#DIYCleaner", "#ToxinFree"],
    likes: 42,
    postType: "tip",
    comments: [
      {
        id: "comment-001",
        userId: "user-003",
        username: "eco.elle",
        avatar: "🌸",
        content: "How long do you let the peels soak? I want to try this!",
        timestamp: "2026-03-04T11:15:00Z",
        likes: 5,
      },
      {
        id: "comment-002",
        userId: "user-001",
        username: "sage.mama",
        avatar: "🌿",
        content:
          "About 2 weeks! The longer the better. I use orange and lemon peels together.",
        timestamp: "2026-03-04T11:45:00Z",
        likes: 8,
      },
    ],
  },
  {
    id: "post-002",
    userId: "user-002",
    username: "crunchy.claire",
    avatar: "🍃",
    timestamp: "2026-03-04T09:15:00Z",
    content:
      "Scanned my favorite shampoo today and it came back as AVOID. I'm devastated but also grateful. Time to find a clean alternative. Any recommendations for curly hair?",
    hashtags: ["#CleanSwap", "#CurlyHair", "#CrunchyLife"],
    likes: 67,
    postType: "question",
    comments: [
      {
        id: "comment-003",
        userId: "user-005",
        username: "natural.nina",
        avatar: "🌻",
        content:
          "Innersense is amazing for curly hair! Their Hydrating Cream is my holy grail.",
        timestamp: "2026-03-04T09:45:00Z",
        likes: 12,
      },
    ],
  },
  {
    id: "post-003",
    userId: "user-003",
    username: "eco.elle",
    avatar: "🌸",
    timestamp: "2026-03-04T08:00:00Z",
    content:
      "Morning routine check: oil cleanse with jojoba, rose water toner, and homemade moisturizer. My skin has never been happier since going clean. 3 months in and no turning back!",
    image: "🧴",
    hashtags: ["#GreenBeauty", "#DIYSkincare", "#CleanLiving"],
    likes: 89,
    postType: "review",
    comments: [
      {
        id: "comment-004",
        userId: "user-006",
        username: "wellness.wren",
        avatar: "🕊️",
        content: "Your skin must be glowing! I need to try oil cleansing.",
        timestamp: "2026-03-04T08:30:00Z",
        likes: 3,
      },
      {
        id: "comment-005",
        userId: "user-003",
        username: "eco.elle",
        avatar: "🌸",
        content:
          "It really is! Start slow though, your skin needs time to adjust.",
        timestamp: "2026-03-04T09:00:00Z",
        likes: 6,
      },
    ],
  },
  {
    id: "post-004",
    userId: "user-004",
    username: "green.goddess",
    avatar: "🌱",
    timestamp: "2026-03-03T20:30:00Z",
    content:
      "Just scored my Crunchy Score: 78/100 Thriving! Not bad for someone who started this journey 6 months ago. When I first took the quiz I was at 34.",
    hashtags: ["#CrunchyLife", "#CrunchyScore", "#Progress"],
    likes: 124,
    postType: "general",
    comments: [
      {
        id: "comment-006",
        userId: "user-002",
        username: "crunchy.claire",
        avatar: "🍃",
        content: "That's incredible growth! What changes made the biggest difference?",
        timestamp: "2026-03-03T21:00:00Z",
        likes: 7,
      },
      {
        id: "comment-007",
        userId: "user-004",
        username: "green.goddess",
        avatar: "🌱",
        content:
          "Switching to natural cleaning products was the easiest win. Then I tackled skincare. Food was the hardest but worth it!",
        timestamp: "2026-03-03T21:30:00Z",
        likes: 15,
      },
    ],
  },
  {
    id: "post-005",
    userId: "user-005",
    username: "natural.nina",
    avatar: "🌻",
    timestamp: "2026-03-03T18:00:00Z",
    content:
      "Made the honey oat face mask from the DIY recipes section and wow. My pores look so much smaller and my skin feels like butter. Took all of 5 minutes!",
    image: "🍯",
    hashtags: ["#DIYSkincare", "#NaturalBeauty", "#FaceMask"],
    likes: 56,
    postType: "recipe",
    comments: [],
  },
  {
    id: "post-006",
    userId: "user-006",
    username: "wellness.wren",
    avatar: "🕊️",
    timestamp: "2026-03-03T15:45:00Z",
    content:
      "Hot take: you don't need 10 products in your skincare routine. I've simplified to 3 clean products and my skin has never been better. Less is more!",
    hashtags: ["#GreenBeauty", "#Minimalism", "#CleanLiving"],
    likes: 201,
    postType: "tip",
    comments: [
      {
        id: "comment-008",
        userId: "user-007",
        username: "pure.poppy",
        avatar: "🌺",
        content:
          "YES. I went from 12 products to 4 and saved so much money too.",
        timestamp: "2026-03-03T16:15:00Z",
        likes: 23,
      },
    ],
  },
  {
    id: "post-007",
    userId: "user-007",
    username: "pure.poppy",
    avatar: "🌺",
    timestamp: "2026-03-03T12:00:00Z",
    content:
      "Replaced all my Tupperware with glass containers this weekend. No more microwaving plastic! It feels like such a small change but these little swaps add up.",
    hashtags: ["#ToxinFree", "#NaturalHome", "#CleanSwap"],
    likes: 78,
    postType: "tip",
    comments: [
      {
        id: "comment-009",
        userId: "user-001",
        username: "sage.mama",
        avatar: "🌿",
        content:
          "Great swap! I did this last year and never looked back. Check thrift stores for cheap glass containers.",
        timestamp: "2026-03-03T12:30:00Z",
        likes: 9,
      },
    ],
  },
  {
    id: "post-008",
    userId: "user-008",
    username: "rootedrose",
    avatar: "🌹",
    timestamp: "2026-03-03T09:00:00Z",
    content:
      "Friendly reminder to check your deodorant ingredients! I scanned mine and found aluminum compounds and synthetic fragrances. Switched to a clean brand and no issues at all.",
    hashtags: ["#CleanSwap", "#CrunchyLife", "#ToxinFree"],
    likes: 93,
    postType: "review",
    comments: [
      {
        id: "comment-010",
        userId: "user-009",
        username: "earth.emma",
        avatar: "🌍",
        content: "Which brand did you switch to? I've been looking for one that actually works.",
        timestamp: "2026-03-03T09:30:00Z",
        likes: 4,
      },
    ],
  },
  {
    id: "post-009",
    userId: "user-009",
    username: "earth.emma",
    avatar: "🌍",
    timestamp: "2026-03-02T22:00:00Z",
    content:
      "Took my daughter grocery shopping and she scanned every single item with Crunchy. She's 8 and now she's pickier about ingredients than I am. Starting them young!",
    hashtags: ["#CrunchyLife", "#EcoFriendly", "#CleanLiving"],
    likes: 167,
    postType: "general",
    comments: [
      {
        id: "comment-011",
        userId: "user-004",
        username: "green.goddess",
        avatar: "🌱",
        content:
          "This is the sweetest thing! She's going to grow up with such good habits.",
        timestamp: "2026-03-02T22:30:00Z",
        likes: 18,
      },
      {
        id: "comment-012",
        userId: "user-006",
        username: "wellness.wren",
        avatar: "🕊️",
        content: "We need a kids version of the Crunchy Score quiz!",
        timestamp: "2026-03-02T23:00:00Z",
        likes: 25,
      },
    ],
  },
  {
    id: "post-010",
    userId: "user-010",
    username: "bloom.bea",
    avatar: "🌼",
    timestamp: "2026-03-02T19:30:00Z",
    content:
      "Just finished my first DIY laundry detergent! Used washing soda, castile soap, and lavender essential oil. Clothes are clean, fresh, and I know exactly what touched my skin.",
    image: "🧺",
    hashtags: ["#DIYCleaner", "#NaturalHome", "#ToxinFree"],
    likes: 45,
    postType: "recipe",
    comments: [],
  },
  {
    id: "post-011",
    userId: "user-001",
    username: "sage.mama",
    avatar: "🌿",
    timestamp: "2026-03-02T14:00:00Z",
    content:
      "PSA: Just because something says 'natural' on the label doesn't mean it actually is. Always scan and check the ingredients list. Marketing can be so misleading!",
    hashtags: ["#CleanLiving", "#Greenwashing", "#CrunchyLife"],
    likes: 234,
    postType: "tip",
    comments: [
      {
        id: "comment-013",
        userId: "user-008",
        username: "rootedrose",
        avatar: "🌹",
        content:
          "SO true. I found parabens in a 'natural' face wash last week. Crunchy caught it instantly.",
        timestamp: "2026-03-02T14:30:00Z",
        likes: 31,
      },
    ],
  },
  {
    id: "post-012",
    userId: "user-005",
    username: "natural.nina",
    avatar: "🌻",
    timestamp: "2026-03-02T11:00:00Z",
    content:
      "Meal prep Sunday with all organic ingredients! Made overnight oats, veggie wraps, and a big batch of bone broth. Clean eating doesn't have to be expensive if you plan ahead.",
    image: "🥗",
    hashtags: ["#CleanLiving", "#MealPrep", "#EcoFriendly"],
    likes: 88,
    postType: "tip",
    comments: [],
  },
  {
    id: "post-013",
    userId: "user-003",
    username: "eco.elle",
    avatar: "🌸",
    timestamp: "2026-03-01T20:00:00Z",
    content:
      "One month of tracking my clean swaps: replaced 14 products with clean alternatives and 3 DIY versions. My bathroom looks so different now and I feel so much better about what I'm putting on my body.",
    hashtags: ["#CleanSwap", "#CrunchyLife", "#Progress"],
    likes: 156,
    postType: "general",
    comments: [
      {
        id: "comment-014",
        userId: "user-010",
        username: "bloom.bea",
        avatar: "🌼",
        content: "What was the hardest product to find a clean replacement for?",
        timestamp: "2026-03-01T20:30:00Z",
        likes: 6,
      },
      {
        id: "comment-015",
        userId: "user-003",
        username: "eco.elle",
        avatar: "🌸",
        content:
          "Definitely mascara! Most clean options didn't perform well. But I finally found one I love.",
        timestamp: "2026-03-01T21:00:00Z",
        likes: 11,
      },
    ],
  },
  {
    id: "post-014",
    userId: "user-007",
    username: "pure.poppy",
    avatar: "🌺",
    timestamp: "2026-03-01T16:00:00Z",
    content:
      "Does anyone else get overwhelmed when they first start scanning everything? I went through my whole kitchen yesterday and half my pantry got flagged. Remember: progress, not perfection!",
    hashtags: ["#CrunchyLife", "#CleanLiving", "#Progress"],
    likes: 112,
    postType: "question",
    comments: [
      {
        id: "comment-016",
        userId: "user-009",
        username: "earth.emma",
        avatar: "🌍",
        content:
          "I felt the same way! Just swap things out as they run out. No need to throw everything away at once.",
        timestamp: "2026-03-01T16:45:00Z",
        likes: 19,
      },
    ],
  },
  {
    id: "post-015",
    userId: "user-008",
    username: "rootedrose",
    avatar: "🌹",
    timestamp: "2026-03-01T10:00:00Z",
    content:
      "Started making my own toothpaste with coconut oil, baking soda, and peppermint oil. Week 2 update: teeth feel just as clean and my dentist actually said my gums look healthier!",
    hashtags: ["#DIYSkincare", "#ToxinFree", "#NaturalHome"],
    likes: 73,
    postType: "recipe",
    comments: [
      {
        id: "comment-017",
        userId: "user-002",
        username: "crunchy.claire",
        avatar: "🍃",
        content:
          "Is the baking soda harsh on enamel? I've heard mixed things.",
        timestamp: "2026-03-01T10:30:00Z",
        likes: 8,
      },
      {
        id: "comment-018",
        userId: "user-008",
        username: "rootedrose",
        avatar: "🌹",
        content:
          "My dentist said it's fine in small amounts. Just don't overdo it and brush gently!",
        timestamp: "2026-03-01T11:00:00Z",
        likes: 5,
      },
    ],
  },
];

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
