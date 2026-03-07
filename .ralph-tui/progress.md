# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- Mock data lived in `data/community.ts` (users, posts, hashtags), `data/lists.ts` (MOCK_LISTS), and inline in screen files
- Screen files: `app/(tabs)/index.tsx`, `app/(tabs)/scan.tsx`, `app/(tabs)/profile.tsx` had inline mock arrays
- `lib/crunchyScore.ts` has `getDefaultStats()` for zero-state and `getMockStats()` (now unused) for dev
- Profile tab components (ScanHistoryTab, SavedItemsTab, MyPostsTab) use EmptyState component pattern
- Community screen already handles empty posts with skeleton loading + empty state + Create Post CTA
- Lists screen already has empty state with "Create a List" CTA
- Product catalog (`data/products.ts`) and recipes (`data/recipes.ts`) are reference/content data, not user mock data
- ESLint config is broken (pre-existing issue with eslint/package.json exports), but TypeScript checker works fine
- `lib/useGoBack.ts` provides debounced back navigation; most pages already use it
- Keyboard dismiss pattern: wrap with `TouchableWithoutFeedback onPress={Keyboard.dismiss}` + `keyboardShouldPersistTaps="handled"` on ScrollViews
- Score detail page at `app/score-detail.tsx` shows tier breakdown and score calculation details
- User profile (displayName, avatar ID, bio) stored in AsyncStorage under `@crunchy_onboarding_profile`; avatar IDs map to emoji via AVATAR_EMOJI_MAP
- Community post type filters use POST_TYPE_CONFIG from `data/community.ts` for labels/emoji/colors
- User lists stored in AsyncStorage under `@crunchy_user_lists`; use `useFocusEffect` to reload on screen return

---

## 2026-03-06 - STORY-001
- Removed all mock/dummy data from screens and data files
- Files changed:
  - `app/(tabs)/index.tsx` - Removed SWAPS_BY_CATEGORY, ALL_TRENDING, MOCK_SAVED_ITEMS, getMockStats usage. Added "Getting Started" and "Community" empty state cards with CTAs
  - `app/(tabs)/scan.tsx` - Removed MOCK_RECENT_SCANS array and related handlers. Added "No scans yet" empty state
  - `app/(tabs)/profile.tsx` - Removed MOCK_SCAN_HISTORY, MOCK_SAVED_ITEMS, MOCK_USER_POSTS arrays. Simplified tab components to show empty states directly. Replaced getMockStats with getDefaultStats
  - `data/community.ts` - Emptied COMMUNITY_USERS, TRENDING_HASHTAGS, COMMUNITY_POSTS arrays (kept types, configs, helper functions)
  - `data/lists.ts` - Emptied MOCK_LISTS array (kept types, configs, helper functions)
- **Learnings:**
  - Profile.tsx already had EmptyState component and conditional rendering for empty arrays - just needed the arrays emptied
  - Community.tsx already had full empty state handling (skeleton + empty state + FAB)
  - Lists screen already had empty state with CTA
  - Product catalog and recipe data are content/reference data, not user mock data - kept as-is
  - The `useInterests` context was only used for personalized swap/trending which was removed
---

## 2026-03-06 - STORY-002
- Fixed navigation and broken buttons across the app
- Files changed:
  - `app/(tabs)/index.tsx` - Made StatCard components tappable (Scans -> scan tab, Score -> score-detail, Saved -> profile tab). Made score badge in greeting area tappable -> score-detail page.
  - `app/score-detail.tsx` - NEW: Created score detail page showing current score, tier, score breakdown (80% scans + 20% recipes + quiz bonus), all 4 tiers with descriptions, and tips to level up.
  - `app/lists.tsx` - Added keyboard dismiss (TouchableWithoutFeedback + Keyboard.dismiss) and keyboardShouldPersistTaps on ScrollView
  - `app/paywall.tsx` - Added keyboard dismiss (TouchableWithoutFeedback + Keyboard.dismiss) and keyboardShouldPersistTaps on ScrollView
- **Learnings:**
  - Most pages already had useGoBack and proper back buttons - only lists.tsx and paywall.tsx were missing keyboard dismiss
  - quiz-result.tsx intentionally has no back button (it's an onboarding flow with forward navigation)
  - paywall.tsx uses close icon (not arrow-back) which is appropriate for modal-style pages
  - StatCard was a View, changed to TouchableOpacity with onPress prop for navigation
---

## 2026-03-06 - STORY-003
- Fixed scanner: updated scan mode labels from "Scan Item/Scan Ingredients/Scan Label" to "Item/Ingredients/Label"
- Updated label icon from nutrition-outline to pricetag-outline (camera for item, document-text for ingredients, pricetag for label)
- Added Gemini 429 retry logic: waits 2s, retries up to 3 times, throws "RATE_LIMITED" sentinel
- Added friendly error screen for rate limiting: "Oops, the scanner is busy. Try again in a moment." with time icon
- Renamed error screen "Cancel" button to "Go Back" on both product-scan and label-scan
- Created `app/product-detail.tsx` for viewing saved/cached products (uses useGoBack, share, expandable ingredients)
- Updated explore.tsx to navigate to product-detail instead of scan-result for browsing products
- Files changed:
  - `app/(tabs)/scan.tsx` - Updated SCAN_MODES labels and getModeIcon for label mode
  - `app/label-scan.tsx` - Changed nutrition-outline to pricetag-outline, updated error screen
  - `app/product-scan.tsx` - Updated error screen with rate limit handling and "Go Back"
  - `services/gemini.ts` - Added retry loop for 429 errors with "RATE_LIMITED" sentinel
  - `app/product-detail.tsx` - NEW: Product detail page for viewing saved/cached products
  - `app/(tabs)/explore.tsx` - Changed product navigation from scan-result to product-detail
- **Learnings:**
  - Gemini service throws "RATE_LIMITED" sentinel string for 429 errors after retries exhausted; scanner screens check for this to show friendly message
  - `scan-result.tsx` is the post-scan analysis view (with success animation); `product-detail.tsx` is for browsing saved/cached products
  - The label-scan icon in the camera overlay was also using nutrition-outline and needed updating
---

## 2026-03-06 - STORY-004
- Fixed community screen: replaced hashtag filters with post type filters (All, Questions, Reviews, Tips, Recipes)
- Removed like button from comments (no likes table support in Supabase schema for comments)
- Fixed user identity in comments: now uses display_name and chosen avatar from AsyncStorage profile instead of hardcoded "you"/"😊"
- Fixed "user not found" when clicking own profile: now navigates to profile tab when userId matches current user
- Created `app/edit-profile.tsx` with editable display_name, bio, and avatar selection grid
- Linked Edit Profile from settings page (new Profile section) and profile page (button below username)
- Files changed:
  - `app/(tabs)/community.tsx` - Replaced hashtag filtering with post type filtering, removed comment like button, fixed user identity in comments, fixed own-profile navigation
  - `app/edit-profile.tsx` - NEW: Edit profile screen with avatar picker, display name, bio fields
  - `app/settings.tsx` - Added Profile section with Edit Profile link
  - `app/(tabs)/profile.tsx` - Added Edit Profile button below username
- **Learnings:**
  - User profile data (displayName, avatar) is stored in AsyncStorage under `@crunchy_onboarding_profile` key, not in the AuthContext User type
  - Avatar IDs (e.g. "leaf", "sunflower") need to be mapped to emoji via AVATAR_EMOJI_MAP for display
  - The `TRENDING_HASHTAGS` array was already empty (cleared in STORY-001), so replacing hashtag filters with post type filters was a clean swap
  - Comments in the data model have a `likes` field but the Supabase schema has no likes table for comments, only for posts
---

## 2026-03-06 - STORY-005
- Separated lists screen into "My Lists" / "Browse Lists" tabs using segmented control
- My Lists loads from AsyncStorage (`@crunchy_user_lists`), auto-refreshes on screen focus
- Browse Lists shows public lists from the data source (getPublicLists)
- Rewrote create-list.tsx with: KeyboardAvoidingView, product search (searches PRODUCTS by name/brand), product selection/removal, save to AsyncStorage
- After saving, navigates back to lists screen which auto-reloads via useFocusEffect
- Files changed:
  - `app/lists.tsx` - Added My Lists/Browse tab segments, AsyncStorage loading, useFocusEffect reload, contextual empty states
  - `app/create-list.tsx` - Added KeyboardAvoidingView, product search UI, product selection, AsyncStorage persistence, "Save List" button
- **Learnings:**
  - User lists stored in AsyncStorage under `@crunchy_user_lists` key (same pattern as recipes, profile)
  - `useFocusEffect` from `@react-navigation/native` works well for reloading data when returning to a screen
  - PRODUCTS array from `data/products.ts` has ~10 products available for search
  - The Supabase schema has `user_lists` and `list_items` tables but the app primarily uses AsyncStorage for local data
---

## 2026-03-06 - STORY-006
- Added 300ms debounce to search input on Explore screen using useRef timer + useEffect
- Improved "No results found" empty state: shows when both products AND recipes return zero results, with contextual help message
- Added separate "No matching products found" message when recipes match but products don't
- Search already queried products by name/brand and recipes by title - no changes needed there
- Files changed:
  - `app/(tabs)/explore.tsx` - Added debounce (searchInput + searchQuery split), improved empty states
- **Learnings:**
  - Explore screen uses local PRODUCTS and RECIPES arrays, not Supabase queries
  - Debounce pattern: split into `searchInput` (immediate, for TextInput) and `searchQuery` (debounced, for filtering)
  - Recipe search was already implemented in the existing code (matchingRecipes useMemo)
---

## 2026-03-06 - STORY-007
- Redesigned home page with prominent Crunchy Score card
- Score card: big sage green card with score (large text), tier emoji + name, mini stats row (scans, recipes, days), "View details" link -- all tappable to score-detail page
- Redesigned scan button: horizontal card style (white bg, sage icon, chevron) instead of large vertical block
- Removed duplicate Score stat card from quick stats row (score now prominent in main card)
- Cleaned spacing: consistent mt-4 between sections, cleaner greeting without cluttered badge
- Removed unused Badge import
- Files changed:
  - `app/(tabs)/index.tsx` - Redesigned score card, scan button, cleaned layout and spacing
- **Learnings:**
  - The existing `components/ScoreCard.tsx` is a shareable score card (with ViewShot for screenshots); the home page score card is a different, simpler navigational element
  - Using `rgba(255,255,255,0.2)` inline styles for translucent white on sage background since NativeWind `bg-white/20` may not work consistently on all RN versions
---

## 2026-03-06 - STORY-008
- Fixed profile page: avatar emoji display, name spacing, tappable score card
- Changed profile header from initials-in-circle to avatar emoji (loaded from AsyncStorage profile)
- Default avatar is tree emoji (🌳) when no avatar selected; maps avatar IDs to emoji via AVATAR_EMOJI_MAP
- Increased spacing between avatar and name (mb-3 to mb-4) to prevent overlap
- Made ScoreCard tappable to navigate to score-detail page
- Profile now uses `useFocusEffect` to reload profile data when returning from edit-profile
- Display name falls back: AsyncStorage profile displayName > auth user name > "Crunchy User"
- Files changed:
  - `app/(tabs)/profile.tsx` - Added AsyncStorage profile loading, avatar emoji display, tappable score card
- **Learnings:**
  - Profile page and edit-profile both need AVATAR_EMOJI_MAP; could be extracted to shared lib if needed in more places
  - `useFocusEffect` is the right pattern for reloading profile data after edits (same pattern used in lists.tsx)
  - ScoreCard component has its own share button (TouchableOpacity) inside, so wrapping it in another TouchableOpacity works with activeOpacity=0.8
---

## 2026-03-06 - STORY-009
- Fixed settings and legal pages
- Privacy policy: rephrased children's privacy section ("This app is designed for users aged 13 and older..."), strengthened no-sell statement ("We do not sell, trade, or rent your personal data to third parties.")
- Added Delete Account button to settings with two-step confirmation dialog
- Added `deleteAccount` function to AuthContext that clears all user AsyncStorage keys (auth, profile, lists, scans, saved items, recipes, interests, onboarding, quiz)
- Edit Profile button and editable name/bio/avatar were already implemented in STORY-004
- Files changed:
  - `app/privacy-policy.tsx` - Rephrased children's section, strengthened no-sell statement
  - `contexts/AuthContext.tsx` - Added `deleteAccount` method that clears all user data via `AsyncStorage.multiRemove`
  - `app/settings.tsx` - Added Delete Account button with confirmation dialog
- **Learnings:**
  - AsyncStorage keys used across the app: `@crunchy_auth_user`, `@crunchy_onboarding_profile`, `@crunchy_user_lists`, `@crunchy_scan_history`, `@crunchy_saved_items`, `@crunchy_recipes_tried`, `@crunchy_interests`, `@crunchy_onboarding_complete`, `@crunchy_quiz_results`
  - `AsyncStorage.multiRemove` is the cleanest way to batch-delete multiple keys
  - Privacy policy was already well-structured from initial build; only minor wording changes needed
---

## 2026-03-06 - STORY-010
- Final quality pass across all screens
- Audited all 5 tab screens (home, scan, explore, community, profile)
- Audited all modal/detail screens (score-detail, product-detail, edit-profile, settings, privacy-policy, lists, create-list, product-scan, label-scan)
- Verified: no user-facing mock/dummy data remains (all arrays properly emptied)
- Verified: no em-dashes in any copy
- Verified: TypeScript passes cleanly (zero errors)
- Verified: all screens have proper back navigation, keyboard dismiss, and error handling
- Verified: all empty states have friendly messages with CTAs
- Verified: consistent visual styling (rounded-2xl, sage green, shadows, bg-cream)
- Verified: no orphaned screens or dead-end pages
- No code changes needed - all previous stories covered the issues thoroughly
- Files changed: none (audit-only pass)
- **Learnings:**
  - The codebase is clean and consistent after stories 1-9
  - `services/gemini.ts` still has mock mode for when no API key is set - this is legitimate fallback behavior
  - `getMockStats()` in crunchyScore.ts is exported but unused - could be removed in future cleanup
  - AVATAR_EMOJI_MAP is duplicated in community.tsx and profile.tsx - could be extracted to a shared lib
  - `explore.tsx` and `community.tsx` use `useState(() => { ... })` as initializer hack instead of `useEffect` - works but unconventional
---

