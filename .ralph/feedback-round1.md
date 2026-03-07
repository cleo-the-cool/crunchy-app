# Feedback Round 1 - Maddy's Testing Notes

## HOME PAGE
- [ ] Crunchy score box (top right) looks ugly/empty - needs to be bigger, more polished, match the style of other cards
- [ ] Score box should be tappable → goes to score detail page
- [ ] Quick action buttons (scan, score, saved) don't work - need to actually navigate to their pages

## SCANNER
- [ ] Scan modes still showing old labels - should be "Item", "Ingredients", "Label" 
- [ ] Scan header spacing is off, icons are wrong/mismatched
- [ ] 429 Gemini API error when scanning - need rate limit handling + graceful error
- [ ] Error page has no way to exit - need back button/dismiss
- [ ] Recently saved items open scan result view (confusing) - saved items should open a different detail view, not the post-scan view

## EXPLORE
- [ ] Search doesn't work (searched "saie" brand, no results) - search needs to query products + recipes in Supabase

## COMMUNITY
- [ ] Hashtag filters should be replaced with post type filters (question, review, tip, recipe)
- [ ] Liking comments doesn't work (bug)
- [ ] Posts show as "sage.mama" but comments show as "You" with random emoji - inconsistent
- [ ] Clicking own profile shows "user not found" 
- [ ] Need a way to edit community profile (display name, bio, avatar)
- [ ] Research apps like Cal.ai and others with communities for inspiration

## PROFILE PAGE
- [ ] Name "Maddy" overlaps the tree emoji - fix spacing
- [ ] Tree should be chooseable (future: AI generated trees, add to TODO)
- [ ] Score detail should be accessible from profile too

## LISTS
- [ ] "My Lists" and "Browse Lists" go to the same page - should be separate
- [ ] My Lists = lists I created + lists I saved (two columns/tabs)
- [ ] Create list: keyboard won't dismiss, no way to add products, no save button
- [ ] Need public community profile view

## SETTINGS / LEGAL
- [ ] Privacy policy has blank bullets/headers with just periods - content is incomplete
- [ ] "We don't knowingly collect data for under 13" sounds suspicious - rephrase
- [ ] Explicitly state: we do NOT sell data to third parties
- [ ] Add "Delete Account" button (don't make them email)
- [ ] Name and profile details should be editable from settings

## GENERAL
- [ ] Remove ALL dummy/mock data (fake accounts, fake posts, fake scans)
- [ ] Clean, polished, professional feel throughout
- [ ] Take extra time to do things properly rather than rushing

## LATER (TODO LIST)
- [ ] AI-generated tree selection for crunchy tiers
- [ ] Stripe integration
- [ ] Research community apps for inspiration (Cal.ai, etc)
