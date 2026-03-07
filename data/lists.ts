import { COMMUNITY_USERS, type CommunityUser } from "./community";
import { type Rating } from "./products";

export type ListCategory =
  | "skincare"
  | "grocery"
  | "cleaning"
  | "baby"
  | "general"
  | "wellness";

export const LIST_CATEGORY_CONFIG: Record<
  ListCategory,
  { label: string; emoji: string; color: string }
> = {
  skincare: { label: "Skincare Routine", emoji: "🧴", color: "#E8B4CB" },
  grocery: { label: "Grocery List", emoji: "🛒", color: "#8B9E7C" },
  cleaning: { label: "Cleaning Supplies", emoji: "🧹", color: "#5C9CE6" },
  baby: { label: "Baby Products", emoji: "👶", color: "#FFC107" },
  general: { label: "General", emoji: "📋", color: "#F4A574" },
  wellness: { label: "Wellness", emoji: "🌿", color: "#4CAF50" },
};

export interface ListProduct {
  id: string;
  name: string;
  brand: string;
  rating: Rating;
  image: string;
  addedAt: string;
}

export interface ProductList {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ListCategory;
  isPublic: boolean;
  products: ListProduct[];
  createdAt: string;
  updatedAt: string;
}

export const MOCK_LISTS: ProductList[] = [
  {
    id: "list-pub-1",
    userId: "user-2",
    title: "My Clean Skincare Routine",
    description:
      "Everything I use morning and night. All clean-rated products that actually work.",
    category: "skincare",
    isPublic: true,
    products: [
      { id: "p1", name: "Gentle Skin Cleanser", brand: "Cetaphil", rating: "caution", image: "🧴", addedAt: "2026-02-10T10:00:00Z" },
      { id: "p32", name: "Face Serum", brand: "The Ordinary", rating: "clean", image: "💧", addedAt: "2026-02-10T10:01:00Z" },
      { id: "p9", name: "Sunscreen SPF 50", brand: "Banana Boat", rating: "caution", image: "☀️", addedAt: "2026-02-10T10:02:00Z" },
      { id: "p14", name: "Lip Balm", brand: "EOS", rating: "caution", image: "👄", addedAt: "2026-02-10T10:03:00Z" },
    ],
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-01T14:30:00Z",
  },
  {
    id: "list-pub-2",
    userId: "user-1",
    title: "Non-Toxic Cleaning Essentials",
    description:
      "Swapped out all the harsh chemicals. Here are my go-to clean alternatives.",
    category: "cleaning",
    isPublic: true,
    products: [
      { id: "p2", name: "Pure-Castile Liquid Soap", brand: "Dr. Bronner's", rating: "clean", image: "🧼", addedAt: "2026-01-15T09:00:00Z" },
      { id: "p13", name: "Hand Soap Refill", brand: "Method", rating: "clean", image: "🫧", addedAt: "2026-01-15T09:01:00Z" },
      { id: "p11", name: "Dish Soap", brand: "Dawn", rating: "caution", image: "🍽️", addedAt: "2026-01-15T09:02:00Z" },
    ],
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-02-20T11:00:00Z",
  },
  {
    id: "list-pub-3",
    userId: "user-4",
    title: "Clean Pantry Staples",
    description:
      "Building a cleaner pantry one swap at a time. These are the items I always keep stocked.",
    category: "grocery",
    isPublic: true,
    products: [
      { id: "p17", name: "Sparkling Water", brand: "LaCroix", rating: "clean", image: "💧", addedAt: "2026-02-01T08:00:00Z" },
      { id: "p28", name: "Almond Butter", brand: "Justin's", rating: "clean", image: "🥜", addedAt: "2026-02-01T08:01:00Z" },
      { id: "p29", name: "Green Tea", brand: "Yogi Tea", rating: "clean", image: "🍵", addedAt: "2026-02-01T08:02:00Z" },
      { id: "p16", name: "Protein Bar", brand: "Clif Bar", rating: "caution", image: "🍫", addedAt: "2026-02-01T08:03:00Z" },
    ],
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-02-28T16:45:00Z",
  },
  {
    id: "list-pub-4",
    userId: "user-5",
    title: "Baby-Safe Products",
    description:
      "Everything I trust for my little one. Researched every ingredient.",
    category: "baby",
    isPublic: true,
    products: [
      { id: "p6", name: "Baby Shampoo", brand: "Johnson's", rating: "caution", image: "👶", addedAt: "2026-01-20T12:00:00Z" },
      { id: "p2", name: "Pure-Castile Liquid Soap", brand: "Dr. Bronner's", rating: "clean", image: "🧼", addedAt: "2026-01-20T12:01:00Z" },
      { id: "p4", name: "Moisturizing Body Lotion", brand: "Jergens", rating: "caution", image: "🧴", addedAt: "2026-01-20T12:02:00Z" },
    ],
    createdAt: "2026-01-20T12:00:00Z",
    updatedAt: "2026-03-02T09:15:00Z",
  },
  {
    id: "list-pub-5",
    userId: "user-3",
    title: "Wellness Starter Kit",
    description:
      "Just getting started with cleaner living. These are easy first swaps anyone can make.",
    category: "wellness",
    isPublic: true,
    products: [
      { id: "p2", name: "Pure-Castile Liquid Soap", brand: "Dr. Bronner's", rating: "clean", image: "🧼", addedAt: "2026-02-15T15:00:00Z" },
      { id: "p32", name: "Face Serum", brand: "The Ordinary", rating: "clean", image: "💧", addedAt: "2026-02-15T15:01:00Z" },
      { id: "p17", name: "Sparkling Water", brand: "LaCroix", rating: "clean", image: "💧", addedAt: "2026-02-15T15:02:00Z" },
      { id: "p29", name: "Green Tea", brand: "Yogi Tea", rating: "clean", image: "🍵", addedAt: "2026-02-15T15:03:00Z" },
      { id: "p13", name: "Hand Soap Refill", brand: "Method", rating: "clean", image: "🫧", addedAt: "2026-02-15T15:04:00Z" },
    ],
    createdAt: "2026-02-15T15:00:00Z",
    updatedAt: "2026-03-04T18:20:00Z",
  },
];

export function getPublicLists(): ProductList[] {
  return MOCK_LISTS.filter((l) => l.isPublic);
}

export function getListsByUserId(userId: string): ProductList[] {
  return MOCK_LISTS.filter((l) => l.userId === userId);
}

export function getListById(id: string): ProductList | undefined {
  return MOCK_LISTS.find((l) => l.id === id);
}

export function searchLists(query: string): ProductList[] {
  const q = query.toLowerCase();
  return MOCK_LISTS.filter(
    (l) =>
      l.isPublic &&
      (l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.products.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
        ))
  );
}
