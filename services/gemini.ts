import Constants from "expo-constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ScanMode = "item" | "ingredients" | "label";

export interface GeminiIngredient {
  name: string;
  risk: "safe" | "concern" | "toxic";
  explanation: string;
}

export interface GeminiAnalysis {
  productName: string;
  brand: string;
  category: string;
  rating: "clean" | "caution" | "avoid";
  crunchyScore: number; // 1-100
  ingredients: GeminiIngredient[];
  concerns: string[];
  cleanAlternatives: string[];
  summary: string;
}

const GEMINI_API_KEY =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY ??
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ??
  "";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function isMockMode(): boolean {
  return !GEMINI_API_KEY || GEMINI_API_KEY === "";
}

const SCAN_PROMPTS: Record<ScanMode, string> = {
  item: `You are a clean living product analyst. The user has taken a photo of a product.
Identify the product and analyze it for health and environmental concerns.
Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "productName": "string",
  "brand": "string",
  "category": "string (Skincare, Food, Cleaning, Personal Care, Clothing, Home)",
  "rating": "clean | caution | avoid",
  "crunchyScore": number (1-100, higher = cleaner),
  "ingredients": [{"name": "string", "risk": "safe | concern | toxic", "explanation": "string"}],
  "concerns": ["string"],
  "cleanAlternatives": ["string"],
  "summary": "string (1-2 sentence summary of the analysis)"
}`,

  ingredients: `You are a clean living ingredient analyst. The user has taken a photo of an ingredients list on a product.
Read and analyze every ingredient visible in the photo.
Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "productName": "string (best guess or 'Unknown Product')",
  "brand": "string (best guess or 'Unknown Brand')",
  "category": "string (Skincare, Food, Cleaning, Personal Care, Clothing, Home)",
  "rating": "clean | caution | avoid",
  "crunchyScore": number (1-100, higher = cleaner),
  "ingredients": [{"name": "string", "risk": "safe | concern | toxic", "explanation": "string"}],
  "concerns": ["string"],
  "cleanAlternatives": ["string"],
  "summary": "string (1-2 sentence summary of the analysis)"
}`,

  label: `You are a clean living label analyst. The user has taken a photo of a nutrition or claims label on a product.
Analyze the claims, certifications, and nutritional information visible.
Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "productName": "string (best guess or 'Unknown Product')",
  "brand": "string (best guess or 'Unknown Brand')",
  "category": "string (Skincare, Food, Cleaning, Personal Care, Clothing, Home)",
  "rating": "clean | caution | avoid",
  "crunchyScore": number (1-100, higher = cleaner),
  "ingredients": [{"name": "string", "risk": "safe | concern | toxic", "explanation": "string"}],
  "concerns": ["string"],
  "cleanAlternatives": ["string"],
  "summary": "string (1-2 sentence summary of the analysis)"
}`,
};

// Mock data for when no API key is set
const MOCK_RESULTS: Record<ScanMode, GeminiAnalysis> = {
  item: {
    productName: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Skincare",
    rating: "caution",
    crunchyScore: 42,
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water used as the base solvent. Completely safe." },
      { name: "Cetyl Alcohol", risk: "safe", explanation: "A fatty alcohol from coconut oil. Used as an emollient. Generally safe." },
      { name: "Propylene Glycol", risk: "concern", explanation: "Synthetic humectant. Can cause irritation in sensitive individuals." },
      { name: "Sodium Lauryl Sulfate", risk: "toxic", explanation: "Harsh surfactant that strips natural oils. Known skin irritant." },
      { name: "Methylparaben", risk: "toxic", explanation: "Preservative that mimics estrogen. Potential endocrine disruptor." },
    ],
    concerns: [
      "Contains parabens (potential endocrine disruptors)",
      "Sodium Lauryl Sulfate is a harsh irritant",
      "Propylene Glycol may irritate sensitive skin",
    ],
    cleanAlternatives: [
      "CeraVe Hydrating Cleanser",
      "Weleda Calendula Cleanser",
      "Dr. Bronner's Pure Castile Soap",
    ],
    summary: "This cleanser contains several concerning ingredients including parabens and SLS. Consider switching to a cleaner alternative.",
  },
  ingredients: {
    productName: "Unknown Product",
    brand: "Unknown Brand",
    category: "Personal Care",
    rating: "avoid",
    crunchyScore: 25,
    ingredients: [
      { name: "Aqua", risk: "safe", explanation: "Water base. Completely safe." },
      { name: "Sodium Laureth Sulfate", risk: "concern", explanation: "Milder than SLS but can still cause irritation. Often contaminated with 1,4-dioxane." },
      { name: "Cocamidopropyl Betaine", risk: "safe", explanation: "Derived from coconut oil. Gentle surfactant." },
      { name: "Fragrance/Parfum", risk: "toxic", explanation: "Undisclosed mixture of chemicals. Can contain phthalates and other endocrine disruptors." },
      { name: "DMDM Hydantoin", risk: "toxic", explanation: "Formaldehyde-releasing preservative. Known carcinogen and allergen." },
      { name: "Methylisothiazolinone", risk: "toxic", explanation: "Potent allergen and skin sensitizer. Banned in leave-on products in the EU." },
    ],
    concerns: [
      "Contains formaldehyde releasers",
      "Undisclosed fragrance chemicals",
      "Multiple known allergens",
    ],
    cleanAlternatives: [
      "Everyone 3-in-1 Soap",
      "Attitude Natural Body Wash",
      "Alaffia Everyday Shea Body Wash",
    ],
    summary: "This ingredient list reveals several toxic chemicals including formaldehyde releasers and undisclosed fragrances. Strongly recommend switching.",
  },
  label: {
    productName: "Organic Granola Bar",
    brand: "Nature Valley",
    category: "Food",
    rating: "caution",
    crunchyScore: 55,
    ingredients: [
      { name: "Whole Grain Oats", risk: "safe", explanation: "Whole grain with fiber and nutrients. Good base ingredient." },
      { name: "Sugar", risk: "concern", explanation: "Added sugar. Excessive consumption linked to various health issues." },
      { name: "Canola Oil", risk: "concern", explanation: "Highly processed seed oil. Often extracted with hexane. May contribute to inflammation." },
      { name: "Rice Flour", risk: "safe", explanation: "Simple grain flour. No health concerns." },
      { name: "Honey", risk: "safe", explanation: "Natural sweetener with some beneficial properties." },
      { name: "Natural Flavor", risk: "concern", explanation: "Vague term that can include many processed compounds. Not always truly natural." },
    ],
    concerns: [
      "Contains processed seed oils",
      "Multiple sources of added sugar",
      "Vague 'natural flavor' labeling",
    ],
    cleanAlternatives: [
      "RXBar (minimal ingredients)",
      "Larabar (fruit and nut based)",
      "Homemade granola bars",
    ],
    summary: "While marketed as healthy, this product contains processed oils and multiple sugar sources. The 'natural' claims are somewhat misleading.",
  },
};

function parseGeminiResponse(text: string): GeminiAnalysis {
  // Try to extract JSON from the response (Gemini sometimes wraps in markdown)
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonStr.trim());

  return {
    productName: parsed.productName || "Unknown Product",
    brand: parsed.brand || "Unknown Brand",
    category: parsed.category || "Other",
    rating: parsed.rating || "caution",
    crunchyScore: parsed.crunchyScore || 50,
    ingredients: (parsed.ingredients || []).map(
      (i: { name?: string; risk?: string; explanation?: string }) => ({
        name: i.name || "Unknown",
        risk: i.risk || "concern",
        explanation: i.explanation || "No information available.",
      })
    ),
    concerns: parsed.concerns || [],
    cleanAlternatives: parsed.cleanAlternatives || [],
    summary: parsed.summary || "Analysis complete.",
  };
}

// Map Gemini category strings to Supabase product category enum
function mapToDbCategory(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("food") || lower.includes("cooking")) return "food";
  if (lower.includes("skin") || lower.includes("personal") || lower.includes("cosmetic")) return "cosmetics";
  if (lower.includes("clean")) return "cleaning";
  if (lower.includes("baby")) return "baby";
  if (lower.includes("cloth") || lower.includes("fashion")) return "clothing";
  if (lower.includes("supplement") || lower.includes("vitamin")) return "supplement";
  return "other";
}

// Cache a product analysis in the Supabase products table.
// Returns the product ID (existing or newly created).
async function cacheProduct(analysis: GeminiAnalysis): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    // Check if this product already exists by name + brand
    const { data: existing } = await supabase
      .from("products")
      .select("id, scan_count")
      .eq("name", analysis.productName)
      .eq("brand", analysis.brand)
      .limit(1)
      .single();

    if (existing) {
      // Update scan count and refresh analysis
      await supabase
        .from("products")
        .update({
          gemini_analysis: analysis,
          overall_score: analysis.crunchyScore,
          scan_count: (existing.scan_count ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      return existing.id;
    }

    // Insert new product
    const { data: newProduct } = await supabase
      .from("products")
      .insert({
        name: analysis.productName,
        brand: analysis.brand,
        category: mapToDbCategory(analysis.category),
        ingredients: analysis.ingredients.map((i) => i.name),
        overall_score: analysis.crunchyScore,
        gemini_analysis: analysis,
      })
      .select("id")
      .single();

    return newProduct?.id ?? null;
  } catch {
    // Supabase errors should not block the scan flow
    return null;
  }
}

// Save a scan record to the user's scan history
async function saveScan(
  userId: string,
  productId: string | null,
  mode: ScanMode,
  analysis: GeminiAnalysis
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase.from("scans").insert({
      user_id: userId,
      product_id: productId,
      scan_type: mode,
      gemini_response: analysis,
      score: analysis.crunchyScore,
    });
  } catch {
    // Supabase errors should not block the scan flow
  }
}

// Try to find a cached product by name + brand
async function findCachedProduct(
  name: string,
  brand: string
): Promise<GeminiAnalysis | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data } = await supabase
      .from("products")
      .select("gemini_analysis, scan_count")
      .eq("name", name)
      .eq("brand", brand)
      .limit(1)
      .single();

    if (data?.gemini_analysis) {
      // Increment scan count for cache hit
      await supabase
        .from("products")
        .update({ scan_count: (data.scan_count ?? 0) + 1 })
        .eq("name", name)
        .eq("brand", brand);
      return data.gemini_analysis as GeminiAnalysis;
    }
  } catch {
    // Not found or error, fall through
  }
  return null;
}

export async function analyzeWithGemini(
  base64Image: string,
  mode: ScanMode
): Promise<GeminiAnalysis> {
  if (isMockMode()) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return MOCK_RESULTS[mode];
  }

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SCAN_PROMPTS[mode] },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error("No response from Gemini API");
  }

  return parseGeminiResponse(textContent);
}

// Analyze, cache, and save scan in one call.
// This is the main entry point for scanner screens.
export async function analyzeAndSaveScan(
  base64Image: string,
  mode: ScanMode,
  userId: string | null
): Promise<GeminiAnalysis> {
  const analysis = await analyzeWithGemini(base64Image, mode);

  // Cache product and save scan in background (don't block UI)
  const productId = await cacheProduct(analysis);
  if (userId) {
    await saveScan(userId, productId, mode, analysis);
  }

  return analysis;
}

export { isMockMode, findCachedProduct };
