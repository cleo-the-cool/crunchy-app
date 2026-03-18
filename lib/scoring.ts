/**
 * Crunchy Living — Preference-Weighted Scoring Engine
 *
 * Computes a personalized "crunchy score" by weighting category-specific
 * analysis scores against each user's preference weights.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface ToxinIngredient {
  name: string;
  tier: "high" | "moderate" | "limited" | "safe";
  concern: string | null;
  source: string | null;
}

export interface ToxinAnalysis {
  score: number;
  flagged: Array<{
    ingredient: string;
    concern: string;
    severity: "high" | "moderate" | "limited";
    source: string;
  }>;
  risk_breakdown: { high: number; moderate: number; limited: number; safe: number };
  ingredients: ToxinIngredient[];
  summary: string;
}

export interface NutritionAnalysis {
  score: number;
  nova_level: 1 | 2 | 3 | 4;
  breakdown: {
    added_sugar: "low" | "moderate" | "high";
    fiber: "low" | "moderate" | "high";
    processing_level: "minimal" | "processed" | "ultra-processed";
    artificial_sweeteners: boolean;
  };
  summary: string;
}

export interface EthicsAnalysis {
  animal_welfare_score: number | null;
  sustainability_score: number | null;
  fair_trade_score: number | null;
  certifications: string[];
  findings: string[];
  data_confidence: "product" | "brand" | "limited";
  summary: string;
}

export interface CategoryScores {
  toxins_additives?: {
    score: number;
    flagged: ToxinAnalysis["flagged"];
    risk_breakdown: ToxinAnalysis["risk_breakdown"];
    ingredients: ToxinIngredient[];
    summary: string;
  };
  nutrition?: {
    score: number | null;
    nova_level?: number;
    breakdown?: NutritionAnalysis["breakdown"];
    summary: string;
  };
  animal_welfare?: {
    score: number | null;
    findings: string[];
    certifications: string[];
    data_confidence: string;
  };
  sustainability?: {
    score: number | null;
    findings: string[];
    data_confidence: string;
  };
  fair_trade?: {
    score: number | null;
    findings: string[];
    data_confidence?: string;
  };
}

export interface UserPreferences {
  toxins: number;       // 0-1 weight
  nutrition: number;    // 0-1 weight
  animal_welfare: number; // 0-1 weight
  sustainability: number; // 0-1 weight
  fair_trade: number;   // 0-1 weight
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  toxins: 0.9,
  nutrition: 0.5,
  animal_welfare: 0.5,
  sustainability: 0.3,
  fair_trade: 0.3,
};

// ─── Scoring ─────────────────────────────────────────────────────────

/**
 * Compute a personalized crunchy score from category analysis + user weights.
 *
 * Categories with weight 0 are completely ignored.
 * Categories with null scores use a neutral default (50).
 * Result is 1-100 (clamped).
 */
export function computeWeightedScore(
  categoryScores: CategoryScores,
  userPreferences: UserPreferences
): number {
  const mapping: Array<{ prefKey: keyof UserPreferences; scoreKey: keyof CategoryScores; ethicsField?: string }> = [
    { prefKey: "toxins", scoreKey: "toxins_additives" },
    { prefKey: "nutrition", scoreKey: "nutrition" },
    { prefKey: "animal_welfare", scoreKey: "animal_welfare" },
    { prefKey: "sustainability", scoreKey: "sustainability" },
    { prefKey: "fair_trade", scoreKey: "fair_trade" },
  ];

  let totalScore = 0;
  let totalWeight = 0;

  for (const { prefKey, scoreKey } of mapping) {
    const weight = userPreferences[prefKey] ?? 0;
    if (weight === 0) continue; // user doesn't care about this category

    const categoryData = categoryScores[scoreKey];
    const rawScore = categoryData?.score ?? 50; // neutral default if no data
    const score = rawScore ?? 50; // handle null scores

    totalScore += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 50; // no preferences set at all

  const weighted = Math.round(totalScore / totalWeight);
  return Math.max(1, Math.min(100, weighted));
}

/**
 * Derive a rating label from a numeric score.
 */
export function getRatingFromScore(score: number): "clean" | "caution" | "avoid" {
  if (score >= 70) return "clean";
  if (score >= 40) return "caution";
  return "avoid";
}

/**
 * Build a breakdown showing how each category contributed to the final score.
 * Useful for the "Why this score?" UI section.
 */
export function getScoreBreakdown(
  categoryScores: CategoryScores,
  userPreferences: UserPreferences
): Array<{
  category: string;
  label: string;
  score: number | null;
  weight: number;
  contribution: number; // how much this moved the final score
}> {
  const categories: Array<{ key: keyof CategoryScores; prefKey: keyof UserPreferences; label: string }> = [
    { key: "toxins_additives", prefKey: "toxins", label: "Toxins & Chemicals" },
    { key: "nutrition", prefKey: "nutrition", label: "Nutrition" },
    { key: "animal_welfare", prefKey: "animal_welfare", label: "Animal Welfare" },
    { key: "sustainability", prefKey: "sustainability", label: "Sustainability" },
    { key: "fair_trade", prefKey: "fair_trade", label: "Fair Trade" },
  ];

  let totalWeight = 0;
  for (const { prefKey } of categories) {
    const w = userPreferences[prefKey] ?? 0;
    if (w > 0) totalWeight += w;
  }

  return categories.map(({ key, prefKey, label }) => {
    const weight = userPreferences[prefKey] ?? 0;
    const rawScore = categoryScores[key]?.score ?? null;
    const effectiveScore = rawScore ?? 50;

    // Contribution = what percentage of the final score this category accounts for
    const contribution = totalWeight > 0 && weight > 0
      ? Math.round((effectiveScore * weight) / totalWeight)
      : 0;

    return {
      category: key,
      label,
      score: rawScore,
      weight,
      contribution,
    };
  });
}

// ─── Legacy Migration ────────────────────────────────────────────────

interface LegacyConcerns {
  toxinsToBody?: boolean;
  environmentalHarm?: boolean;
  animalTesting?: boolean;
  processedIngredients?: boolean;
  allergens?: boolean;
  sustainability?: boolean;
}

/**
 * Convert old boolean concern toggles to weighted preferences.
 * Used for migrating existing users.
 */
export function migrateLegacyConcerns(concerns: LegacyConcerns): UserPreferences {
  return {
    toxins: concerns.toxinsToBody ? 0.9 : 0.1,
    nutrition: concerns.processedIngredients ? 0.7 : 0.2,
    animal_welfare: concerns.animalTesting ? 0.8 : 0.1,
    sustainability: concerns.sustainability || concerns.environmentalHarm ? 0.6 : 0.1,
    fair_trade: concerns.sustainability ? 0.4 : 0.1,
  };
}

/**
 * Map a 4-tier risk string to display config.
 */
export const TIER_CONFIG = {
  high: { color: "#F44336", icon: "warning" as const, label: "High Risk", emoji: "🔴" },
  moderate: { color: "#FF9800", icon: "alert-circle" as const, label: "Moderate", emoji: "🟠" },
  limited: { color: "#FFC107", icon: "information-circle" as const, label: "Limited", emoji: "🟡" },
  safe: { color: "#4CAF50", icon: "checkmark-circle" as const, label: "Safe", emoji: "🟢" },
} as const;

export type RiskTier = keyof typeof TIER_CONFIG;
