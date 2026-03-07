# Crunchy App - Fix Sprint (Round 1 Feedback)

## Overview
Fix all bugs and polish issues from first testing round. Focus on QUALITY over speed. Each fix should be clean and complete.

## Stories

### Story 1: Remove All Dummy/Mock Data
Remove ALL fake data: fake accounts, fake posts, fake scans, fake recent items. The app should start clean with empty states. Empty states should have nice "nothing here yet" messages with CTAs (e.g. "No scans yet - scan your first product!" with a scan button). Check every screen for hardcoded mock data and remove it.

### Story 2: Fix Navigation & Broken Buttons
- Home page quick buttons (scan, score, saved) must navigate to their actual pages
- Score box on home page must be tappable and navigate to a score detail page
- Create a new `app/score-detail.tsx` page showing: current score, tier, breakdown of how score is calculated, history/progress
- All back buttons must work (use the useGoBack hook already created)
- Error pages must have a dismiss/back button
- Keyboard must dismiss when tapping outside text inputs (use KeyboardAvoidingView + TouchableWithoutFeedback + Keyboard.dismiss)

### Story 3: Fix Scanner
- Update scan mode labels to "Item", "Ingredients", "Label" with correct matching icons (camera for item, document-text for ingredients, pricetag for label)
- Fix header spacing to look clean and professional
- Add retry logic for Gemini 429 errors (wait 2s, retry up to 3 times)
- Add friendly error screen: "Oops, the scanner is busy. Try again in a moment." with a "Try Again" button and a "Go Back" button
- Recently saved items should open a product detail view, NOT the post-scan analysis view
- Create `app/product-detail.tsx` for viewing saved/cached products (different from scan-result)

### Story 4: Fix Community
- Replace hashtag filters with post type filters: All, Questions, Reviews, Tips, Recipes
- Fix comment liking (add likes table support for comments, or remove like button from comments if not supported)
- Fix user identity: comments should show the user's display_name and chosen avatar, not "You" with random emoji
- Fix "user not found" when clicking own profile - should navigate to profile tab
- Add profile edit screen: `app/edit-profile.tsx` with editable display_name, bio, avatar selection
- Link edit profile from settings AND from profile page

### Story 5: Fix Lists
- Separate "My Lists" (lists I created) from "Browse Lists" (other users' public lists) - use tabs/segments
- My Lists should also show lists I've saved/followed
- Fix create list: add KeyboardAvoidingView, add product search to add products, add save button that actually saves to Supabase
- After creating a list, navigate back to My Lists

### Story 6: Fix Explore/Search
- Search should query Supabase products table by name and brand
- Also search recipes by title
- Show "No results found" with helpful message if nothing matches
- Add debounce to search input (300ms)

### Story 7: Polish Home Page
- Redesign crunchy score card: bigger, matches the polished card style (rounded-2xl, sage green, shadow), show tier emoji + name + score prominently
- Score card is tappable → score detail page
- Clean spacing throughout home page

### Story 8: Fix Profile Page
- Fix name overlapping tree emoji - add proper spacing/padding
- Score section should be tappable → score detail page
- Tree emoji selection is a FUTURE feature (just use default tree for now, but leave room for it)

### Story 9: Fix Settings & Legal
- Privacy policy: fill in ALL blank sections with real content
- Remove blank bullets/periods
- Rephrase "under 13" section to be less suspicious: "This app is designed for users aged 13 and older. We do not knowingly collect personal information from children under 13."
- Add explicit statement: "We do not sell, trade, or rent your personal data to third parties."
- Add "Delete Account" button in settings that actually deletes the account (with confirmation dialog)
- Add "Edit Profile" button in settings → edit-profile page
- Make name and other details editable

### Story 10: Final Quality Pass
- Check every screen for visual consistency
- Ensure no dummy data remains anywhere
- Test all navigation flows work
- Ensure clean empty states everywhere
- No orphaned screens or dead-end pages
- Professional, polished feel throughout

## Technical Notes
- Use the existing NativeWind/Tailwind styling
- Maintain the sage/green crunchy aesthetic
- rounded-2xl for main cards, consistent shadow styles
- KeyboardAvoidingView on all forms
- All data from Supabase, no hardcoded mock data
- Error handling should be user-friendly, never show raw errors
- No em-dashes in any copy
