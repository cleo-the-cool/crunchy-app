# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- Settings page uses local helper components: `SectionHeader`, `Divider`, `SettingsRow`, `SettingsToggle` (defined at bottom of file)
- Card shadow style is a shared const `cardShadow` in each screen (inline style, not NativeWind)
- New screens are auto-routed by Expo Router via filename in `app/` directory
- Header pattern: `SafeAreaView bg-cream` > `View flex-row items-center px-5 pt-2 pb-4` > back arrow + title
- Auth context is still mock (AsyncStorage-based) despite STORY-001 being marked complete
- ESLint config is broken (pre-existing issue with eslint/package.json exports) - only TypeScript check (`tsc --noEmit`) works reliably
- Supabase client is at `lib/supabase.ts` - use `isSupabaseConfigured()` to check if env vars are set before making calls
- Gemini category strings (Skincare, Food, etc.) must be mapped to DB enum (cosmetics, food, etc.) via `mapToDbCategory()`
- Supabase errors in scan flow are silently caught - never block the user from getting scan results
- Crunchy Score logic is centralized in `lib/crunchyScore.ts` - use `getTierInfo()`, `getMockStats()`, `buildCrunchyStats()` - do NOT duplicate getScoreLabel in screens
- ScoreCard component (`components/ScoreCard.tsx`) is screenshotable via ViewShot - uses `utils/view-shot` shim and `utils/sharing`
- Quiz score is stored in AsyncStorage under `@crunchy_quiz_score` key as `{ score, completedAt }` - used by crunchyScore lib for baseline calculation
- Onboarding profile data (displayName, avatar) stored in AsyncStorage under `@crunchy_onboarding_profile`
- Post-signup flow: signup → `/onboarding-profile` → `/quiz` → `/quiz-result` → `/interests` → `/(tabs)`
- `quiz-result.tsx` uses centralized `getTierInfo()` from `lib/crunchyScore.ts` - do NOT use local getScoreLabel
- Saved recipes persisted to AsyncStorage under `@crunchy_saved_recipes` key as string array of recipe IDs
- Recipe data lives in `data/recipes.ts` (not `services/recipes.ts`) - screens import from `@/data/recipes`
- Recipe search includes ingredient name matching in addition to title/category/description
- Community data model lives in `data/community.ts` - types: `CommunityPost`, `CommunityUser`, `Comment`, `PostType`
- Post types: general, review, tip, recipe, question - config in `POST_TYPE_CONFIG` with emoji/label/color
- User profiles viewable at `/user-profile?userId=<id>` - shows avatar, bio, score, tier, scans, followers, posts
- Report functionality uses `Alert.alert` confirmation pattern (no backend yet)
- Lists data model lives in `data/lists.ts` - types: `ProductList`, `ListProduct`, `ListCategory`
- List categories config in `LIST_CATEGORY_CONFIG` with emoji/label/color per category
- Lists browsing at `/lists`, detail at `/list-detail?id=<id>`, create at `/create-list`
- Profile screen has "My Lists" and "Browse Lists" quick action buttons linking to `/lists`

---

## 2026-03-06 - STORY-002
- Implemented Privacy Policy, Terms of Service, and Help & Support pages
- Added ToS checkbox to signup flow (validation prevents account creation without agreement)
- Linked all three pages from Settings "About" section
- Files changed:
  - `app/privacy-policy.tsx` (new) - Full privacy policy covering data collection, Gemini API usage, no-sell policy
  - `app/terms-of-service.tsx` (new) - 13-section ToS covering scanning disclaimers, community guidelines, subscriptions
  - `app/help-support.tsx` (new) - Contact card + 8 expandable FAQ items
  - `app/signup.tsx` (modified) - Added `agreedToTerms` state, validation, and checkbox with links to ToS/Privacy Policy
  - `app/settings.tsx` (modified) - Wired up router.push for Privacy Policy, ToS, and Help & Support
  - `prd.json` (modified) - Marked STORY-002 as passes: true
- **Learnings:**
  - Expo Router file-based routing means just creating a file in `app/` makes it navigable
  - The signup form uses inline validation with error state object pattern `errors: { field?: string }`
  - Settings links were already TouchableOpacity wrappers, just needed `onPress` with `router.push`
  - Contact email for the project: cleothecoolest@proton.me
---

## 2026-03-06 - STORY-003
- Added coupon code input to the paywall/subscription screen (`app/paywall.tsx`)
- Text input with "Apply" button placed between the subscribe CTA and "Restore purchases" link
- Entering "COOL" (case insensitive) calls `subscribe("premium")` via SubscriptionContext, granting full premium access stored in AsyncStorage
- Invalid codes show inline error message, which clears on next input change
- Files changed:
  - `app/paywall.tsx` (modified) - Added TextInput, coupon state, handleApplyCoupon logic, and coupon UI section
  - `prd.json` (modified) - Marked STORY-003 as passes: true
- **Learnings:**
  - SubscriptionContext.subscribe() persists tier to AsyncStorage under `@crunchy_subscription` key - no Supabase integration yet
  - Paywall uses `useSubscription()` hook which provides `subscribe(tier)` for changing subscription level
  - The paywall bottom CTA area is outside the ScrollView in a fixed footer `View` with `bg-cream`
---

## 2026-03-06 - STORY-004
- Implemented Supabase integration for scanner: product caching + scan history saving
- Created `lib/supabase.ts` Supabase client (was missing prerequisite from STORY-001)
- Added `analyzeAndSaveScan()` as new main entry point for scanner screens - wraps Gemini analysis + Supabase caching/saving
- Product caching: after analysis, upserts to `products` table by name+brand, stores full gemini_analysis as JSONB
- Scan history: saves each scan to `scans` table linked to user and product
- All Supabase operations silently catch errors so scan flow never breaks even without Supabase configured
- Falls back to mock data when no Gemini API key (existing behavior preserved)
- Files changed:
  - `lib/supabase.ts` (new) - Supabase client with AsyncStorage auth persistence
  - `services/gemini.ts` (modified) - Added cacheProduct, saveScan, findCachedProduct, analyzeAndSaveScan, mapToDbCategory
  - `app/product-scan.tsx` (modified) - Uses analyzeAndSaveScan with user ID from AuthContext
  - `app/label-scan.tsx` (modified) - Uses analyzeAndSaveScan with user ID from AuthContext
- **Learnings:**
  - Supabase products table category enum uses lowercase: food, cosmetics, cleaning, baby, clothing, supplement, other
  - Gemini prompts return categories like "Skincare", "Food", "Personal Care" which must be mapped to DB enum
  - Auth context user.id is a string (mock uses Date.now().toString()), but Supabase scans.user_id is uuid - will need alignment when real auth is wired up
  - The `@supabase/supabase-js` package was already installed but no client existed
  - Camera screens import from `@/contexts/AuthContext` for user ID access
---

## 2026-03-06 - STORY-005
- Implemented Crunchy Score calculation engine and tier system
- Created screenshotable ScoreCard component with ViewShot + share support
- Centralized score/tier logic (removed duplicate `getScoreLabel()` from profile and home screens)
- Files changed:
  - `lib/crunchyScore.ts` (new) - Score calculation: scan history 80% + recipes 20% + quiz baseline with 1-year decay. Tier mapping, mock stats, `buildCrunchyStats()` for real data.
  - `components/ScoreCard.tsx` (new) - Screenshotable card with tier emoji, score circle, stats row, share button. Uses ViewShot for screenshot capture.
  - `components/index.ts` (modified) - Exported ScoreCard
  - `app/(tabs)/profile.tsx` (modified) - Replaced hardcoded MOCK_STATS and old getScoreLabel with centralized scoring. Added ScoreCard component prominently on profile.
  - `app/(tabs)/index.tsx` (modified) - Replaced hardcoded MOCK_STATS and old getScoreLabel with centralized scoring from lib/crunchyScore.ts.
  - `prd.json` (modified) - Marked STORY-005 as passes: true
- **Learnings:**
  - `getScoreLabel()` was duplicated in profile.tsx and index.tsx with DIFFERENT tier mappings - centralization was critical
  - ViewShot pattern: import from `../utils/view-shot` (shim), share via `../utils/sharing` (shim). Both handle web fallback.
  - Tier colors in the PRD differ from old code: old used "Fully Rooted/Thriving/Blooming", PRD specifies "Seedling/Sprout/Sapling/In Bloom" with plant emojis
  - Score formula uses `buildCrunchyStats()` for real data, `getMockStats()` for dev/demo. When Supabase auth is wired up, screens should switch to querying real scan/recipe counts.
  - quiz-result.tsx has its own `getScoreLabel()` - left it alone as it's STORY-006 scope
---

## 2026-03-06 - STORY-006
- Implemented full onboarding quiz flow after signup
- Created `app/onboarding-profile.tsx` - display name editing + emoji avatar picker with 12 presets
- Updated `app/quiz-result.tsx` - replaced local `getScoreLabel()` with centralized `getTierInfo()` from `lib/crunchyScore.ts`, added quiz score saving to AsyncStorage + Supabase, conditional routing (post-signup goes to interests, pre-signup goes to signup)
- Updated `app/signup.tsx` - routes to `/onboarding-profile` instead of `/interests`
- Updated `app/_layout.tsx` - added `onboarding-profile` to auth flow segments
- Updated `prd.json` - marked STORY-006 as passes: true
- Files changed:
  - `app/onboarding-profile.tsx` (new) - Profile setup with display name + avatar picker
  - `app/quiz-result.tsx` (modified) - Centralized tiers, score persistence, conditional routing
  - `app/signup.tsx` (modified) - Routes to onboarding-profile post-signup
  - `app/_layout.tsx` (modified) - Added onboarding-profile to auth segments
  - `prd.json` (modified) - Marked STORY-006 as complete
- **Learnings:**
  - The existing quiz.tsx already had 10 well-crafted questions with score normalization - no changes needed
  - Quiz score persistence uses `@crunchy_quiz_score` AsyncStorage key with `{ score, completedAt }` format
  - Supabase profile update for quiz_score silently catches errors (consistent with scan flow pattern)
  - quiz-result.tsx now detects post-signup vs pre-signup flow via `useAuth().user` to show appropriate CTA buttons
  - Avatar presets use emojis (consistent with app-wide emoji pattern) stored in `@crunchy_onboarding_profile`
---

## 2026-03-06 - STORY-007
- Expanded recipe library from 31 to 62 curated recipes across 6 categories
- Added "Cooking" category (15 recipes): smoothies, overnight oats, grain bowls, pancakes, stir-fry, homemade granola, almond milk, etc.
- Added 8 more Cleaning recipes (total 15): laundry detergent, fabric softener, oven cleaner, drain unclogger, carpet deodorizer, etc.
- Added 8 more Skincare recipes (total 15): vitamin C serum, clay mask, night cream, avocado mask, after-sun gel, etc.
- Added ingredient search to search/filter functions (recipes.tsx inline filter + data/recipes.ts searchRecipes + filterRecipes)
- Persisted saved/favorited recipes to AsyncStorage (`@crunchy_saved_recipes`) in both recipes.tsx and recipe-detail.tsx
- Recipe detail screen now loads saved state from AsyncStorage on mount
- Files changed:
  - `data/recipes.ts` (modified) - Added Cooking category type, 31 new recipes, ingredient search in searchRecipes/filterRecipes
  - `app/recipes.tsx` (modified) - Added AsyncStorage persistence for saved recipes, ingredient search in inline filter
  - `app/recipe-detail.tsx` (modified) - Added AsyncStorage persistence for save/unsave with load on mount
  - `prd.json` (modified) - Marked STORY-007 as passes: true
- **Learnings:**
  - Recipe data is in `data/recipes.ts` not `services/recipes.ts` - both screens import from `@/data/recipes`
  - Existing recipe screens (recipes.tsx, recipe-detail.tsx) were already well-built with search, filters, category tabs, and detail UI
  - Saved recipes use `@crunchy_saved_recipes` AsyncStorage key as a JSON string array of recipe IDs
  - The recipes.tsx screen was missing the Cooking category in the type union - adding it to the type auto-enabled the category tab
  - Recipe cards already had save/bookmark UI, just needed persistence layer
---

## 2026-03-06 - STORY-008
- Implemented full community features: post types, user profiles, follow/unfollow, content moderation
- Extended `data/community.ts` with `PostType` (general/review/tip/recipe/question), `CommunityUser` profiles (10 users with bios, scores, follower counts), `POST_TYPE_CONFIG` with emoji/label/color per type
- Updated `app/(tabs)/community.tsx` - added post type badges on each card, report button (ellipsis menu on posts, flag on comments), tap username/avatar navigates to user profile, report comment in modal
- Updated `app/create-post.tsx` - added post type selector (horizontal scroll of 5 types) with dynamic placeholder text per type
- Created `app/user-profile.tsx` - full user profile screen with avatar, bio, crunchy score + tier badge (via `getTierInfo()`), total scans, follower/following counts, follow/unfollow button, report user via ellipsis menu, user's post history
- Files changed:
  - `data/community.ts` (modified) - Added PostType, POST_TYPE_CONFIG, CommunityUser type and COMMUNITY_USERS array, postType field on all posts, getUserById, getPostsByUserId
  - `app/(tabs)/community.tsx` (modified) - Post type badges, report post/comment, tap-to-profile navigation
  - `app/create-post.tsx` (modified) - Post type selector with dynamic placeholders
  - `app/user-profile.tsx` (new) - User profile screen with follow/unfollow and report
  - `prd.json` (modified) - Marked STORY-008 as passes: true
- **Learnings:**
  - Community tab already had solid foundation (15 mock posts, like animation, comment modal, hashtag filtering) - just needed post types, profiles, and moderation
  - The `PostType` system uses a config object pattern `POST_TYPE_CONFIG` for easy extensibility (color + emoji + label per type)
  - User profile navigation uses query params: `/user-profile?userId=user-001` (Expo Router search params pattern)
  - Report functionality is UI-only (Alert.alert confirmation) - will need Supabase tables for actual moderation when backend is wired up
  - `getTierInfo()` from `lib/crunchyScore.ts` works well for displaying tier badges on any profile (returns emoji + label + badge type)
  - Community users and posts are separate arrays in `data/community.ts` - posts reference userId, getUserById() to look up profile
---

## 2026-03-06 - STORY-009
- Implemented Storefronts / User Lists feature: create lists, browse public lists, view list details
- Created `data/lists.ts` with types (`ProductList`, `ListProduct`, `ListCategory`), `LIST_CATEGORY_CONFIG`, 6 mock lists across categories (skincare, grocery, cleaning, wellness, baby, general), and helper functions
- Created `app/lists.tsx` - browse public lists with search + category filter, create list button
- Created `app/list-detail.tsx` - view list with product cards, owner info (links to user profile), save/share actions
- Created `app/create-list.tsx` - form with title, description, category picker, public/private toggle
- Updated `app/(tabs)/profile.tsx` - added "My Lists" and "Browse Lists" quick action buttons
- Updated `prd.json` - marked STORY-009 as passes: true
- Files changed:
  - `data/lists.ts` (new) - Lists data model with 6 mock lists, types, config, and helpers
  - `app/lists.tsx` (new) - Lists browsing screen with search and category filters
  - `app/list-detail.tsx` (new) - List detail screen with product cards and owner info
  - `app/create-list.tsx` (new) - Create list form
  - `app/(tabs)/profile.tsx` (modified) - Added quick action buttons for lists
  - `prd.json` (modified) - Marked STORY-009 as complete
- **Learnings:**
  - Followed existing config object pattern from `POST_TYPE_CONFIG` for `LIST_CATEGORY_CONFIG` (emoji + label + color per category)
  - Lists reference `COMMUNITY_USERS` via userId, reusing `getUserById()` from `data/community.ts`
  - Product data in lists uses a simplified `ListProduct` type (name, brand, rating, image) rather than full `Product` type from `data/products.ts`
  - Profile screen quick action buttons provide easy access to lists without adding another tab (keeping tabs at 3 to avoid crowding)
- Back button debounce: use `useGoBack()` hook from `lib/useGoBack.ts` for all header back buttons to prevent multi-press navigation
- Explore search includes both products AND recipes when user types a query
---

## 2026-03-06 - STORY-010
- Implemented UI polish across the app
- Removed "Scan Alerts" toggle from settings (feature not built out)
- Marked "Weekly Digest" as "Coming Soon" in settings with sage badge instead of toggle
- Created `lib/useGoBack.ts` - debounced back navigation hook (500ms cooldown) to prevent multi-press issues
- Applied `useGoBack()` to 12 screens with header back buttons: settings, help-support, terms-of-service, privacy-policy, lists, list-detail, create-list, create-post, user-profile, recipe-detail, recipes, paywall
- Added recipe search to Explore tab - when searching, matching recipes appear in a horizontal scroll above product results
- Updated search placeholder to "Search products, recipes, brands..."
- Verified UI consistency: all main cards/containers use rounded-2xl, sage/green (#8B9E7C) aesthetic is consistent
- Files changed:
  - `lib/useGoBack.ts` (new) - Debounced back navigation hook
  - `app/settings.tsx` (modified) - Removed Scan Alerts, Weekly Digest as Coming Soon, useGoBack
  - `app/(tabs)/explore.tsx` (modified) - Added recipe search results section
  - `app/help-support.tsx` (modified) - useGoBack
  - `app/terms-of-service.tsx` (modified) - useGoBack
  - `app/privacy-policy.tsx` (modified) - useGoBack
  - `app/lists.tsx` (modified) - useGoBack
  - `app/list-detail.tsx` (modified) - useGoBack
  - `app/create-list.tsx` (modified) - useGoBack
  - `app/create-post.tsx` (modified) - useGoBack
  - `app/user-profile.tsx` (modified) - useGoBack
  - `app/recipe-detail.tsx` (modified) - useGoBack
  - `app/recipes.tsx` (modified) - useGoBack
  - `app/paywall.tsx` (modified) - useGoBack
  - `prd.json` (modified) - Marked STORY-010 as passes: true
- **Learnings:**
  - `useGoBack` hook pattern: useRef flag + 500ms timeout prevents rapid back-button presses from stacking navigation
  - Explore tab is the main search hub - search placeholder and results should cover both products and recipes
  - Small UI elements (icon containers, badges) appropriately use rounded-xl/lg while main containers use rounded-2xl
  - Settings SettingsToggle component isn't needed for "Coming Soon" items - inline View with badge is cleaner
---

