import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_STORAGE_KEY = "@crunchy_scan_preferences";

export interface CrunchyConcerns {
  toxinsToBody: boolean;
  environmentalHarm: boolean;
  animalTesting: boolean;
  processedIngredients: boolean;
  allergens: boolean;
  sustainability: boolean;
}

export const DEFAULT_CONCERNS: CrunchyConcerns = {
  toxinsToBody: true,
  environmentalHarm: true,
  animalTesting: true,
  processedIngredients: true,
  allergens: false,
  sustainability: false,
};

export interface ConcernOption {
  key: keyof CrunchyConcerns;
  label: string;
  description: string;
  icon: string;
}

export const CONCERN_OPTIONS: ConcernOption[] = [
  {
    key: "toxinsToBody",
    label: "Toxins & Chemicals",
    description: "Chemicals that can harm your body",
    icon: "☠️",
  },
  {
    key: "environmentalHarm",
    label: "Environmental Impact",
    description: "Pollution, deforestation, carbon footprint",
    icon: "🌍",
  },
  {
    key: "animalTesting",
    label: "Animal Welfare",
    description: "Animal testing and cruelty",
    icon: "🐰",
  },
  {
    key: "processedIngredients",
    label: "Processed Ingredients",
    description: "Highly processed or artificial ingredients",
    icon: "🧪",
  },
  {
    key: "allergens",
    label: "Allergens",
    description: "Common allergens and sensitivities",
    icon: "⚠️",
  },
  {
    key: "sustainability",
    label: "Sustainability",
    description: "Packaging, sourcing, and supply chain",
    icon: "♻️",
  },
];

interface PreferencesContextType {
  concerns: CrunchyConcerns;
  setConcerns: (concerns: CrunchyConcerns) => Promise<void>;
  toggleConcern: (key: keyof CrunchyConcerns) => Promise<void>;
  isLoaded: boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
  concerns: DEFAULT_CONCERNS,
  setConcerns: async () => {},
  toggleConcern: async () => {},
  isLoaded: false,
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [concerns, setConcernsState] = useState<CrunchyConcerns>(DEFAULT_CONCERNS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const stored = await AsyncStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConcernsState({ ...DEFAULT_CONCERNS, ...parsed });
      }
    } catch {
      // use defaults
    }
    setIsLoaded(true);
  }

  const setConcerns = useCallback(async (newConcerns: CrunchyConcerns) => {
    setConcernsState(newConcerns);
    await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(newConcerns));
  }, []);

  const toggleConcern = useCallback(async (key: keyof CrunchyConcerns) => {
    setConcernsState((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <PreferencesContext.Provider value={{ concerns, setConcerns, toggleConcern, isLoaded }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

/** Build a prompt suffix describing which concerns the user cares about for Gemini scoring */
export function buildConcernsPrompt(concerns: CrunchyConcerns): string {
  const active = CONCERN_OPTIONS.filter((o) => concerns[o.key]).map((o) => o.label);
  const inactive = CONCERN_OPTIONS.filter((o) => !concerns[o.key]).map((o) => o.label);

  if (active.length === 0) return "";
  if (inactive.length === 0) return "\nWeight all concern categories equally in the crunchy score.";

  return `\nThe user specifically cares about: ${active.join(", ")}.
The user does NOT prioritize: ${inactive.join(", ")}.
Weight the crunchy score heavily toward the user's concerns. Issues in non-prioritized categories should have minimal impact on the score.

CRITICAL - FILTER YOUR OUTPUT BY USER PREFERENCES:
- The "concerns" array should ONLY contain concerns relevant to the user's selected categories: ${active.join(", ")}.
- Do NOT include concerns about categories the user did not select (${inactive.join(", ")}).
- Only flag ingredients as "concern" or "toxic" if the issue relates to the user's selected categories.
- For example: if the user only selected "Toxins & Chemicals", do NOT flag high sugar, high sodium, calorie content, or environmental issues as concerns — those belong to other categories the user did not select.
- Keep the analysis focused: irrelevant category concerns should not appear in the output at all.`;
}
