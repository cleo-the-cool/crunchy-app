# Scanner & Feature Improvements Plan

## Bug Fixes

### 1. JSON Parse Error (intermittent)
- The `responseMimeType: "application/json"` was added but Gemini 2.5 Flash with thinking mode still sometimes returns malformed JSON
- Fix: Also add `"thinkingConfig": {"thinkingBudget": 0}` to the generation config to disable thinking entirely
- In `parseGeminiResponse()`, add multiple fallback strategies:
  - Try parsing raw text first
  - Try extracting ```json blocks
  - Try finding first `{` to last `}` and parsing that
  - If all fail, log the raw response for debugging

### 2. Clothing/Non-Food Items Not Identified
- The scan prompt needs to explicitly handle clothing, textiles, accessories
- Update `SCAN_PROMPTS.item` to mention: food, drinks, cosmetics, skincare, cleaning products, clothing/textiles, water bottles, cookware, furniture, baby products, etc.
- For clothing: analyze fabric composition, dyes, treatments (formaldehyde, PFAS, etc.)
- For drinkware/cookware: analyze materials (stainless steel grades, BPA, lead, cadmium)

### 3. "Doesn't have access to full ingredient list" disclaimer
- Remove any language saying the AI "doesn't have access to" ingredients
- The prompt should instruct Gemini to analyze what it CAN see in the image and use its knowledge base for the product
- If it's a known product (like Owala water bottle), use built-in knowledge about materials and manufacturing

### 4. Stainless Steel / Material Analysis
- Update prompt to analyze material safety in depth:
  - Stainless steel grades (304 vs 316 vs 201 - lead/nickel content differs)
  - BPA/BPS in plastics
  - Lead in ceramics
  - PFAS in textiles
  - Microplastics risk

### 5. Crunchy Score Refinement
- Score should be 1-100 where:
  - 90-100: Truly clean/organic/certified safe
  - 70-89: Mostly clean with minor concerns
  - 50-69: Moderate concerns, some questionable ingredients
  - 30-49: Significant concerns
  - 1-29: Major toxicity/health risks
- A stainless steel water bottle shouldn't score 90+ unless it's verified 18/8 or 18/10 grade

## New Features

### 6. Concern Preferences (Onboarding + Settings)
Add user preferences for what they care about. In `contexts/AuthContext.tsx` or a new `contexts/PreferencesContext.tsx`:

```typescript
interface CrunchyPreferences {
  // What concerns matter to the user
  concerns: {
    toxinsToBody: boolean;      // chemicals that harm YOUR body (default: true)
    environmentalHarm: boolean;  // environmental impact (default: true)
    animalTesting: boolean;      // animal cruelty (default: true)
    processedIngredients: boolean; // highly processed/artificial (default: true)
    allergens: boolean;          // common allergens (default: false)
    sustainability: boolean;     // packaging, sourcing (default: false)
  };
}
```

- Add a new onboarding screen after interests.tsx: "What matters to you?"
  - Show toggle cards for each concern category with icons
  - Clean, on-brand UI matching the existing onboarding style
- Add to Settings screen: "Scan Preferences" section where users can toggle these
- Pass these preferences to the Gemini prompt so the analysis focuses on what the user cares about
- The crunchy score should WEIGHT based on preferences:
  - If user only cares about "toxins to body", environmental harm shouldn't tank the score
  - If user cares about everything, all factors weigh equally
- Store preferences in AsyncStorage (and later Supabase `user_preferences` table)

### 7. Saved Products Organization
In the Profile screen's "Saved Products" section:

- Group saved products by category: Food, Drinks, Skincare, Makeup, Cleaning, Clothing, Home, Other
- Show category tabs/chips at the top of the saved section
- Each saved product shows as a card with: name, brand, rating badge, crunchy score
- Tapping a saved product opens a detail modal/bottom sheet showing:
  - Product name + brand
  - Crunchy score circle
  - Rating (clean/caution/avoid)
  - Ingredient list with risk indicators
  - Concerns
  - Clean alternatives
  - "Unsave" button
- The scanData field in SavedProduct already stores the full analysis, so this data is available

## Implementation Order
1. Fix Gemini prompt + JSON parsing (highest priority - scanner must work reliably)
2. Fix score calibration
3. Add concern preferences (onboarding screen + settings)
4. Update Gemini prompt to use preferences
5. Organize saved products by category with detail view

## Files to Modify
- `services/gemini.ts` - prompt, parsing, generation config
- `app/product-scan.tsx` - error handling improvements
- `app/onboarding.tsx` or new `app/onboarding-preferences.tsx` - new preference screen
- `app/settings.tsx` - add preference toggles
- `app/(tabs)/profile.tsx` - saved products organization + detail modal
- `lib/savedProducts.ts` - add category field, ensure scanData is saved
- `contexts/PreferencesContext.tsx` (new) - preference state management
- `lib/preferences.ts` (new) - AsyncStorage helpers for preferences
