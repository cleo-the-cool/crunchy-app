# Crunchy App - Tonight's Build Sprint

## Overview
Build out the full Crunchy app: Supabase integration, scanner with Gemini Vision, onboarding quiz, recipes, community features, and UI polish.

## Environment
- React Native / Expo SDK 54
- NativeWind (Tailwind for RN)
- Supabase for backend
- Gemini 2.0 Flash for image analysis
- Env vars in .env file

## Stories

### Story 1: Supabase Client Setup
Create `lib/supabase.ts` with Supabase client initialization using EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY from env vars. Install @supabase/supabase-js. Create React context for auth state. Replace the mock auth in `contexts/AuthContext.tsx` with real Supabase auth (email/password signup + login). Auto-create profile on signup via the database trigger (already in SQL schema).

### Story 2: Privacy Policy, ToS, Help & Support
- Create `app/privacy-policy.tsx` with a real privacy policy for a product scanning app (data collection, Gemini API usage, no selling data)
- Create `app/terms-of-service.tsx` with terms of service
- Add ToS checkbox to signup flow (must agree before creating account)
- Build out `app/help-support.tsx` with FAQ and contact email: cleothecoolest@proton.me
- Link all from settings page

### Story 3: Dev Coupon "COOL"
Add a coupon code input in the paywall/subscription screen. If user enters "COOL" (case insensitive), bypass the paywall and grant premium access. Store in user profile.

### Story 4: Scanner with Gemini Vision
The scanner already has 3 modes (item/ingredients/label). Ensure the `services/gemini.ts` service:
- Takes a base64 image + scan mode
- Sends to Gemini 2.0 Flash vision API
- Returns: product name, brand, category, ingredients with safety scores, overall score, concerns, clean alternatives
- Caches result in Supabase `products` table (so repeat scans are instant)
- Saves scan to user's `scans` table
- Falls back to mock data if no API key

### Story 5: Crunchy Score & Tiers
- Calculate score based on: scan history (80%) + recipes tried (20%) + quiz baseline (decays: 100% at start → 0% after 1 year)
- Community engagement does NOT affect score
- Tiers: 🌱 Seedling (0-25), 🌿 Sprout (26-50), 🌳 Sapling (51-75), 🌸 In Bloom (76-100)
- Display score prominently on profile
- Make score card screenshotable (nice visual card with tier, score, stats)

### Story 6: Onboarding Quiz
- After signup, before main app: extended onboarding flow
- Steps: display name → avatar (pick from presets) → "How Crunchy Are You?" quiz
- 5-7 fun questions like: "Do you read ingredient labels?", "What's your go-to skincare?", "Organic or conventional?", "Ever made your own cleaning products?"
- Calculate initial crunchy score from answers
- Show result with tier and fun message
- Pick interests (skincare, food, cleaning, fashion, home, baby)
- "Share your score" button (generates shareable link/image)
- Save quiz answers + score to profile in Supabase

### Story 7: Recipe Library
- Create `services/recipes.ts` with 50+ curated recipes across categories:
  - DIY Cleaning (15+): all-purpose cleaner, glass cleaner, laundry detergent, dish soap, etc.
  - Skincare (15+): face masks, body scrubs, lip balm, toner, moisturizer, etc.
  - Cooking (15+): healthy meals, snacks, smoothies, dressings, etc.
  - Home (5+): candles, air freshener, pest repellent, etc.
- Each recipe: title, description, ingredients list, step-by-step instructions, difficulty, prep time, image placeholder
- Recipes should be REAL and GOOD (researched, not made up)
- Recipe search by title, category, ingredient
- Save recipe to favorites (saved_recipes table)
- Recipe detail page with nice UI

### Story 8: Community Features
- Community feed: list of posts with user avatar, content, image, likes, comments count
- Create post (text + optional photo upload to Supabase Storage)
- Like/unlike posts
- Comment on posts
- User profiles: display name, avatar, bio, crunchy score, total scans, tier badge
- Follow/unfollow users
- Basic content moderation: report button on posts/comments
- Post types: general, review, tip, recipe, question

### Story 9: Storefronts / User Lists
- Users can create lists (like playlists but for products)
- Public or private
- Add scanned products to lists
- Browse other users' public lists
- Categories: skincare routine, grocery list, cleaning supplies, etc.

### Story 10: UI Polish
- Ensure mobile UI isn't cluttered
- Clean navigation (no multi-press back button issue)
- Search should include recipes AND products
- Weekly digest marked as "Coming Soon" in settings
- Consistent design: rounded-2xl, sage/green crunchy aesthetic
- Remove "Scan Alerts" feature if not built out

## Technical Notes
- Use expo-router for navigation
- NativeWind for styling (Tailwind classes)
- All data goes to Supabase
- Images uploaded to Supabase Storage
- Gemini API for scanning, key in env
- No em-dashes anywhere in copy
- Keep the existing app structure, improve don't rewrite
