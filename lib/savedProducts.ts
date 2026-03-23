import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "./supabase";

const SAVED_PRODUCTS_KEY = "@crunchy_saved_products";

// Derive rating from score - never trust Gemini's rating directly
export function getRatingFromScore(score: number): "clean" | "caution" | "avoid" {
  if (score >= 80) return "clean";
  if (score >= 60) return "caution";
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

// --- Local storage helpers ---

async function getLocalSaved(): Promise<SavedProduct[]> {
  try {
    const val = await AsyncStorage.getItem(SAVED_PRODUCTS_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

async function setLocalSaved(products: SavedProduct[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(products));
}

// --- Supabase helpers ---

function mapRowToSavedProduct(row: any): SavedProduct {
  return {
    id: row.id,
    name: row.name || "Unknown",
    brand: row.brand || undefined,
    barcode: row.gemini_analysis?.barcode || undefined,
    rating: row.overall_score != null ? getRatingFromScore(row.overall_score) : undefined,
    category: row.category || undefined,
    scanData: row.gemini_analysis || undefined,
    savedAt: row.saved_at || row.created_at || new Date().toISOString(),
  };
}

// --- Public API ---

export async function getSavedProducts(userId?: string): Promise<SavedProduct[]> {
  // Try Supabase first
  if (isSupabaseConfigured() && userId) {
    try {
      // We'll use a user_saved_products approach - store saved product IDs locally
      // and fetch product details from Supabase products table
      const { data, error } = await supabase
        .from("saved_products")
        .select("*, product:products(*)")
        .eq("user_id", userId)
        .order("saved_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const products = data.map((row: any) => {
          if (row.product) {
            return {
              ...mapRowToSavedProduct(row.product),
              savedAt: row.saved_at || row.created_at,
            };
          }
          // Fallback: product data stored directly
          return {
            id: row.product_id || row.id,
            name: row.product_name || "Unknown",
            brand: row.product_brand || undefined,
            category: row.product_category || undefined,
            rating: row.product_score != null ? getRatingFromScore(row.product_score) : undefined,
            scanData: row.product_scan_data || undefined,
            savedAt: row.saved_at || row.created_at || new Date().toISOString(),
          };
        });
        // Update local cache
        await setLocalSaved(products);
        return products;
      }
    } catch {
      // Fall through to local
    }
  }

  return getLocalSaved();
}

export async function saveProduct(product: SavedProduct, userId?: string): Promise<void> {
  // Always save to local storage
  const saved = await getLocalSaved();
  const exists = saved.some(
    (p) => p.id === product.id || (p.barcode && p.barcode === product.barcode)
  );
  if (!exists) {
    saved.unshift(product);
    await setLocalSaved(saved);
  }

  // Also save to Supabase
  if (isSupabaseConfigured() && userId) {
    try {
      // First upsert the product into products table
      const score = product.scanData?.crunchyScore;
      const ingredientNames = (product.scanData?.ingredients || []).map((i: any) => i.name);

      const { data: existingProduct } = await supabase
        .from("products")
        .select("id")
        .eq("name", product.name)
        .eq("brand", product.brand || "")
        .limit(1)
        .single();

      let productId = existingProduct?.id;

      if (!productId) {
        const { data: newProduct } = await supabase
          .from("products")
          .insert({
            name: product.name,
            brand: product.brand || null,
            category: product.category || "Other",
            ingredients: ingredientNames,
            overall_score: score || null,
            gemini_analysis: product.scanData || null,
            scan_count: 1,
          })
          .select("id")
          .single();
        productId = newProduct?.id;
      }

      // Save to saved_products junction table
      if (productId) {
        await supabase.from("saved_products").upsert({
          user_id: userId,
          product_id: productId,
          saved_at: product.savedAt || new Date().toISOString(),
        }, { onConflict: "user_id,product_id" });
      }
    } catch {
      // Supabase failed - local storage is the fallback
    }
  }
}

export async function unsaveProduct(productId: string, userId?: string): Promise<void> {
  // Remove from local storage
  const saved = await getLocalSaved();
  const filtered = saved.filter((p) => p.id !== productId);
  await setLocalSaved(filtered);

  // Also remove from Supabase
  if (isSupabaseConfigured() && userId) {
    try {
      await supabase
        .from("saved_products")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
    } catch {
      // ignore
    }
  }
}

export async function isProductSaved(productId: string): Promise<boolean> {
  const saved = await getLocalSaved();
  return saved.some((p) => p.id === productId);
}
