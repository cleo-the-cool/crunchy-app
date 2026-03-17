# UI Fixes Batch 2

## 1. Saved Products Icons
In `app/(tabs)/profile.tsx`, the saved products list shows 📦 for everything. 
- Map the product `category` field to appropriate emojis:
  - Food: 🍎, Drinks: 🥤, Skincare: 🧴, Makeup: 💄, Cleaning: 🧹, Clothing: 👕, Home: 🏠, Other: 📦
- Also: when saving products (in scan-result.tsx and product-scan.tsx), make sure the `category` from Gemini response is saved to the SavedProduct

## 2. Fix Rating Derivation
The rating badge (Clean/Caution/Avoid) should be derived from the crunchy score, NOT from Gemini's raw response.
- Import `getRatingFromScore` from `@/lib/savedProducts`
- In all places where rating badge is displayed, use: `getRatingFromScore(crunchyScore)` instead of the raw `rating` field
- Score >= 70: "clean" (green), Score 40-69: "caution" (yellow), Score < 40: "avoid" (red)
- Apply this in: profile.tsx saved products, scan-result.tsx header, product-scan.tsx result state

## 3. "Scanned with Crunchy" Font
In the share card view (scan-result.tsx), the "Scanned with Crunchy 🌿" text uses a bad font.
- Change to use `fontFamily: 'Georgia'` for "Crunchy" and make it italic
- Or just use system font but make it elegant: medium weight, slightly larger

## 4. "Your Crunchy Card" Font
In profile.tsx, the "CRUNCHY" text in the card uses a weird gothic font.
- Change to use `fontFamily: 'Georgia'` with letter spacing, or just clean sans-serif with tracking

## 5. Recent Scans on Profile
The "Recent Scans" section shows "No scans yet" even though saved products exist. 
- Recent scans should pull from `lib/scanHistory.ts` (getScanHistory), NOT from saved products
- Make sure scan-result.tsx and product-scan.tsx actually call `addToHistory()` when a scan completes

## 6. Explore Page - Make Search Work
The search returns "Nothing found" for everything. Currently it searches local dummy data (which is empty).
- Option A: Search should query Gemini to analyze a product by name (text-only, no image)
- Option B: Search the user's scan history + saved products
- Best: Do BOTH. First search local saved/scanned products, then offer "Ask Crunchy about [query]" button that sends the product name to Gemini for analysis
- In `services/gemini.ts`, add a function `analyzeProductByName(name: string)` that sends just text to Gemini with the same JSON response format
- This lets users look up "Clinique Black Honey" without scanning it

## 7. Scanner Tab Switcher Styling
The pill tabs at the top of the scan screen (Item / Ingredients / Label) have mixed rounded/square styling.
- Make them all consistently rounded-full pill shape
- Active: forest green bg, white text
- Inactive: white bg, thin border, dark text
- Remove the barcode tab entirely (already removed from SCAN_MODES array)

## 8. Explore Page Category Grid
- Remove the emoji-based category grid (Food 🥑, Skincare 🧴, etc.) since there's no data behind it
- Replace with a clean, minimal layout: just the search bar + "Search any product" subtitle
- Below search: show "Recently Searched" (from AsyncStorage) or "Popular Categories" as text-only clean chips
- Results should show in white cards with thin borders

## Technical Notes
- Design: forest green (#3D5A3E), cream (#FAF8F5), white cards with borderWidth:1, borderColor:'rgba(0,0,0,0.12)'
- Headings: fontFamily: 'Georgia'
- Test compilation: npx expo export --platform ios
