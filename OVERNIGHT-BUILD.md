# Overnight Build Plan — Mar 10-11, 2026

## 1. Splash Screen & Branding
- Create a proper splash/loading screen with the crunchy brand
- Forest green background, elegant "crunchy" wordmark in cream/white with Georgia font
- Leaf/sprout icon animation
- Smooth fade transition into the app

## 2. Beautiful Onboarding Flow
- Page 1: Welcome screen with nature imagery gradient, "Welcome to Crunchy" in serif
- Page 2: "What is Crunchy?" - brief explanation with cute illustrations (emoji-based)
- Page 3: Concern preferences (toxins to body, environmental, animal testing, etc.) - toggle cards
- Page 4: Quick profile setup (name, avatar emoji picker)
- Smooth swipe between pages with dot indicators
- "Skip" option and "Get Started" CTA
- Store onboarding completion in AsyncStorage so it only shows once

## 3. Scan History (Auto-Save Every Scan)
- Every successful scan automatically saves to AsyncStorage scan history
- Data structure: { id, productName, brand, category, rating, crunchyScore, scanData, scannedAt, imageUri? }
- Home screen: "Recent Scans" section showing last 5 scans as horizontal scroll cards
- Scan tab: "Recent Scans" list below the camera area, showing all past scans
- Tapping a history item opens the full scan result (reuse existing result screen)
- Create lib/scanHistory.ts with getScanHistory, addToHistory, clearHistory

## 4. Barcode Scanner Mode
- Add a 4th scan mode tab: "Barcode" alongside Item, Ingredients, Label
- Use expo-camera's barcode scanning capability (already available in CameraView)
- When barcode detected:
  1. First try Open Food Facts API (free, no key needed): https://world.openfoodfacts.org/api/v2/product/{barcode}.json
  2. If found: extract product name, brand, ingredients, nutrition
  3. Pass the real ingredient list to Gemini for crunchy analysis
  4. If not found in Open Food Facts: show the barcode number and ask Gemini to identify
- This gives us REAL ingredient data for food products!

## 5. Share Scan Results
- Add "Share" button on scan result screen (next to Save)
- Use expo-sharing + react-native-view-shot to capture a shareable card
- Card design: forest green header with product name + score, ingredient summary, "Scanned with Crunchy 🌿" branding
- Also allow copying a text summary to clipboard

## 6. Polish & Bug Fixes
- Remove debug text from error screen ("Debug: ...")
- Add skeleton loading states for scan processing
- Improve the processing animation (currently just a spinner?)
- Add haptic feedback on all interactive elements consistently
- Fix the "1 days" text (should be "1 day" singular)
- Make sure all screens have the white card + thin border style consistently
- Add pull-to-refresh on home screen
- Empty states should have encouraging CTAs

## 7. Home Screen Improvements
- Show recent scan history cards (horizontal scroll)
- Quick stats: "X products scanned", "Average crunchy score: Y"
- Daily tip card (hardcoded array of clean living tips, rotate daily)
- Getting started checklist that tracks progress (scan first product, take quiz, save a product)

## Technical Notes
- App is React Native/Expo with NativeWind (Tailwind CSS)
- Design: forest green (#3D5A3E), cream (#FAF8F5), ivory (#FFFDF8), white cards with thin borders
- Headings: fontFamily: 'Georgia'
- CameraView does NOT support children - use absolute positioning for overlays
- expo-camera v17 is installed
- AsyncStorage is available for persistence
- Gemini API key is in .env as EXPO_PUBLIC_GEMINI_API_KEY
- Model: gemini-2.5-flash with responseMimeType: "application/json" and thinkingBudget: 0

## File Structure
- lib/scanHistory.ts (new)
- lib/barcodeLookup.ts (new) 
- lib/shareUtils.ts (new)
- app/onboarding-preferences.tsx (new or modify existing onboarding.tsx)
- app/splash.tsx (new)
- Modify: app/(tabs)/index.tsx, app/(tabs)/scan.tsx, app/product-scan.tsx, app/scan-result.tsx
