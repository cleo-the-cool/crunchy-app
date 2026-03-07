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

export const MOCK_LISTS: ProductList[] = [];

export function getPublicLists(): ProductList[] {
  return MOCK_LISTS.filter((l) => l.isPublic);
}

export function getListsByUserId(userId: string): ProductList[] {
  return MOCK_LISTS.filter((l) => l.userId === userId);
}

export function getListById(id: string): ProductList | undefined {
  return MOCK_LISTS.find((l) => l.id === id);
}

export function getListOwner(list: ProductList): CommunityUser | undefined {
  return COMMUNITY_USERS.find((u) => u.id === list.userId);
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
