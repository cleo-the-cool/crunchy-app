import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  DEFAULT_PREFERENCES,
  migrateLegacyConcerns,
  type UserPreferences,
} from "@/lib/scoring";

const NEW_PREFS_KEY = "@crunchy_user_preferences";
const OLD_PREFS_KEY = "@crunchy_scan_preferences";

export interface PreferenceOption {
  key: keyof UserPreferences;
  label: string;
  description: string;
  icon: string;
}

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  {
    key: "toxins",
    label: "Toxins & Chemicals",
    description: "Harmful additives, carcinogens, endocrine disruptors",
    icon: "🧪",
  },
  {
    key: "nutrition",
    label: "Nutrition Quality",
    description: "Processing level, added sugars, nutritional value",
    icon: "🥗",
  },
  {
    key: "animal_welfare",
    label: "Animal Welfare",
    description: "Animal testing, cruelty-free, ethical sourcing",
    icon: "🐰",
  },
  {
    key: "sustainability",
    label: "Sustainability",
    description: "Environmental impact, packaging, carbon footprint",
    icon: "🌍",
  },
  {
    key: "fair_trade",
    label: "Fair Trade",
    description: "Labor practices, fair wages, ethical supply chain",
    icon: "🤝",
  },
];

interface PreferencesContextType {
  preferences: UserPreferences;
  setPreference: (key: keyof UserPreferences, value: number) => Promise<void>;
  setAllPreferences: (prefs: UserPreferences) => Promise<void>;
  isLoaded: boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: DEFAULT_PREFERENCES,
  setPreference: async () => {},
  setAllPreferences: async () => {},
  isLoaded: false,
});

async function syncToSupabase(prefs: UserPreferences): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      preferences: prefs,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  } catch {
    // non-blocking
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      // Try Supabase first if authenticated
      if (isSupabaseConfigured()) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from("user_preferences")
              .select("preferences")
              .eq("user_id", user.id)
              .limit(1)
              .single();
            if (data?.preferences) {
              const prefs = { ...DEFAULT_PREFERENCES, ...data.preferences } as UserPreferences;
              setPreferencesState(prefs);
              await AsyncStorage.setItem(NEW_PREFS_KEY, JSON.stringify(prefs));
              setIsLoaded(true);
              return;
            }
          }
        } catch {
          // fall through to local
        }
      }

      // Check for new preferences in AsyncStorage
      const stored = await AsyncStorage.getItem(NEW_PREFS_KEY);
      if (stored) {
        setPreferencesState({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
        setIsLoaded(true);
        return;
      }

      // Migrate legacy boolean concerns if they exist
      const oldStored = await AsyncStorage.getItem(OLD_PREFS_KEY);
      if (oldStored) {
        const legacyConcerns = JSON.parse(oldStored);
        const migrated = migrateLegacyConcerns(legacyConcerns);
        setPreferencesState(migrated);
        await AsyncStorage.setItem(NEW_PREFS_KEY, JSON.stringify(migrated));
        await AsyncStorage.removeItem(OLD_PREFS_KEY);
        syncToSupabase(migrated);
        setIsLoaded(true);
        return;
      }
    } catch {
      // use defaults
    }
    setIsLoaded(true);
  }

  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    setPreferencesState(prefs);
    await AsyncStorage.setItem(NEW_PREFS_KEY, JSON.stringify(prefs));
    syncToSupabase(prefs);
  }, []);

  const setPreference = useCallback(async (key: keyof UserPreferences, value: number) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(NEW_PREFS_KEY, JSON.stringify(updated));
      syncToSupabase(updated);
      return updated;
    });
  }, []);

  const setAllPreferences = useCallback(async (prefs: UserPreferences) => {
    await savePreferences(prefs);
  }, [savePreferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreference, setAllPreferences, isLoaded }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

// Re-export types for convenience
export type { UserPreferences };
