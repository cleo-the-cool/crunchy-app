import Constants from "expo-constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  computeWeightedScore,
  getRatingFromScore,
  DEFAULT_PREFERENCES,
  type CategoryScores,
  type UserPreferences,
} from "@/lib/scoring";

export type ScanMode = "item" | "ingredients" | "label" | "barcode";

export interface GeminiIngredient {
  name: string;
  risk: "safe" | "concern" | "toxic";
  explanation: string;
  tier?: "high" | "moderate" | "limited" | "safe";
  source?: string | null;
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
  categoryScores?: CategoryScores;
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
const DAILY_SCAN_LIMIT = 50;
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

// ─── User Preferences Loader ────────────────────────────────────────

async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const stored = await AsyncStorage.getItem("@crunchy_user_preferences");
    if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PREFERENCES;
}

// ─── Generic Gemini Call with Retry ──────────────────────────────────

interface GeminiCallOptions {
  parts: any[];
  maxOutputTokens?: number;
  temperature?: number;
}

async function callGemini(options: GeminiCallOptions): Promise<any> {
  const { parts, maxOutputTokens = 4096, temperature = 0.2 } = options;
  const maxRetries = 4;
  const retryDelays = [3000, 6000, 12000, 10000];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature,
          maxOutputTokens,
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
    const responseParts = data.candidates?.[0]?.content?.parts || [];
    const textPart = responseParts.find((p: any) => typeof p.text === "string");
    if (!textPart?.text) {
      throw new Error("No response from Gemini API");
    }

    return JSON.parse(textPart.text);
  }

  throw new Error("SCANNER_RATE_LIMITED");
}

// ─── Product Identification ──────────────────────────────────────────

interface ProductInfo {
  productName: string;
  brand: string;
  category: string;
}

async function identifyProduct(base64Image: string): Promise<ProductInfo> {
  const result = await callGemini({
    parts: [
      {
        text: `You are a product identification specialist. Identify the product in this image.
Return ONLY valid JSON:
{"productName": "string", "brand": "string", "category": "Food|Drinks|Skincare|Makeup|Cleaning|Personal Care|Clothing|Home|Baby|Cookware|Drinkware|Other"}`,
      },
      { inline_data: { mime_type: "image/jpeg", data: base64Image } },
    ],
    maxOutputTokens: 256,
  });

  return {
    productName: result.productName || "Unknown Product",
    brand: result.brand || "Unknown Brand",
    category: result.category || "Other",
  };
}

// ─── Category Analysis Functions ─────────────────────────────────────

async function analyzeToxins(base64Image: string, productInfo: ProductInfo): Promise<any> {
  return callGemini({
    parts: [
      {
        text: `You are a toxicology and food safety researcher. Analyze the product shown ONLY for harmful additives, synthetic chemicals, endocrine disruptors, carcinogens, neurotoxins, and ingredients flagged by major regulatory bodies.

Product: ${productInfo.productName} by ${productInfo.brand} (Category: ${productInfo.category})

DO NOT penalize for: natural sugars, saturated fats, calories, whole food ingredients, or anything not chemically synthesized.

Rate each ingredient using this 4-tier system based on scientific consensus:
- HIGH RISK: Banned in EU, classified as carcinogen by IARC, or confirmed endocrine disruptor
- MODERATE RISK: Flagged by EFSA or ANSES with safety concerns, limited but notable studies
- LIMITED RISK: Some concern in high doses, regulatory debate ongoing
- SAFE: Approved by EFSA, ANSES, and IARC with no significant concern

For flagged ingredients, cite the specific authority (EFSA, ANSES, IARC, NIH) and the finding.

Return ONLY valid JSON, no markdown:
{
  "toxins_score": "number 0-100 where 100 means no harmful additives found",
  "ingredients": [
    { "name": "string", "tier": "high|moderate|limited|safe", "concern": "string or null", "source": "string or null" }
  ],
  "flagged_count": { "high": "count of high-risk ingredients", "moderate": "count of moderate-risk ingredients", "limited": "count of limited-risk ingredients", "safe": "count of safe ingredients" },
  "summary": "string"
}`,
      },
      { inline_data: { mime_type: "image/jpeg", data: base64Image } },
    ],
  });
}

async function analyzeNutrition(base64Image: string, productInfo: ProductInfo): Promise<any> {
  return callGemini({
    parts: [
      {
        text: `You are a registered dietitian analyzing this product's nutritional quality only.

Product: ${productInfo.productName} by ${productInfo.brand}

Score based on: whole vs processed ingredients, NOVA processing scale (1=whole food, 4=ultra-processed), fiber content, added vs natural sugar, artificial sweeteners, and overall nutritional density.

DO NOT consider additives, ethics, sourcing, or anything not directly nutritional.

Return ONLY valid JSON:
{
  "nutrition_score": "number 0-100 where 100 means excellent nutritional quality",
  "nova_level": "1-4 where 1=whole food and 4=ultra-processed",
  "breakdown": {
    "added_sugar": "low|moderate|high",
    "fiber": "low|moderate|high",
    "processing_level": "minimal|processed|ultra-processed",
    "artificial_sweeteners": "true or false"
  },
  "summary": "string"
}`,
      },
      { inline_data: { mime_type: "image/jpeg", data: base64Image } },
    ],
  });
}

async function analyzeEthics(base64Image: string, productInfo: ProductInfo): Promise<any> {
  return callGemini({
    parts: [
      {
        text: `You are a supply chain ethics researcher. Research this brand and product for:
1. Animal welfare: animal testing, factory-farmed ingredients, certifications (Leaping Bunny, B Corp, Certified Humane)
2. Environmental sustainability: packaging practices, carbon footprint, environmental certifications
3. Fair trade: labor sourcing, fair trade certifications, known labor controversies

Product: ${productInfo.productName} by ${productInfo.brand}

If product-specific data is unavailable, use brand-level data and note this in data_confidence.

Return ONLY valid JSON:
{
  "animal_welfare_score": "number 0-100 or null if unknown",
  "sustainability_score": "number 0-100 or null if unknown",
  "fair_trade_score": "number 0-100 or null if unknown",
  "certifications": ["list of certification names found"],
  "findings": ["list of factual findings about ethics"],
  "data_confidence": "product|brand|limited",
  "summary": "string"
}`,
      },
      { inline_data: { mime_type: "image/jpeg", data: base64Image } },
    ],
  });
}

// ─── Cache Functions ─────────────────────────────────────────────────

function mapToDbCategory(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("food") || lower.includes("cooking")) return "food";
  if (lower.includes("drink")) return "food";
  if (lower.includes("skin") || lower.includes("personal") || lower.includes("cosmetic")) return "cosmetics";
  if (lower.includes("clean")) return "cleaning";
  if (lower.includes("baby")) return "baby";
  if (lower.includes("cloth") || lower.includes("fashion")) return "clothing";
  if (lower.includes("supplement") || lower.includes("vitamin")) return "supplement";
  return "other";
}

interface CachedProductResult {
  analysis: GeminiAnalysis | null;
  categoryScores: CategoryScores | null;
  productId: string | null;
}

async function findCachedProduct(
  name: string,
  brand: string
): Promise<CachedProductResult | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data } = await supabase
      .from("products")
      .select("id, gemini_analysis, category_scores, scan_count")
      .eq("name", name)
      .eq("brand", brand)
      .limit(1)
      .single();

    if (data) {
      return {
        analysis: data.gemini_analysis as GeminiAnalysis | null,
        categoryScores: data.category_scores as CategoryScores | null,
        productId: data.id,
      };
    }
  } catch {
    // Not found or error
  }
  return null;
}

async function cacheProduct(
  analysis: GeminiAnalysis,
  categoryScores?: CategoryScores
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: existing } = await supabase
      .from("products")
      .select("id, scan_count")
      .eq("name", analysis.productName)
      .eq("brand", analysis.brand)
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from("products")
        .update({
          gemini_analysis: analysis,
          overall_score: analysis.crunchyScore,
          scan_count: (existing.scan_count ?? 0) + 1,
          category_scores: categoryScores || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      return existing.id;
    }

    const { data: newProduct } = await supabase
      .from("products")
      .insert({
        name: analysis.productName,
        brand: analysis.brand,
        category: mapToDbCategory(analysis.category),
        ingredients: analysis.ingredients.map((i) => i.name),
        overall_score: analysis.crunchyScore,
        gemini_analysis: analysis,
        category_scores: categoryScores || undefined,
      })
      .select("id")
      .single();

    return newProduct?.id ?? null;
  } catch {
    return null;
  }
}

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
  } catch {}
}

// ─── Build GeminiAnalysis from category analysis results ─────────────

function buildAnalysisFromCategories(
  productInfo: ProductInfo,
  toxinsResult: any,
  nutritionResult: any | null,
  ethicsResult: any | null,
  categoryScores: CategoryScores,
  crunchyScore: number
): GeminiAnalysis {
  const rating = getRatingFromScore(crunchyScore);

  // Map toxins ingredients to GeminiIngredient format
  const ingredients: GeminiIngredient[] = (toxinsResult?.ingredients || []).map(
    (i: any) => {
      // Map tier to legacy risk for backward compatibility
      const tierToRisk: Record<string, "safe" | "concern" | "toxic"> = {
        safe: "safe",
        limited: "concern",
        moderate: "concern",
        high: "toxic",
      };
      return {
        name: i.name || "Unknown",
        risk: tierToRisk[i.tier] || "concern",
        explanation: i.concern || "No concerns identified.",
        tier: i.tier || "safe",
        source: i.source || null,
      };
    }
  );

  // Compile concerns: only actual negative findings
  const concerns: string[] = [];
  // Only add toxin-related concerns from flagged ingredients
  if (toxinsResult?.ingredients) {
    const flagged = toxinsResult.ingredients.filter((i: any) => i.tier === "high" || i.tier === "moderate");
    for (const ing of flagged) {
      if (ing.concern) concerns.push(`${ing.name}: ${ing.concern}${ing.source ? ` (${ing.source})` : ""}`);
    }
  }
  // Only add nutrition concerns if score is low
  if (nutritionResult && nutritionResult.nutrition_score < 50) {
    concerns.push(nutritionResult.summary);
  }
  // Only add negative ethics findings (filter out positive ones)
  if (ethicsResult?.findings) {
    const negativeKeywords = ["controversy", "concern", "violation", "accused", "lawsuit", "poor", "low score", "no certification", "unknown", "insufficient"];
    const positiveKeywords = ["recyclable", "certified", "vegan", "cruelty-free", "organic", "fair trade", "no major", "no known", "committed", "sustainable"];
    for (const finding of ethicsResult.findings) {
      const lower = finding.toLowerCase();
      const isPositive = positiveKeywords.some((kw) => lower.includes(kw));
      const isNegative = negativeKeywords.some((kw) => lower.includes(kw));
      if (isNegative && !isPositive) concerns.push(finding);
    }
  }

  // Build concise summary (toxins-first, max 2 sentences)
  let summary = toxinsResult?.summary || "Analysis complete.";
  if (nutritionResult?.summary && summary.length < 150) {
    summary += " " + nutritionResult.summary;
  }

  return {
    productName: productInfo.productName,
    brand: productInfo.brand,
    category: productInfo.category,
    rating,
    crunchyScore,
    ingredients,
    concerns,
    cleanAlternatives: [],
    summary,
    categoryScores,
  };
}

// ─── Mock Data ───────────────────────────────────────────────────────

const MOCK_RESULTS: Record<ScanMode, GeminiAnalysis> = {
  item: {
    productName: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Skincare",
    rating: "caution",
    crunchyScore: 42,
    ingredients: [
      { name: "Water", risk: "safe", explanation: "Purified water used as the base solvent. Completely safe.", tier: "safe", source: null },
      { name: "Cetyl Alcohol", risk: "safe", explanation: "A fatty alcohol from coconut oil. Used as an emollient. Generally safe.", tier: "safe", source: null },
      { name: "Propylene Glycol", risk: "concern", explanation: "Synthetic humectant. Can cause irritation in sensitive individuals.", tier: "limited", source: "EFSA" },
      { name: "Sodium Lauryl Sulfate", risk: "toxic", explanation: "Harsh surfactant that strips natural oils. Known skin irritant.", tier: "high", source: "EFSA 2019" },
      { name: "Methylparaben", risk: "toxic", explanation: "Preservative that mimics estrogen. Potential endocrine disruptor.", tier: "high", source: "IARC" },
    ],
    concerns: [
      "Contains parabens (potential endocrine disruptors)",
      "Sodium Lauryl Sulfate is a harsh irritant",
    ],
    cleanAlternatives: [
      "CeraVe Hydrating Cleanser",
      "Weleda Calendula Cleanser",
    ],
    summary: "This cleanser contains several concerning ingredients including parabens and SLS.",
    categoryScores: {
      toxins_additives: {
        score: 42,
        flagged: [],
        risk_breakdown: { high: 2, moderate: 0, limited: 1, safe: 2 },
        ingredients: [],
        summary: "Contains parabens and SLS.",
      },
    },
  },
  ingredients: {
    productName: "Unknown Product",
    brand: "Unknown Brand",
    category: "Personal Care",
    rating: "avoid",
    crunchyScore: 25,
    ingredients: [
      { name: "Aqua", risk: "safe", explanation: "Water base. Completely safe.", tier: "safe", source: null },
      { name: "Fragrance/Parfum", risk: "toxic", explanation: "Undisclosed mixture of chemicals.", tier: "high", source: "EFSA" },
      { name: "DMDM Hydantoin", risk: "toxic", explanation: "Formaldehyde-releasing preservative.", tier: "high", source: "IARC" },
    ],
    concerns: ["Contains formaldehyde releasers", "Undisclosed fragrance chemicals"],
    cleanAlternatives: ["Everyone 3-in-1 Soap"],
    summary: "This ingredient list reveals several toxic chemicals.",
  },
  label: {
    productName: "Organic Granola Bar",
    brand: "Nature Valley",
    category: "Food",
    rating: "caution",
    crunchyScore: 55,
    ingredients: [
      { name: "Whole Grain Oats", risk: "safe", explanation: "Whole grain with fiber.", tier: "safe", source: null },
      { name: "Sugar", risk: "concern", explanation: "Added sugar.", tier: "limited", source: null },
      { name: "Canola Oil", risk: "concern", explanation: "Highly processed seed oil.", tier: "moderate", source: "EFSA" },
    ],
    concerns: ["Contains processed seed oils", "Multiple sources of added sugar"],
    cleanAlternatives: ["RXBar", "Larabar"],
    summary: "Contains processed oils and multiple sugar sources.",
  },
  barcode: {
    productName: "Doritos Nacho Cheese",
    brand: "Frito-Lay",
    category: "Food",
    rating: "avoid",
    crunchyScore: 18,
    ingredients: [
      { name: "Corn", risk: "concern", explanation: "Likely GMO corn.", tier: "limited", source: null },
      { name: "Red 40", risk: "toxic", explanation: "Artificial dye linked to hyperactivity.", tier: "high", source: "EFSA 2009" },
      { name: "Yellow 6", risk: "toxic", explanation: "Artificial dye with potential carcinogens.", tier: "high", source: "EFSA" },
    ],
    concerns: ["Multiple artificial dyes (Red 40, Yellow 6)", "Ultra-processed seed oils"],
    cleanAlternatives: ["Siete Grain-Free Tortilla Chips"],
    summary: "Contains multiple artificial dyes, ultra-processed oils, and high sodium.",
  },
};

// ─── Main Entry Points ───────────────────────────────────────────────

export async function analyzeAndSaveScan(
  base64Image: string,
  mode: ScanMode,
  userId: string | null,
  onProgress?: (step: string) => void
): Promise<GeminiAnalysis> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return MOCK_RESULTS[mode];
  }

  const withinLimit = await checkDailyLimit();
  if (!withinLimit) throw new Error("SCANNER_RATE_LIMITED");

  // Step 1: Identify product
  onProgress?.("Identifying product...");
  const productInfo = await identifyProduct(base64Image);

  // Step 2: Check cache
  const cached = await findCachedProduct(productInfo.productName, productInfo.brand);
  if (cached?.categoryScores) {
    const prefs = await loadUserPreferences();
    const score = computeWeightedScore(cached.categoryScores, prefs);
    const analysis = buildAnalysisFromCachedData(productInfo, cached, score);
    
    // Increment scan count
    if (cached.productId && isSupabaseConfigured()) {
      supabase.from("products")
        .update({ scan_count: ((await supabase.from("products").select("scan_count").eq("id", cached.productId).single()).data?.scan_count ?? 0) + 1 })
        .eq("id", cached.productId)
        .then(() => {});
    }
    if (userId) saveScan(userId, cached.productId, mode, analysis).catch(() => {});

    await incrementDailyCount();
    // Save to local history
    const { addToHistory } = await import("@/lib/scanHistory");
    addToHistory({
      productName: analysis.productName,
      brand: analysis.brand,
      category: analysis.category,
      rating: analysis.rating,
      crunchyScore: analysis.crunchyScore,
      scanMode: mode,
      ingredients: analysis.ingredients.map(i => ({ name: i.name, risk: i.risk })),
      concerns: analysis.concerns,
      summary: analysis.summary,
    }).catch(() => {});

    return analysis;
  }

  // Step 3: Fire parallel analysis calls
  onProgress?.("Analyzing ingredients...");
  const isFoodOrDrinks = /food|drinks|cooking|drink/i.test(productInfo.category);

  const analysisPromises: Promise<any>[] = [
    analyzeToxins(base64Image, productInfo),
    analyzeEthics(base64Image, productInfo),
  ];
  if (isFoodOrDrinks) {
    analysisPromises.push(analyzeNutrition(base64Image, productInfo));
  }

  const results = await Promise.all(analysisPromises);
  const toxinsResult = results[0];
  const ethicsResult = results[1];
  const nutritionResult = isFoodOrDrinks ? results[2] : null;

  // Post-process: ensure obviously safe ingredients aren't misclassified
  const OBVIOUSLY_SAFE = ["water", "carbonated water", "purified water", "filtered water", "spring water", "sparkling water", "salt", "sea salt"];
  if (toxinsResult?.ingredients) {
    for (const ing of toxinsResult.ingredients) {
      if (OBVIOUSLY_SAFE.some((s) => ing.name.toLowerCase().includes(s))) {
        ing.tier = "safe";
        ing.concern = null;
        ing.source = null;
      }
    }
  }

  await incrementDailyCount();

  // Step 4: Build CategoryScores
  onProgress?.("Calculating your score...");
  const categoryScores: CategoryScores = {
    toxins_additives: {
      score: toxinsResult?.toxins_score ?? 50,
      flagged: (toxinsResult?.ingredients || [])
        .filter((i: any) => i.tier !== "safe")
        .map((i: any) => ({
          ingredient: i.name,
          concern: i.concern || "",
          severity: i.tier,
          source: i.source || "",
        })),
      risk_breakdown: toxinsResult?.flagged_count || { high: 0, moderate: 0, limited: 0, safe: 0 },
      ingredients: toxinsResult?.ingredients || [],
      summary: toxinsResult?.summary || "",
    },
    animal_welfare: {
      score: ethicsResult?.animal_welfare_score ?? null,
      findings: ethicsResult?.findings || [],
      certifications: ethicsResult?.certifications || [],
      data_confidence: ethicsResult?.data_confidence || "limited",
    },
    sustainability: {
      score: ethicsResult?.sustainability_score ?? null,
      findings: ethicsResult?.findings || [],
      data_confidence: ethicsResult?.data_confidence || "limited",
    },
    fair_trade: {
      score: ethicsResult?.fair_trade_score ?? null,
      findings: ethicsResult?.findings || [],
      data_confidence: ethicsResult?.data_confidence,
    },
  };

  if (nutritionResult) {
    categoryScores.nutrition = {
      score: nutritionResult.nutrition_score ?? null,
      nova_level: nutritionResult.nova_level,
      breakdown: nutritionResult.breakdown,
      summary: nutritionResult.summary || "",
    };
  }

  // Step 5: Compute weighted score
  const prefs = await loadUserPreferences();
  const crunchyScore = computeWeightedScore(categoryScores, prefs);

  // Step 6: Build response
  const analysis = buildAnalysisFromCategories(
    productInfo,
    toxinsResult,
    nutritionResult,
    ethicsResult,
    categoryScores,
    crunchyScore
  );

  // Step 7: Cache and save (non-blocking)
  const productId = await cacheProduct(analysis, categoryScores);
  if (userId) saveScan(userId, productId, mode, analysis).catch(() => {});

  // Save to local history
  const { addToHistory } = await import("@/lib/scanHistory");
  addToHistory({
    productName: analysis.productName,
    brand: analysis.brand,
    category: analysis.category,
    rating: analysis.rating,
    crunchyScore: analysis.crunchyScore,
    scanMode: mode,
    ingredients: analysis.ingredients.map(i => ({ name: i.name, risk: i.risk })),
    concerns: analysis.concerns,
    summary: analysis.summary,
  }).catch(() => {});

  return analysis;
}

function buildAnalysisFromCachedData(
  productInfo: ProductInfo,
  cached: CachedProductResult,
  crunchyScore: number
): GeminiAnalysis {
  const rating = getRatingFromScore(crunchyScore);

  if (cached.analysis) {
    return {
      ...cached.analysis,
      crunchyScore,
      rating,
      categoryScores: cached.categoryScores || undefined,
    };
  }

  // Build from category scores if no full analysis cached
  const cs = cached.categoryScores!;
  const ingredients: GeminiIngredient[] = (cs.toxins_additives?.ingredients || []).map(
    (i: any) => {
      const tierToRisk: Record<string, "safe" | "concern" | "toxic"> = {
        safe: "safe", limited: "concern", moderate: "concern", high: "toxic",
      };
      return {
        name: i.name || "Unknown",
        risk: tierToRisk[i.tier] || "concern",
        explanation: i.concern || "No concerns identified.",
        tier: i.tier || "safe",
        source: i.source || null,
      };
    }
  );

  return {
    productName: productInfo.productName,
    brand: productInfo.brand,
    category: productInfo.category,
    rating,
    crunchyScore,
    ingredients,
    concerns: [],
    cleanAlternatives: [],
    summary: cs.toxins_additives?.summary || "Analysis from cache.",
    categoryScores: cs,
  };
}

// ─── Barcode Scan ────────────────────────────────────────────────────

const BARCODE_PROMPT = `You are a clean living food and product analyst. The user scanned a barcode and we found product data.
Analyze the ingredients for health, toxicity, and safety concerns.

CRITICAL INGREDIENT REQUIREMENTS:
- ALWAYS return at least 5-10 ingredients in the ingredients array.
- If you cannot identify the exact ingredients, list the TYPICAL ingredients for this product category.

Score calibration (1-100, be strict and realistic):
- 90-100: Truly clean/organic/certified safe
- 70-89: Mostly clean with minor concerns
- 50-69: Moderate concerns
- 30-49: Significant concerns
- 1-29: Major toxicity/health risks

Return a JSON object with this exact structure:
{
  "productName": "string",
  "brand": "string",
  "category": "string",
  "rating": "clean | caution | avoid",
  "crunchyScore": 0,
  "ingredients": [{"name": "string", "risk": "safe | concern | toxic", "explanation": "string"}],
  "concerns": ["string"],
  "cleanAlternatives": ["string"],
  "summary": "string"
}`;

export async function analyzeBarcodeScan(
  prompt: string,
  userId: string | null
): Promise<GeminiAnalysis> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return MOCK_RESULTS.barcode;
  }

  const withinLimit = await checkDailyLimit();
  if (!withinLimit) throw new Error("SCANNER_RATE_LIMITED");

  const fullPrompt = BARCODE_PROMPT + "\n\n" + prompt;

  const result = await callGemini({
    parts: [{ text: fullPrompt }],
    maxOutputTokens: 8192,
  });

  await incrementDailyCount();

  const analysis: GeminiAnalysis = {
    productName: result.productName || "Unknown Product",
    brand: result.brand || "Unknown Brand",
    category: result.category || "Other",
    rating: result.rating || "caution",
    crunchyScore: result.crunchyScore || 50,
    ingredients: (result.ingredients || []).map(
      (i: { name?: string; risk?: string; explanation?: string }) => ({
        name: i.name || "Unknown",
        risk: i.risk || "concern",
        explanation: i.explanation || "No information available.",
      })
    ),
    concerns: result.concerns || [],
    cleanAlternatives: result.cleanAlternatives || [],
    summary: result.summary || "Analysis complete.",
  };

  // Build basic category scores from barcode analysis (toxins-only)
  const categoryScores: CategoryScores = {
    toxins_additives: {
      score: analysis.crunchyScore,
      flagged: [],
      risk_breakdown: {
        high: analysis.ingredients.filter(i => i.risk === "toxic").length,
        moderate: 0,
        limited: analysis.ingredients.filter(i => i.risk === "concern").length,
        safe: analysis.ingredients.filter(i => i.risk === "safe").length,
      },
      ingredients: analysis.ingredients.map(i => ({
        name: i.name,
        tier: i.risk === "toxic" ? "high" as const : i.risk === "concern" ? "limited" as const : "safe" as const,
        concern: i.risk !== "safe" ? i.explanation : null,
        source: null,
      })),
      summary: analysis.summary,
    },
  };
  analysis.categoryScores = categoryScores;

  // Cache in background
  if (isSupabaseConfigured()) {
    cacheProduct(analysis, categoryScores).catch(() => {});
    if (userId) saveScan(userId, null, "barcode" as ScanMode, analysis).catch(() => {});
  }

  return analysis;
}

// ─── Product by Name ─────────────────────────────────────────────────

export async function analyzeProductByName(
  productName: string
): Promise<GeminiAnalysis> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { ...MOCK_RESULTS.item, productName };
  }

  const withinLimit = await checkDailyLimit();
  if (!withinLimit) throw new Error("SCANNER_RATE_LIMITED");

  const prompt = `You are an expert clean living product analyst. The user wants to look up this product by name: "${productName}".

Use your extensive product knowledge to:
1. Identify the exact product (if specific brand/product) or analyze the general product category
2. List the real ingredients or materials
3. Analyze each for health, toxicity, and safety concerns

Score calibration (1-100, be strict and realistic):
- 90-100: Truly clean/organic/certified safe
- 70-89: Mostly clean with minor concerns
- 50-69: Moderate concerns
- 30-49: Significant concerns
- 1-29: Major toxicity/health risks

Return a JSON object with this exact structure:
{
  "productName": "string",
  "brand": "string",
  "category": "string",
  "rating": "clean | caution | avoid",
  "crunchyScore": 0,
  "ingredients": [{"name": "string", "risk": "safe | concern | toxic", "explanation": "string"}],
  "concerns": ["string"],
  "cleanAlternatives": ["string"],
  "summary": "string"
}`;

  const result = await callGemini({
    parts: [{ text: prompt }],
    maxOutputTokens: 8192,
  });

  await incrementDailyCount();

  const analysis: GeminiAnalysis = {
    productName: result.productName || productName,
    brand: result.brand || "Unknown Brand",
    category: result.category || "Other",
    rating: result.rating || "caution",
    crunchyScore: result.crunchyScore || 50,
    ingredients: (result.ingredients || []).map(
      (i: { name?: string; risk?: string; explanation?: string }) => ({
        name: i.name || "Unknown",
        risk: i.risk || "concern",
        explanation: i.explanation || "No information available.",
      })
    ),
    concerns: result.concerns || [],
    cleanAlternatives: result.cleanAlternatives || [],
    summary: result.summary || "Analysis complete.",
  };

  cacheProduct(analysis).catch(() => {});
  return analysis;
}

// ─── Focus Prompt (kept for backward compatibility) ──────────────────

export function buildFocusPrompt(focus: string): string {
  switch (focus) {
    case "body":
      return "\n\nFOCUS: Analyze ONLY chemicals and ingredients harmful to human health.";
    case "environmental":
      return "\n\nFOCUS: Analyze ONLY environmental impact and sustainability.";
    case "quick":
      return "\n\nFOCUS: Quick analysis - top 3 concerns, 5 ingredients max.";
    default:
      return "";
  }
}

export { isMockMode, findCachedProduct };
