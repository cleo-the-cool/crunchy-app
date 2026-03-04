import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SubscriptionTier = "free" | "starter" | "premium";

type SubscriptionContextType = {
  tier: SubscriptionTier;
  dailyScansUsed: number;
  dailyScanLimit: number;
  canScan: boolean;
  subscribe: (tier: SubscriptionTier) => Promise<void>;
  recordScan: () => void;
  isPremiumFeature: (feature: string) => boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const SUBSCRIPTION_KEY = "@crunchy_subscription";
const SCAN_COUNT_KEY = "@crunchy_daily_scans";
const SCAN_DATE_KEY = "@crunchy_scan_date";

const SCAN_LIMITS: Record<SubscriptionTier, number> = {
  free: 5,
  starter: 50,
  premium: Infinity,
};

const PREMIUM_FEATURES = ["ai_product_scan", "label_ocr", "unlimited_scans", "priority_support"];

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [dailyScansUsed, setDailyScansUsed] = useState(0);

  useEffect(() => {
    loadSubscription();
    loadDailyScans();
  }, []);

  async function loadSubscription() {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (stored) setTier(stored as SubscriptionTier);
    } catch {
      // ignore
    }
  }

  async function loadDailyScans() {
    try {
      const storedDate = await AsyncStorage.getItem(SCAN_DATE_KEY);
      const today = new Date().toDateString();
      if (storedDate === today) {
        const count = await AsyncStorage.getItem(SCAN_COUNT_KEY);
        if (count) setDailyScansUsed(parseInt(count, 10));
      } else {
        await AsyncStorage.setItem(SCAN_DATE_KEY, today);
        await AsyncStorage.setItem(SCAN_COUNT_KEY, "0");
        setDailyScansUsed(0);
      }
    } catch {
      // ignore
    }
  }

  async function subscribe(newTier: SubscriptionTier) {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, newTier);
    setTier(newTier);
  }

  async function recordScan() {
    const newCount = dailyScansUsed + 1;
    setDailyScansUsed(newCount);
    await AsyncStorage.setItem(SCAN_COUNT_KEY, String(newCount));
    await AsyncStorage.setItem(SCAN_DATE_KEY, new Date().toDateString());
  }

  function isPremiumFeature(feature: string): boolean {
    if (tier === "premium") return false;
    if (tier === "starter" && !["ai_product_scan", "priority_support"].includes(feature)) return false;
    return PREMIUM_FEATURES.includes(feature);
  }

  const dailyScanLimit = SCAN_LIMITS[tier];
  const canScan = dailyScansUsed < dailyScanLimit;

  return (
    <SubscriptionContext.Provider
      value={{ tier, dailyScansUsed, dailyScanLimit, canScan, subscribe, recordScan, isPremiumFeature }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
