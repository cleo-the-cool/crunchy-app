import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_PRODUCTS_KEY = "@crunchy_saved_products";

// Derive rating from score - never trust Gemini's rating directly
export function getRatingFromScore(score: number): "clean" | "caution" | "avoid" {
  if (score >= 70) return "clean";
  if (score >= 40) return "caution";
  return "avoid";
}

export interface SavedProduct {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  rating?: "clean" | "caution" | "avoid";
  image?: string;
  category?: string;
  scanData?: any;
  savedAt: string;
}

export async function getSavedProducts(): Promise<SavedProduct[]> {
  try {
    const val = await AsyncStorage.getItem(SAVED_PRODUCTS_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function saveProduct(product: SavedProduct): Promise<void> {
  const saved = await getSavedProducts();
  // Avoid duplicates by id or barcode
  const exists = saved.some(
    (p) => p.id === product.id || (p.barcode && p.barcode === product.barcode)
  );
  if (!exists) {
    saved.unshift(product);
    await AsyncStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(saved));
  }
}

export async function unsaveProduct(productId: string): Promise<void> {
  const saved = await getSavedProducts();
  const filtered = saved.filter((p) => p.id !== productId);
  await AsyncStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(filtered));
}

export async function isProductSaved(productId: string): Promise<boolean> {
  const saved = await getSavedProducts();
  return saved.some((p) => p.id === productId);
}
