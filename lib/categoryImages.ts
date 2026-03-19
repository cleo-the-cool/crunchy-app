/**
 * Maps category strings to aesthetic background images.
 * Use with ImageBackground for category tiles/cards.
 */

export const CATEGORY_IMAGES: Record<string, any> = {
  food: require("@/assets/images/aesthetic/food-cheeseboard.jpg"),
  drinks: require("@/assets/images/aesthetic/drinks-tea.jpg"),
  skincare: require("@/assets/images/aesthetic/skincare-serums.jpg"),
  makeup: require("@/assets/images/aesthetic/makeup-beauty.jpg"),
  cleaning: require("@/assets/images/aesthetic/cleaning-natural.jpg"),
  clothing: require("@/assets/images/aesthetic/clothing-linen.jpg"),
  home: require("@/assets/images/aesthetic/home-interior.jpg"),
  baby: require("@/assets/images/aesthetic/baby-natural.jpg"),
  wellness: require("@/assets/images/aesthetic/wellness-herbs.jpg"),
  other: require("@/assets/images/aesthetic/botanical.jpg"),
};

const DEFAULT_IMAGE = require("@/assets/images/aesthetic/botanical.jpg");

/**
 * Get the background image for a category string.
 * Normalizes the input to match known categories.
 */
export function getCategoryImage(category?: string): any {
  if (!category) return DEFAULT_IMAGE;
  const lower = category.toLowerCase();

  // Direct match
  if (CATEGORY_IMAGES[lower]) return CATEGORY_IMAGES[lower];

  // Fuzzy match
  if (lower.includes("food") || lower.includes("cooking")) return CATEGORY_IMAGES.food;
  if (lower.includes("drink") || lower.includes("beverage")) return CATEGORY_IMAGES.drinks;
  if (lower.includes("skin") || lower.includes("personal care")) return CATEGORY_IMAGES.skincare;
  if (lower.includes("makeup") || lower.includes("cosmetic") || lower.includes("beauty")) return CATEGORY_IMAGES.makeup;
  if (lower.includes("clean")) return CATEGORY_IMAGES.cleaning;
  if (lower.includes("cloth") || lower.includes("fashion") || lower.includes("textile") || lower.includes("linen")) return CATEGORY_IMAGES.clothing;
  if (lower.includes("home") || lower.includes("interior") || lower.includes("furniture")) return CATEGORY_IMAGES.home;
  if (lower.includes("baby") || lower.includes("infant")) return CATEGORY_IMAGES.baby;
  if (lower.includes("wellness") || lower.includes("herb") || lower.includes("supplement")) return CATEGORY_IMAGES.wellness;

  return DEFAULT_IMAGE;
}
