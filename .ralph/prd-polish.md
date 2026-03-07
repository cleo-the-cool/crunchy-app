# Crunchy App - Overnight Polish & Completion Sprint

## Overview
This sprint focuses on UI polish and completing features that are still incomplete or rough. Every change should make the app feel more professional and complete. Take extra care with quality. Test your changes mentally before moving on.

## Stories

### Story 1: Home Page Polish
- Redesign the crunchy score card to be larger, more eye-catching, and match the polished card aesthetic (rounded-2xl, sage green gradient, shadow-lg)
- Show: tier emoji, tier name, score number (large), and a small "View Details" arrow
- Quick action buttons (Scan, Score, Saved) should have consistent styling, proper icons, and smooth press animations
- Add a "Welcome back, [name]!" greeting at the top
- If the user hasn't taken the quiz yet, show a prominent "Take the Crunchy Quiz" CTA card
- Clean spacing throughout, no cramped elements

### Story 2: Scanner UI Polish
- Scan mode selector: clean pill-shaped tabs with icons. "Item" (camera icon), "Ingredients" (list icon), "Label" (tag icon)
- Each mode should have a brief description text below the tabs explaining what to do
- Camera viewfinder should have a nice frame/overlay guide
- Scanning animation: show a subtle pulse or scanning line while processing
- Result screen: clean card layout with score badge, ingredient list with color-coded safety ratings (green/yellow/red)
- "Save Product" and "Scan Another" buttons at bottom of result
- Error screen: friendly message, retry button, back button. Never show raw error text.

### Story 3: Community Feed Polish
- Post cards: clean layout with user avatar, display name, tier badge, timestamp
- Post type badges (Question, Review, Tip, Recipe) as colored pills
- Filter bar: horizontal scroll of post type filters instead of hashtags
- Like animation (heart fill with scale)
- Comment section: clean thread layout with indented replies
- Empty state: "Be the first to post!" with create post button
- Create post screen: clean form with post type selector, image upload area, character count

### Story 4: Profile Page Polish  
- Large avatar at top (emoji or image)
- Display name, bio, tier badge, and crunchy score prominently displayed
- Stats row: Total Scans | Recipes Tried | Lists Created
- "Edit Profile" button (pencil icon)
- My recent scans section (horizontal scroll)
- My lists section
- Screenshotable score card: create a beautiful card component that shows tier, score, tree emoji, username, and app branding. Add "Share" button that captures this card as an image.

### Story 5: Recipe Detail & Library Polish
- Recipe cards in grid: nice image placeholder, title, category badge, difficulty, prep time
- Recipe detail: hero image area, ingredients as checkable list, step-by-step numbered instructions
- "Save Recipe" heart button
- Category filter: horizontal scroll pills (All, Cleaning, Skincare, Cooking, Home)
- Search bar that actually filters the recipe list
- Ensure all 50+ recipes have complete, realistic ingredients and instructions (not placeholder text)

### Story 6: Lists Feature Completion
- My Lists tab: shows lists I created with item count, last updated
- Browse Lists tab: shows other users' public lists
- Create List: proper form with name, description, category selector, privacy toggle (public/private)
- Add Products to List: search for products (from scanned products in Supabase), tap to add
- List Detail: shows products with images, names, scores. Tap product for detail. Remove product with swipe or long press.
- Keyboard dismisses properly on all inputs

### Story 7: Onboarding & Quiz Polish
- Welcome screen with app logo and tagline
- Smooth transitions between onboarding steps
- Quiz questions: one per screen, large text, fun illustrated options (emoji-based if no images)
- Progress bar at top showing question number
- Result screen: big animated score reveal, tier announcement, tree emoji, "Share Your Score" button
- Interest picker: nice grid of interest cards with icons, tappable with selected state
- Smooth transition into main app after onboarding

### Story 8: Settings & Edit Profile Completion
- Settings should look clean and organized in sections: Account, Preferences, Legal, Support, Danger Zone
- Edit Profile: avatar selector (grid of emoji avatars to choose from), display name, bio, interests
- Save button that actually persists to Supabase (not just AsyncStorage)
- Notification preferences section (even if just toggles that save locally for now)
- "About Crunchy" section with version number
- Delete Account in its own "Danger Zone" section with red styling

### Story 9: Explore/Search Completion
- Search should be responsive and show results as you type (debounced 300ms)
- Results organized in sections: Products, Recipes, Community Posts
- Product results show: name, brand, score badge, category
- Recipe results show: title, category, difficulty
- No results: "Nothing found for [query]. Try scanning a product to add it to our database!"
- Trending/featured section when search is empty: featured recipes, popular products

### Story 10: Overall Visual Consistency Pass
- Ensure EVERY screen uses the same design tokens: bg color (#FFF9F2 cream), sage green (#8B9E7C), rounded-2xl cards, consistent shadows
- Typography: consistent heading sizes, body text sizes, weight usage
- Icons: all from the same icon set (Ionicons), consistent size and style
- Loading states: skeleton placeholders instead of raw spinners wherever possible
- Transitions: smooth navigation transitions
- Extract AVATAR_EMOJI_MAP to a shared lib (it's duplicated in community.tsx and profile.tsx)
- Clean up any unused exports or dead code flagged in the previous quality pass
- Ensure no em-dashes anywhere in any copy text

## Technical Notes
- Use NativeWind/Tailwind classes for all styling
- Maintain sage green (#8B9E7C) + cream (#FFF9F2) color palette  
- rounded-2xl for main cards, rounded-xl for smaller elements
- All data from Supabase where available, AsyncStorage as fallback
- Camera functionality via utils/camera.tsx (platform-safe wrapper)
- Gemini API via services/gemini.ts with mock fallback
- No em-dashes in any text
- KeyboardAvoidingView on all form screens
- Take your time, quality over speed
