/**
 * Crunchy Score calculation and tier logic.
 *
 * Score formula:
 *   scan history (80%) + recipes tried (20%) + quiz baseline (decays over 1 year)
 *
 * Tiers:
 *   Seedling  (0-25)
 *   Sprout    (26-50)
 *   Sapling   (51-75)
 *   In Bloom  (76-100)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "./supabase";

export type CrunchyTier = "seedling" | "sprout" | "sapling" | "bloom";

export interface TierInfo {
  tier: CrunchyTier;
  label: string;
  emoji: string;
  badge: "clean" | "caution" | "avoid";
}

export interface CrunchyStats {
  totalScans: number;
  recipesMade: number;
  daysActive: number;
  crunchyScore: number;
  tier: TierInfo;
}

export interface ScoreInput {
  /** Average rating of scanned products (0-100, higher = cleaner choices) */
  scanScoreAvg: number;
  /** Total number of scans performed */
  totalScans: number;
  /** Number of recipes the user has tried/saved */
  recipesMade: number;
  /** Quiz baseline score (0-100), null if quiz not taken */
  quizScore: number | null;
  /** Date quiz was completed, null if not taken */
  quizCompletedAt: Date | null;
  /** Account creation date for days active calc */
  createdAt: Date;
}

const TIERS: { max: number; info: TierInfo }[] = [
  { max: 25, info: { tier: "seedling", label: "Seedling", emoji: "", badge: "avoid" } },
  { max: 50, info: { tier: "sprout", label: "Sprout", emoji: "", badge: "caution" } },
  { max: 75, info: { tier: "sapling", label: "Sapling", emoji: "", badge: "caution" } },
  { max: 100, info: { tier: "bloom", label: "In Bloom", emoji: "", badge: "clean" } },
];

export function getTierInfo(score: number): TierInfo {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const t of TIERS) {
    if (clamped <= t.max) return t.info;
  }
  return TIERS[TIERS.length - 1].info;
}

/**
 * Calculate the quiz decay factor.
 * 100% weight at quiz completion, linearly decaying to 0% after 1 year.
 */
function quizDecayFactor(quizCompletedAt: Date, now: Date = new Date()): number {
  const msInYear = 365.25 * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - quizCompletedAt.getTime();
  const factor = 1 - elapsed / msInYear;
  return Math.max(0, Math.min(1, factor));
}

/**
 * Calculate scan engagement score (0-100).
 * Based on average product safety scores + engagement bonus for scanning more.
 */
function calcScanScore(scanScoreAvg: number, totalScans: number): number {
  if (totalScans === 0) return 0;
  // Base: average score of scanned products (how clean their choices are)
  const base = scanScoreAvg;
  // Engagement bonus: logarithmic, caps at ~15 points for heavy scanners
  const engagementBonus = Math.min(15, Math.log2(totalScans + 1) * 4);
  return Math.min(100, base + engagementBonus);
}

/**
 * Calculate recipe engagement score (0-100).
 * More recipes tried = higher score, with diminishing returns.
 */
function calcRecipeScore(recipesMade: number): number {
  if (recipesMade === 0) return 0;
  // Each recipe adds significant value, capping around 20+ recipes
  return Math.min(100, recipesMade * 12);
}

/**
 * Calculate the overall Crunchy Score (0-100).
 */
export function calculateCrunchyScore(input: ScoreInput): number {
  const scanScore = calcScanScore(input.scanScoreAvg, input.totalScans);
  const recipeScore = calcRecipeScore(input.recipesMade);

  // Weighted combination: 80% scans + 20% recipes
  let score = scanScore * 0.8 + recipeScore * 0.2;

  // Quiz baseline: blends with calculated score, decaying over time
  if (input.quizScore != null && input.quizCompletedAt != null) {
    const decay = quizDecayFactor(input.quizCompletedAt);
    if (decay > 0) {
      // Quiz acts as a floor/boost that fades over time
      // Blend: decay% quiz + (1-decay)% activity
      score = score * (1 - decay * 0.5) + input.quizScore * decay * 0.5;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate days active from account creation.
 */
export function calcDaysActive(createdAt: Date, now: Date = new Date()): number {
  const diffMs = now.getTime() - createdAt.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Build full CrunchyStats from input data.
 */
export function buildCrunchyStats(input: ScoreInput): CrunchyStats {
  const crunchyScore = calculateCrunchyScore(input);
  return {
    totalScans: input.totalScans,
    recipesMade: input.recipesMade,
    daysActive: calcDaysActive(input.createdAt),
    crunchyScore,
    tier: getTierInfo(crunchyScore),
  };
}

/**
 * Default stats for a new user with no activity.
 */
export function getDefaultStats(): CrunchyStats {
  return {
    totalScans: 0,
    recipesMade: 0,
    daysActive: 1,
    crunchyScore: 0,
    tier: getTierInfo(0),
  };
}

/**
 * Mock stats for development/demo (used when Supabase isn't configured).
 */
export function getMockStats(): CrunchyStats {
  const score = 74;
  return {
    totalScans: 12,
    recipesMade: 5,
    daysActive: 23,
    crunchyScore: score,
    tier: getTierInfo(score),
  };
}

/**
 * Fetch the user's crunchy score and tier, trying Supabase first then local storage.
 */
export async function fetchCrunchyScore(userId?: string): Promise<{ score: number; tier: TierInfo } | null> {
  // Try Supabase first
  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("crunchy_score, crunchy_tier, quiz_completed_at")
        .eq("id", userId)
        .single();

      if (!error && data && data.crunchy_score != null) {
        return {
          score: data.crunchy_score,
          tier: getTierInfo(data.crunchy_score),
        };
      }
    } catch {
      // Fall through to local
    }
  }

  // Try local AsyncStorage
  try {
    const stored = await AsyncStorage.getItem("@crunchy_quiz_score");
    if (stored) {
      const parsed = JSON.parse(stored);
      const score = parsed.score || 0;
      return { score, tier: getTierInfo(score) };
    }
  } catch {
    // ignore
  }

  return null;
}
