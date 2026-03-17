# UI Fixes Batch 3 - From Maddy's Voice Feedback

## 1. Explore Page - Gemini-Powered Search
The explore search should query Gemini when the user searches a product name.
- When user types a query and submits, call `analyzeProductByName(query)` from services/gemini.ts
- Show a loading state while querying
- Display the result in the same format as a scan result
- Below the search bar, show recent searches (save to AsyncStorage)
- Remove the category grid (Food, Skincare, etc.) since there's no data behind it
- Remove "Featured Recipes" and "Popular Products" sections (no data)
- Just: search bar → recent searches → results

The `analyzeProductByName` function should:
- Send the product name as text to Gemini (no image)
- Use the same JSON response schema as the scanner
- Return the same ProductAnalysis type
- Handle errors gracefully

## 2. Concern Preferences Before Scan
Add a way to select concern focus before/during scanning:
- On the scan screen (scan.tsx), add a small chip/pill row below the mode tabs: "All Concerns" | "Body Toxins" | "Environmental" | "Quick Scan"
- Tapping one changes what the Gemini prompt focuses on
- Pass the selected concern to the analyzeWithGemini function
- In gemini.ts, modify the prompt based on selected concern:
  - "All Concerns": current full analysis
  - "Body Toxins": focus only on chemicals harmful to human health, ignore environmental
  - "Environmental": focus on environmental impact, sustainability
  - "Quick Scan": shortened analysis, just product name + score + top 3 concerns
- Store the default preference from onboarding/settings

## 3. Fix Scan History
Make sure every successful scan is saved to history:
- In product-scan.tsx: after a successful Gemini response, call `addToHistory()` with the analysis data
- In scan-result.tsx: same thing for the barcode/search results
- On the home screen and profile, pull from `getScanHistory()` to show recent scans
- The home screen "Recent Scans" section should show actual scan history, not be empty

## 4. Scan Tab Styling
Make the mode selector tabs (Item / Ingredients / Label) consistently styled:
- All rounded-full pill shape
- Active: forest green (#3D5A3E) bg, white text, no border
- Inactive: white bg, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)', dark text
- Same height, same padding
- No barcode tab

## 5. Clean Up Explore Page
- Remove empty "Featured Recipes" section
- Remove empty "Popular Products" section  
- Remove category grid with emojis
- Simple layout: Search bar → "Search any product by name" subtitle → Results/Recent searches
- White card style for search results

## Technical Notes
- Design: forest green (#3D5A3E), white cards with borderWidth:1, borderColor:'rgba(0,0,0,0.12)'
- Headings: fontFamily: 'Georgia'
- Test compilation: npx expo export --platform ios
