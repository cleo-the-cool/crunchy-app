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
    id: "list-001",
    userId: "user-001",
    title: "My Clean Skincare Routine",
    description:
      "All the products I use daily for my morning and evening skincare routine. 100% clean ingredients.",
    category: "skincare",
    isPublic: true,
    products: [
      { id: "lp-001", name: "Gentle Skin Cleanser", brand: "CeraVe", rating: "clean", image: "🧴", addedAt: "2026-03-01" },
      { id: "lp-002", name: "Rose Water Toner", brand: "Heritage Store", rating: "clean", image: "🌹", addedAt: "2026-03-01" },
      { id: "lp-003", name: "Jojoba Oil Moisturizer", brand: "Desert Essence", rating: "clean", image: "🫧", addedAt: "2026-03-02" },
      { id: "lp-004", name: "Mineral Sunscreen SPF 30", brand: "Badger", rating: "clean", image: "☀️", addedAt: "2026-03-02" },
    ],
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "list-002",
    userId: "user-003",
    title: "Clean Grocery Staples",
    description:
      "My go-to clean grocery items. All organic or minimally processed.",
    category: "grocery",
    isPublic: true,
    products: [
      { id: "lp-005", name: "Organic Extra Virgin Olive Oil", brand: "California Olive Ranch", rating: "clean", image: "🫒", addedAt: "2026-02-28" },
      { id: "lp-006", name: "Raw Honey", brand: "Nature Nate's", rating: "clean", image: "🍯", addedAt: "2026-02-28" },
      { id: "lp-007", name: "Organic Almond Butter", brand: "Justin's", rating: "clean", image: "🥜", addedAt: "2026-02-28" },
      { id: "lp-008", name: "Coconut Aminos", brand: "Coconut Secret", rating: "clean", image: "🥥", addedAt: "2026-03-01" },
      { id: "lp-009", name: "Organic Bone Broth", brand: "Kettle & Fire", rating: "clean", image: "🍲", addedAt: "2026-03-01" },
    ],
    createdAt: "2026-02-28T12:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "list-003",
    userId: "user-004",
    title: "Non-Toxic Cleaning Cabinet",
    description:
      "Every cleaning product under my sink is now clean and safe. Here is what I use.",
    category: "cleaning",
    isPublic: true,
    products: [
      { id: "lp-010", name: "All-Purpose Cleaner", brand: "Branch Basics", rating: "clean", image: "🧽", addedAt: "2026-02-25" },
      { id: "lp-011", name: "Dish Soap", brand: "Dr. Bronner's", rating: "clean", image: "🫧", addedAt: "2026-02-25" },
      { id: "lp-012", name: "Laundry Detergent", brand: "Molly's Suds", rating: "clean", image: "🧺", addedAt: "2026-02-26" },
      { id: "lp-013", name: "Glass Cleaner", brand: "Aunt Fannie's", rating: "clean", image: "✨", addedAt: "2026-02-27" },
    ],
    createdAt: "2026-02-25T14:00:00Z",
    updatedAt: "2026-02-27T16:00:00Z",
  },
  {
    id: "list-004",
    userId: "user-006",
    title: "Minimalist Essentials",
    description:
      "Less is more. These are the only 5 products I use for everything.",
    category: "wellness",
    isPublic: true,
    products: [
      { id: "lp-014", name: "Castile Soap", brand: "Dr. Bronner's", rating: "clean", image: "🧼", addedAt: "2026-03-01" },
      { id: "lp-015", name: "Coconut Oil", brand: "Nutiva", rating: "clean", image: "🥥", addedAt: "2026-03-01" },
      { id: "lp-016", name: "Apple Cider Vinegar", brand: "Bragg", rating: "clean", image: "🍎", addedAt: "2026-03-01" },
      { id: "lp-017", name: "Shea Butter", brand: "Sky Organics", rating: "clean", image: "🧈", addedAt: "2026-03-02" },
      { id: "lp-018", name: "Tea Tree Oil", brand: "Plant Therapy", rating: "clean", image: "🌿", addedAt: "2026-03-02" },
    ],
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-02T11:00:00Z",
  },
  {
    id: "list-005",
    userId: "user-009",
    title: "Baby-Safe Products",
    description:
      "Everything I trust for my little ones. Scanned and verified clean.",
    category: "baby",
    isPublic: true,
    products: [
      { id: "lp-019", name: "Baby Wash & Shampoo", brand: "Burt's Bees Baby", rating: "clean", image: "🛁", addedAt: "2026-02-20" },
      { id: "lp-020", name: "Diaper Cream", brand: "Earth Mama", rating: "clean", image: "👶", addedAt: "2026-02-20" },
      { id: "lp-021", name: "Baby Lotion", brand: "Pipette", rating: "clean", image: "🧴", addedAt: "2026-02-21" },
    ],
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-02-21T08:00:00Z",
  },
  {
    id: "list-006",
    userId: "user-001",
    title: "Products to Avoid",
    description: "My personal blacklist of products with harmful ingredients.",
    category: "general",
    isPublic: false,
    products: [
      { id: "lp-022", name: "Classic Shampoo", brand: "Head & Shoulders", rating: "avoid", image: "🚫", addedAt: "2026-03-03" },
      { id: "lp-023", name: "Multi-Purpose Cleaner", brand: "Fabuloso", rating: "avoid", image: "⚠️", addedAt: "2026-03-03" },
    ],
    createdAt: "2026-03-03T18:00:00Z",
    updatedAt: "2026-03-03T18:00:00Z",
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
