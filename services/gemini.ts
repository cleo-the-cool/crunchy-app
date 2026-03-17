import Constants from "expo-constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ScanMode = "item" | "ingredients" | "label" | "barcode";

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

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function isMockMode(): boolean {
  return !GEMINI_API_KEY || GEMINI_API_KEY === "";
}

// Daily scan limit to prevent runaway API charges
const DAILY_SCAN_LIMIT = 50; // max 50 scans per day per device
const SCAN_COUNT_KEY = "@crunchy_daily_scan_count";

async function checkDailyLimit(): Promise<boolean> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const stored = await AsyncStorage.getItem(SCAN_COUNT_KEY);
    if (stored) {
      const { count, date } = JSON.parse(stored);
      const today = new Date().toISOString().split("T")[0];
      if (date === today) {
        return count < DAILY_SCAN_LIMIT;
      }
    }
    return true;
  } catch {
    return true;
  }
}

async function incrementDailyCount(): Promise<void> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem(SCAN_COUNT_KEY);
    let count = 1;
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) count = data.count + 1;
    }
    await AsyncStorage.setItem(SCAN_COUNT_KEY, JSON.stringify({ count, date: today }));
  } catch {}
}

const SCORE_CALIBRATION = `
Score calibration (1-100, be strict and realistic):
- 90-100: Truly clean/organic/certified safe, minimal processing, verified safe materials
- 70-89: Mostly clean with minor concerns
- 50-69: Moderate concerns, some questionable ingredients or materials
- 30-49: Significant concerns, multiple problematic ingredients
- 1-29: Major toxicity/health risks
Do NOT default to high scores. A stainless steel water bottle should NOT score 90+ unless verified 18/8 or 18/10 grade.`;

const PRODUCT_TYPES = `This covers ALL product types: food, drinks, cosmetics, skincare, cleaning products, clothing/textiles, water bottles, drinkware, cookware, furniture, baby products, supplements, accessories, and more.

CRITICAL INSTRUCTIONS FOR PRODUCT IDENTIFICATION:
1. IDENTIFY the exact product and brand from the image. Read any visible text, logos, labels, packaging design.
2. Once identified, use your KNOWLEDGE BASE to look up the product's REAL ingredients, materials, and composition. Do NOT say you "don't have access" to ingredients. You are an AI with extensive product knowledge. Look it up.
3. If you recognize the brand/product (e.g. "Owala FreeSip", "Tide Pods", "Zara dress"), use your knowledge of that product's actual materials and ingredients.
4. If you can't identify the exact product, identify the type and analyze based on what's visible + typical composition for that product category.
5. For the "ingredients" array, list ACTUAL ingredients or materials, not vague categories like "Plant-based Surfactants". Be specific: "Sodium Lauryl Sulfate", "Polyester (PET)", "18/8 Stainless Steel", etc.
6. NEVER say the ingredient list "is not visible" or you "don't have access." Instead, use your knowledge to provide the real ingredient/material list for the identified product.`;

const MATERIAL_ANALYSIS = `For non-food items, analyze materials in depth using your product knowledge:
- Stainless steel: grade matters (304/18-8 and 316/18-10 are safe; 201 has high nickel/manganese risk). Look up the actual grade used by the brand.
- Plastics: check for BPA, BPS, phthalates, microplastic shedding risk. Identify the plastic type (PP, Tritan, HDPE, etc.)
- Ceramics/glass: check for lead and cadmium in glazes
- Textiles/clothing: identify exact fabric composition (e.g. "65% polyester, 35% cotton"), check for formaldehyde, PFAS, azo dyes, heavy metals in dyes, microplastic shedding from synthetics
- Cookware: check coatings (PTFE/Teflon, ceramic), heavy metal leaching
- Drinkware: identify exact materials for each component (lid, body, straw, seal). Check for BPA in plastics, lead in paint/coating.
For known brands, USE YOUR KNOWLEDGE of their actual materials and manufacturing processes.`;

const JSON_SCHEMA = `{
  "productName": "string",
  "brand": "string",
  "category": "string (Food, Drinks, Skincare, Makeup, Cleaning, Personal Care, Clothing, Home, Baby, Cookware, Drinkware, Other)",
  "rating": "clean | caution | avoid",
  "crunchyScore": number (1-100, higher = cleaner),
  "ingredients": [{"name": "string", "risk": "safe | concern | toxic", "explanation": "string"}], // ingredients array MUST have at least 5 entries
  "concerns": ["string"],
  "cleanAlternatives": ["string"],
  "summary": "string (1-2 sentence summary)"
}`;

const INGREDIENTS_REQUIREMENT = `
CRITICAL INGREDIENT REQUIREMENTS:
- ALWAYS return at least 5-10 ingredients in the ingredients array. NEVER return an empty ingredients array.
- If you cannot identify the exact ingredients, list the TYPICAL ingredients for this type of product.
- For food items: include common ingredients like oils, sugars, preservatives, emulsifiers, flavorings, and stabilizers that are typical for this product category.
- For non-food items: include typical materials, chemicals, coatings, and compounds used in this product category.
- Be thorough: it is better to list likely typical ingredients than to return too few or none.`;

const SCAN_PROMPTS: Record<ScanMode, string> = {
  item: `You are an expert clean living product analyst with extensive knowledge of consumer products, their ingredients, and materials.

The user has photographed a product. Your job:
1. IDENTIFY the exact product name and brand from the image (read labels, logos, packaging)
2. LOOK UP the product's real ingredients or materials using your knowledge base
3. ANALYZE each ingredient/material for health, toxicity, and safety concerns
4. Be SPECIFIC: list actual chemical names, material grades, and fabric compositions, not vague categories

${PRODUCT_TYPES}
${MATERIAL_ANALYSIS}
${INGREDIENTS_REQUIREMENT}
${SCORE_CALIBRATION}
Return a JSON object with this exact structure:
${JSON_SCHEMA}`,

  ingredients: `You are a clean living ingredient analyst. The user has taken a photo of an ingredients list on a product.
Read and analyze every ingredient visible in the photo. Use your knowledge base to identify the product if possible.
${PRODUCT_TYPES}
For clothing: analyze fabric composition, dyes, chemical treatments (formaldehyde, PFAS, etc.).
${INGREDIENTS_REQUIREMENT}
${SCORE_CALIBRATION}
Return a JSON object with this exact structure:
${JSON_SCHEMA}`,

  label: `You are a clean living label analyst. The user has taken a photo of a nutrition or claims label on a product.
Analyze the claims, certifications, and nutritional information visible. Use your knowledge base for the product.
${PRODUCT_TYPES}
${MATERIAL_ANALYSIS}
${INGREDIENTS_REQUIREMENT}
${SCORE_CALIBRATION}
Return a JSON object with this exact structure:
${JSON_SCHEMA}`,

  barcode: `You are a clean living food and product analyst. The user scanned a barcode and we found product data.
Analyze the ingredients for health, toxicity, and safety concerns.
${INGREDIENTS_REQUIREMENT}
${SCORE_CALIBRATION}
Return a JSON object with this exact structure:
${JSON_SCHEMA}`,
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
  barcode: {
    productName: "Doritos Nacho Cheese",
    brand: "Frito-Lay",
    category: "Food",
    rating: "avoid",
    crunchyScore: 18,
    ingredients: [
      { name: "Corn", risk: "concern", explanation: "Likely GMO corn. Not organic." },
      { name: "Vegetable Oil", risk: "toxic", explanation: "Blend of corn, canola, and sunflower oil. Highly processed seed oils linked to inflammation." },
      { name: "Maltodextrin", risk: "toxic", explanation: "Ultra-processed starch with very high glycemic index. Spikes blood sugar rapidly." },
      { name: "Salt", risk: "concern", explanation: "High sodium content per serving." },
      { name: "Monosodium Glutamate", risk: "concern", explanation: "Flavor enhancer. Some people report sensitivity reactions." },
      { name: "Red 40", risk: "toxic", explanation: "Artificial dye linked to hyperactivity in children. Banned in some countries." },
      { name: "Yellow 6", risk: "toxic", explanation: "Artificial dye with potential carcinogenic contaminants." },
    ],
    concerns: [
      "Multiple artificial dyes (Red 40, Yellow 6)",
      "Ultra-processed seed oils",
      "High sodium and maltodextrin",
    ],
    cleanAlternatives: [
      "Siete Grain-Free Tortilla Chips",
      "Late July Organic Snack Chips",
      "Jackson's Sweet Potato Chips",
    ],
    summary: "Contains multiple artificial dyes, ultra-processed oils, and high sodium. A heavily processed snack with numerous health concerns.",
  },
};

function parseGeminiResponse(text: string): GeminiAnalysis {
  let parsed: any = null;

  // Strategy 1: Try parsing raw text directly
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    // Strategy 2: Try extracting ```json blocks
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      try {
        parsed = JSON.parse(jsonBlockMatch[1].trim());
      } catch {
        // continue to next strategy
      }
    }

    // Strategy 3: Find first { to last } and parse that
    if (!parsed) {
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));
        } catch {
          // continue to next strategy
        }
      }
    }

    // Strategy 4: Log raw response and throw
    if (!parsed) {
      console.error("Failed to parse Gemini JSON. Raw response:", text.substring(0, 1000));
      throw new Error("JSON Parse error: Could not extract valid JSON from Gemini response");
    }
  }

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
  mode: ScanMode,
  concernsPrompt?: string
): Promise<GeminiAnalysis> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return MOCK_RESULTS[mode];
  }

  // Check daily limit to prevent runaway charges
  const withinLimit = await checkDailyLimit();
  if (!withinLimit) {
    throw new Error("SCANNER_RATE_LIMITED");
  }

  const maxRetries = 4;
  const retryDelays = [3000, 6000, 12000, 10000]; // exponential backoff + final 10s

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SCAN_PROMPTS[mode] + (concernsPrompt || "") },
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
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (response.status === 429 && attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt - 1]));
      continue;
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("SCANNER_RATE_LIMITED");
      }
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    // Gemini 2.5 may return thought parts before text parts
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find((p: any) => typeof p.text === "string");
    const textContent = textPart?.text;

    if (!textContent) {
      console.error("Gemini response parts:", JSON.stringify(parts).substring(0, 500));
      throw new Error("No response from Gemini API");
    }

    await incrementDailyCount();
    return parseGeminiResponse(textContent);
  }

  throw new Error("SCANNER_RATE_LIMITED");
}

// Analyze, cache, and save scan in one call.
// This is the main entry point for scanner screens.
export async function analyzeAndSaveScan(
  base64Image: string,
  mode: ScanMode,
  userId: string | null,
  concernsPrompt?: string
): Promise<GeminiAnalysis> {
  const analysis = await analyzeWithGemini(base64Image, mode, concernsPrompt);

  // Cache product and save scan in background (don't block UI)
  const productId = await cacheProduct(analysis);
  if (userId) {
    await saveScan(userId, productId, mode, analysis);
  }

  return analysis;
}

/** Analyze a barcode product using text prompt (no image needed) */
export async function analyzeBarcodeScan(
  prompt: string,
  userId: string | null,
  concernsPrompt?: string
): Promise<GeminiAnalysis> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return MOCK_RESULTS.barcode;
  }

  const withinLimit = await checkDailyLimit();
  if (!withinLimit) {
    throw new Error("SCANNER_RATE_LIMITED");
  }

  const fullPrompt = SCAN_PROMPTS.barcode + "\n\n" + prompt + (concernsPrompt || "");

  const maxRetries = 4;
  const retryDelays = [3000, 6000, 12000, 10000];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (response.status === 429 && attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt - 1]));
      continue;
    }

    if (!response.ok) {
      if (response.status === 429) throw new Error("SCANNER_RATE_LIMITED");
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find((p: any) => typeof p.text === "string");
    const textContent = textPart?.text;

    if (!textContent) throw new Error("No response from Gemini API");

    await incrementDailyCount();
    const analysis = parseGeminiResponse(textContent);

    // Cache in background
    if (isSupabaseConfigured()) {
      cacheProduct(analysis).catch(() => {});
      if (userId) saveScan(userId, null, "barcode" as ScanMode, analysis).catch(() => {});
    }

    return analysis;
  }

  throw new Error("SCANNER_RATE_LIMITED");
}

/** Analyze a product by name (text-only, no image needed) */
export async function analyzeProductByName(
  productName: string,
  concernsPrompt?: string
): Promise<GeminiAnalysis> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { ...MOCK_RESULTS.item, productName };
  }

  const withinLimit = await checkDailyLimit();
  if (!withinLimit) {
    throw new Error("SCANNER_RATE_LIMITED");
  }

  const prompt = `You are an expert clean living product analyst. The user wants to look up this product by name: "${productName}".

Use your extensive product knowledge to:
1. Identify the exact product (if specific brand/product) or analyze the general product category
2. List the real ingredients or materials
3. Analyze each for health, toxicity, and safety concerns
4. Be specific with chemical names and material grades

${PRODUCT_TYPES}
${MATERIAL_ANALYSIS}
${SCORE_CALIBRATION}
Return a JSON object with this exact structure:
${JSON_SCHEMA}` + (concernsPrompt || "");

  const maxRetries = 4;
  const retryDelays = [3000, 6000, 12000, 10000];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (response.status === 429 && attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt - 1]));
      continue;
    }

    if (!response.ok) {
      if (response.status === 429) throw new Error("SCANNER_RATE_LIMITED");
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find((p: any) => typeof p.text === "string");
    const textContent = textPart?.text;

    if (!textContent) throw new Error("No response from Gemini API");

    await incrementDailyCount();
    const analysis = parseGeminiResponse(textContent);

    // Cache in background
    cacheProduct(analysis).catch(() => {});

    return analysis;
  }

  throw new Error("SCANNER_RATE_LIMITED");
}

/** Build a concern prompt suffix based on the scan focus mode */
export function buildFocusPrompt(focus: string): string {
  switch (focus) {
    case "body":
      return "\n\nFOCUS: Analyze ONLY chemicals and ingredients harmful to human health. Ignore environmental concerns. Weight the score entirely on body toxicity. Do NOT include nutritional concerns like sugar, sodium, or calorie content. Only flag actual toxic chemicals, endocrine disruptors, carcinogens, and harmful additives.";
    case "environmental":
      return "\n\nFOCUS: Analyze ONLY environmental impact, sustainability, packaging waste, and ecological harm. Weight the score entirely on environmental concerns.";
    case "quick":
      return "\n\nFOCUS: Provide a QUICK analysis. Only return the product name, score, and top 3 concerns. Keep the ingredients list to the 5 most important ones. Keep the summary to one sentence.";
    default:
      return "";
  }
}

export { isMockMode, findCachedProduct };
