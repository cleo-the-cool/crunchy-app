import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type InterestCategory =
  | "food"
  | "skincare"
  | "cleaning"
  | "personal_care"
  | "clothing"
  | "home"
  | "baby";

export type InterestOption = {
  id: InterestCategory;
  label: string;
  icon: string;
  description: string;
};

export const INTEREST_OPTIONS: InterestOption[] = [
  { id: "food", label: "Food & Beverages", icon: "🥑", description: "Clean eating, organic snacks, drinks" },
  { id: "skincare", label: "Skincare & Beauty", icon: "✨", description: "Serums, moisturizers, makeup" },
  { id: "cleaning", label: "Cleaning Products", icon: "🧹", description: "Sprays, detergents, dish soap" },
  { id: "personal_care", label: "Personal Care", icon: "🪥", description: "Toothpaste, deodorant, shampoo" },
  { id: "clothing", label: "Clothing & Textiles", icon: "👗", description: "Fabrics, dyes, fast fashion swaps" },
  { id: "home", label: "Home & Living", icon: "🏡", description: "Candles, air fresheners, bedding" },
  { id: "baby", label: "Baby Products", icon: "👶", description: "Diapers, wipes, baby food" },
];

type InterestsContextType = {
  interests: InterestCategory[];
  hasSelectedInterests: boolean;
  setInterests: (interests: InterestCategory[]) => Promise<void>;
};

const InterestsContext = createContext<InterestsContextType | null>(null);

const INTERESTS_STORAGE_KEY = "@crunchy_interests";

export function InterestsProvider({ children }: { children: React.ReactNode }) {
  const [interests, setInterestsState] = useState<InterestCategory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadInterests();
  }, []);

  async function loadInterests() {
    try {
      const stored = await AsyncStorage.getItem(INTERESTS_STORAGE_KEY);
      if (stored) {
        setInterestsState(JSON.parse(stored));
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }

  async function setInterests(newInterests: InterestCategory[]) {
    await AsyncStorage.setItem(INTERESTS_STORAGE_KEY, JSON.stringify(newInterests));
    setInterestsState(newInterests);
  }

  if (!loaded) return null;

  return (
    <InterestsContext.Provider
      value={{
        interests,
        hasSelectedInterests: interests.length > 0,
        setInterests,
      }}
    >
      {children}
    </InterestsContext.Provider>
  );
}

export function useInterests() {
  const context = useContext(InterestsContext);
  if (!context) {
    throw new Error("useInterests must be used within an InterestsProvider");
  }
  return context;
}
