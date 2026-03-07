# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- Quiz score stored in AsyncStorage at `@crunchy_quiz_score` key (JSON with `score` and `completedAt`)
- Design tokens: sage green `#8B9E7C`, cream bg `#FAF8F5`, peach `#F4A574`, dark `#2D2D2D`
- Use `rounded-2xl` for main cards, consistent shadow style via inline `style` prop (NativeWind shadow classes don't work reliably on RN)
- `getDefaultStats()` from `@/lib/crunchyScore` for initial score state; `getTierInfo(score)` for tier lookup
- ESLint config is broken in this project (subpath export error) - typecheck with `npx tsc --noEmit` instead
- Haptics via `../../utils/haptics` (platform-safe wrapper)
- User name: `user?.name?.split(" ")[0] ?? "Friend"` via `useAuth()`
- Reanimated animations: import from `react-native-reanimated` (useSharedValue, withRepeat, withTiming, Easing)
- Scanner has 3 screens: `app/(tabs)/scan.tsx` (mode selector), `app/product-scan.tsx` (item scan), `app/label-scan.tsx` (ingredients/label scan)
- `app/scan-result.tsx` is for barcode-based results (uses static product data from `@/data/products`)
- Avatar constants live in `lib/avatars.ts`: AVATAR_EMOJI_MAP, AVATAR_PRESETS, DEFAULT_AVATAR_EMOJI

---

## 2026-03-06 - STORY-001
- What was implemented:
  - Changed greeting from "Hey, [name]!" to "Welcome back, [name]!"
  - Redesigned crunchy score card: larger padding (p-6), bigger score text (text-5xl), larger tier emoji (text-3xl), stronger shadow, uppercase tracking label, centered "View Details" arrow at bottom
  - Replaced Scan button + 2 stat cards with 3 consistent quick action buttons (Scan, Score, Saved) each with icon-in-circle style and haptic feedback
  - Added "Take the Crunchy Quiz" CTA card (peach gradient, prominent styling) that checks AsyncStorage for `@crunchy_quiz_score` and only shows if quiz hasn't been taken
  - Increased horizontal padding from px-5 to px-6 throughout, increased vertical spacing between sections
- Files changed:
  - `app/(tabs)/index.tsx` - full rewrite of home screen
- **Learnings:**
  - Quiz completion is tracked via `@crunchy_quiz_score` in AsyncStorage (set in `app/quiz-result.tsx`)
  - `Card` component already applies rounded-2xl + shadow - use it for consistent card styling
  - ESLint is broken in this project; rely on `npx tsc --noEmit` for quality checks
  - NativeWind `border-t` class doesn't apply `borderTopWidth` reliably in RN - use inline style for border separators
---

## 2026-03-06 - STORY-002
- What was implemented:
  - Added mode description text below the pill-shaped scan mode tabs on the scanner home screen
  - Replaced dashed circle camera overlay in product-scan with corner bracket frame guide (matching label-scan style)
  - Added animated scanning line on processing screens (both product-scan and label-scan) using Reanimated withRepeat/withTiming, replacing plain ActivityIndicator
  - Added "Save Product" (bookmark toggle) and "Scan Another" action buttons at bottom of all result screens (product-scan, label-scan, scan-result)
  - Error screens already had friendly messages, retry/back buttons, and no raw error text - verified they meet requirements
  - Result screens already had clean card layouts with score badges and color-coded ingredient safety ratings (green/yellow/red)
- Files changed:
  - `app/(tabs)/scan.tsx` - added mode description text below pill tabs
  - `app/product-scan.tsx` - corner bracket overlay, scanning animation, save/scan-another buttons, isSaved state
  - `app/label-scan.tsx` - scanning animation, save/scan-another buttons, isSaved state
  - `app/scan-result.tsx` - save/scan-another buttons at bottom
- **Learnings:**
  - NativeWind `border-t-4 border-l-4` classes work well for corner bracket overlays in camera views
  - Reanimated `withRepeat(withTiming(...), -1, true)` creates smooth reversing animations (good for scanning lines)
  - The three scan screens share similar patterns but are separate files - changes to result/error UX need to be applied to all three
---

## 2026-03-06 - STORY-003
- What was implemented:
  - Populated `data/community.ts` with 7 realistic sample posts across all post types (question, review, tip, recipe) with comments, hashtags, and images
  - Added 5 sample community users with scores, bios, and stats
  - Added `crunchyScore` field to `CommunityPost` type for tier badge support
  - Added tier badge (emoji + label) next to username in PostCard component using `getTierInfo()`
  - Updated empty state text to "Be the first to post!" per PRD requirements
  - Added character count limit enforcement (500 chars) in create-post with color-coded counter (green -> orange -> red)
  - Verified existing features already meet PRD: post type filter bar, colored pill badges, AnimatedHeart with scale animation, comment modal with clean layout, create post with post type selector + image upload + character count
- Files changed:
  - `data/community.ts` - added sample users, posts, trending hashtags, crunchyScore field on CommunityPost type
  - `app/(tabs)/community.tsx` - added tier badge to PostCard, updated empty state text, imported getTierInfo
  - `app/create-post.tsx` - enforced 500 char limit, color-coded character counter
- **Learnings:**
  - `CommunityPost` type lives in `data/community.ts` and is referenced in community.tsx and user-profile.tsx
  - `getTierInfo(score)` returns `{ tier, label, emoji, badge }` - useful for displaying tier badges anywhere
  - COMMUNITY_POSTS array was empty by default - sample data needed to be populated for the feed to work
  - The existing AnimatedHeart component with `withSequence(withSpring(...))` already provides a nice like animation
---

## 2026-03-06 - STORY-004
- What was implemented:
  - Enlarged avatar from w-20/h-20 to w-28/h-28 with larger emoji (text-6xl) and stronger shadow
  - Added tier badge pill (emoji + label + score) below display name
  - Added bio display from AsyncStorage profile data
  - Added pencil icon (Ionicons pencil-outline) to Edit Profile button
  - Added stats row card: Total Scans | Recipes Tried | Lists Created
  - Added "Your Crunchy Card" section header above the existing ScoreCard (which already has screenshotable ViewShot + Share button)
  - Added "Recent Scans" horizontal scroll section with sample product cards showing name, emoji, and color-coded score badge
  - Added "My Lists" section with sample list items showing emoji, name, item count, and chevron
  - Empty states for both sections when no data exists
  - Removed old tab-based sections (Scan History/Saved Items/My Posts tabs) in favor of dedicated sections
  - Consistent spacing (px-6), rounded-2xl cards, proper shadows throughout
- Files changed:
  - `app/(tabs)/profile.tsx` - full rewrite of profile screen
- **Learnings:**
  - Profile data (displayName, bio, avatar) stored in AsyncStorage at `@crunchy_onboarding_profile` key
  - `getTierInfo(score)` returns tier info for displaying badge anywhere - already imported from `@/lib/crunchyScore`
  - ScoreCard component already handles ViewShot screenshot + share functionality - just wrap in a section
  - FlatList with `horizontal` prop works well inside ScrollView for horizontal sections
  - AVATAR_EMOJI_MAP is still duplicated in profile.tsx and community.tsx (Story 10 should extract to shared lib)
---

## 2026-03-06 - STORY-005
- What was implemented:
  - Made ingredients list in recipe detail checkable (tap to check off with strikethrough and sage green checkbox)
  - Changed save icon from bookmark to heart (red filled when saved) on both recipe cards and detail screen
  - Added category badge pill on recipe card hero image area
  - Verified: 63 recipes all have complete, realistic ingredients and instructions (no placeholder text)
  - Verified: category filter pills, search bar filtering, difficulty/time filters, save functionality all working
- Files changed:
  - `app/recipe-detail.tsx` - checkable ingredients with checkedIngredients state, heart icon for save
  - `app/recipes.tsx` - heart icon for save, category badge on recipe cards
- **Learnings:**
  - Recipe save state uses `@crunchy_saved_recipes` AsyncStorage key (array of recipe IDs)
  - `RECIPE_CATEGORIES` in `data/recipes.ts` has 6 categories: Cleaning, Skincare, Cooking, Haircare, Home, Personal Care
  - Recipe detail uses `useLocalSearchParams<{ id?: string }>()` for routing params
  - NativeWind `line-through` class works for strikethrough text in React Native
---

## 2026-03-06 - STORY-006
- What was implemented:
  - Populated MOCK_LISTS in `data/lists.ts` with 5 sample public lists from community users (skincare, cleaning, grocery, baby, wellness categories) with realistic products
  - Made ListCard tappable in `app/lists.tsx` - navigates to list-detail screen on press
  - Added relative "Updated X ago" date display on list cards instead of raw creation date
  - Rewrote `app/list-detail.tsx` to load lists from both MOCK_LISTS (public/browse) and AsyncStorage (user-created)
  - Added product removal via long press on own lists (with confirmation alert and haptic feedback)
  - Product cards in list detail are tappable to navigate to product-detail screen
  - Empty state when list has no products
  - Helper hint text "Long press a product to remove it" shown on own lists
  - Own lists show privacy badge and last updated date; browse lists show owner info with link to profile
  - Keyboard dismissal already working on lists.tsx and create-list.tsx (TouchableWithoutFeedback + Keyboard.dismiss)
  - Create list already had: name, description, category selector, privacy toggle, product search + add
- Files changed:
  - `data/lists.ts` - populated MOCK_LISTS with 5 sample lists
  - `app/lists.tsx` - made ListCard tappable, added relative date formatting for updatedAt
  - `app/list-detail.tsx` - full rewrite: AsyncStorage support, product removal, tappable products
  - `prd.json` - marked STORY-006 as passes: true
- **Learnings:**
  - User-created lists stored in AsyncStorage at `@crunchy_user_lists` key (array of ProductList objects)
  - List detail must check both MOCK_LISTS and AsyncStorage since lists come from different sources
  - `getListById()` in data/lists.ts only searches MOCK_LISTS, not AsyncStorage
  - Haptics import: `import * as Haptics from "../utils/haptics"` with `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`
  - `border-t` NativeWind class unreliable in RN - use inline style `borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)"` instead
---

## 2026-03-06 - STORY-007
- What was implemented:
  - Welcome screen: added Reanimated entrance animations (FadeIn for logo, FadeInDown for title/tagline, FadeInUp for CTA), enlarged logo (w-28/h-28) with sage green shadow
  - Onboarding carousel: added FadeIn/FadeInUp entrance animations for skip button and bottom CTA, enlarged icon containers (w-36/h-36) with colored shadows matching icon background
  - Quiz screen: added haptic feedback on option select and finish button, FadeIn on header, thicker progress bar (h-2.5), shadow on finish button, changed "1 / 10" to "1 of 10"
  - Quiz result screen: added haptic feedback on share button, animated header text ("Your Crunchy Score"), imported Haptics
  - Verified: quiz already has one question per screen, progress bar, large text, emoji-based options, auto-advance
  - Verified: result screen already has animated score counter, tier announcement with tree emoji, Share My Score button, shareable card with ViewShot
  - Verified: interest picker already has animated chips with icons, selected state, haptic feedback, smooth transition to main app
  - Verified: smooth slide_from_right transitions configured in _layout.tsx
  - No em-dashes found in any onboarding/quiz copy
- Files changed:
  - `app/welcome.tsx` - entrance animations, larger logo with shadow
  - `app/onboarding.tsx` - entrance animations, larger icons with colored shadows
  - `app/quiz.tsx` - haptic feedback, animated header, thicker progress bar, button shadow
  - `app/quiz-result.tsx` - haptic feedback, animated header text
- **Learnings:**
  - Reanimated `FadeIn`, `FadeInDown`, `FadeInUp` with `.delay().duration()` create clean staggered entrance animations
  - The onboarding flow is: welcome -> onboarding (carousel) -> quiz -> quiz-result -> interests -> (tabs)
  - `onboarding-profile.tsx` exists as a separate profile setup screen but is not in the main onboarding flow
  - Quiz auto-advances after 400ms delay on option select using setTimeout
  - ViewShot + Sharing utilities already handle the "Share Your Score" card capture functionality
---

## 2026-03-06 - STORY-008
- What was implemented:
  - Reorganized Settings into clean sections: Account, Preferences, Legal, Support, About Crunchy, and Danger Zone
  - Merged Profile, Personalization, and Notifications into unified Preferences section
  - Added notification preference toggles (Community, Scan Reminders, Tips & Updates) that persist to AsyncStorage
  - Added "Danger Zone" section with red-styled header, red icon background, description text, red border on card
  - Added "About Crunchy" section with app name and version 1.0.0
  - Added "Send Feedback" row in Support section
  - Styled Log Out button with sage green instead of red (since it's not destructive)
  - Added interests picker to Edit Profile screen using INTEREST_OPTIONS from InterestsContext
  - Interest chips show selected state with sage green border, checkmark, and shadow
  - Added Supabase persistence to Edit Profile save (upserts to profiles table if Supabase is configured, AsyncStorage fallback)
  - Enlarged avatar preview in Edit Profile (w-24/h-24, text-5xl)
  - Bio enforces 150 char limit via onChangeText
- Files changed:
  - `app/settings.tsx` - full rewrite with reorganized sections, notification persistence, Danger Zone styling
  - `app/edit-profile.tsx` - added interests section, Supabase persistence, enlarged avatar
- **Learnings:**
  - Notification prefs stored at `@crunchy_notification_prefs` AsyncStorage key
  - `useInterests()` from InterestsContext provides `interests` array and `setInterests()` for persistence
  - `INTEREST_OPTIONS` exported from InterestsContext has id, label, icon, description for each category
  - `isSupabaseConfigured()` from lib/supabase checks if env vars are set before attempting Supabase calls
  - Supabase profiles table supports upsert with fields: display_name, bio, avatar_url, interests, updated_at
---

## 2026-03-06 - STORY-009
- What was implemented:
  - Restructured explore screen into two modes: search results mode and browse/trending mode
  - Added Community Posts search results section that searches post content, usernames, hashtags, and post types (limited to 5 results)
  - Added CommunityPostCard component showing avatar, username, post type badge, content preview, likes, and comments count
  - Added "Featured Recipes" horizontal scroll section when search is empty (hand-picked popular recipes)
  - Added "Popular Products" section when search is empty (clean-rated products displayed as cards)
  - Updated no-results message to: "Nothing found for [query]. Try scanning a product to add it to our database!" with "Scan a Product" CTA button
  - Added recipe category and difficulty to recipe result cards (was only showing time before)
  - Extracted RecipeCard as reusable component used in both search results and featured sections
  - Search results organized in clear sections with icons: Recipes (book icon), Products (cube icon), Community Posts (people icon)
  - Category grid and filter bar only shown in browse mode (not during search)
  - Featured/popular sections hidden when category or rating filters are active (shows filtered product list instead)
- Files changed:
  - `app/(tabs)/explore.tsx` - full rewrite with search results sections, trending/featured content, community post search
- **Learnings:**
  - `COMMUNITY_POSTS` and `POST_TYPE_CONFIG` exported from `data/community.ts` for search integration
  - `POST_TYPE_CONFIG[postType]` returns `{ label, emoji, color }` for badge styling
  - When restructuring a screen into multiple modes (search vs browse), use a boolean like `isSearching` to cleanly separate render paths
  - Recipe cards benefit from showing both category and difficulty for quick scanning
---

## 2026-03-06 - STORY-010
- What was implemented:
  - Extracted AVATAR_EMOJI_MAP and AVATAR_PRESETS to shared `lib/avatars.ts`, updated imports in community.tsx, profile.tsx, edit-profile.tsx, and onboarding-profile.tsx
  - Audited all screens for background color consistency - all use `bg-cream` (#FAF8F5) correctly
  - Confirmed no em-dashes exist in any copy text
  - Verified all icons use Ionicons consistently (no mixed icon sets)
  - Verified design tokens: cream bg, sage green accents, rounded-2xl cards used consistently
  - Removed 6 unused exports: `getProductsByCategory`, `searchProducts` (data/products.ts), `getListOwner` (data/lists.ts), `getPostsByHashtag` (data/community.ts), `searchRecipes`, `filterRecipes` (data/recipes.ts)
  - Typography and shadow variations are intentional (different hierarchy levels) - no changes needed
  - ActivityIndicators in scanner/layout are for active processing states, not content loading - skeleton not applicable
- Files changed:
  - `lib/avatars.ts` - NEW: shared avatar constants (AVATAR_EMOJI_MAP, AVATAR_PRESETS, DEFAULT_AVATAR_EMOJI)
  - `app/(tabs)/community.tsx` - import AVATAR_EMOJI_MAP from shared lib
  - `app/(tabs)/profile.tsx` - import AVATAR_EMOJI_MAP and DEFAULT_AVATAR_EMOJI from shared lib
  - `app/edit-profile.tsx` - import AVATAR_PRESETS from shared lib
  - `app/onboarding-profile.tsx` - import AVATAR_PRESETS from shared lib
  - `data/products.ts` - removed unused getProductsByCategory, searchProducts
  - `data/lists.ts` - removed unused getListOwner
  - `data/community.ts` - removed unused getPostsByHashtag
  - `data/recipes.ts` - removed unused searchRecipes, filterRecipes
  - `prd.json` - marked STORY-010 as passes: true
- **Learnings:**
  - `lib/avatars.ts` is the single source of truth for avatar emoji data (AVATAR_EMOJI_MAP, AVATAR_PRESETS, DEFAULT_AVATAR_EMOJI)
  - AVATAR_PRESETS is derived from AVATAR_EMOJI_MAP entries, keeping them in sync automatically
  - All screens already use consistent bg-cream (#FAF8F5) - defined in tailwind.config.js
  - Shadow variations across the app are intentional for visual hierarchy (light for cards, deeper for modals/overlays, tinted for accent buttons)
---

