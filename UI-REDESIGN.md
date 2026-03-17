# Crunchy App UI Redesign Brief

## Inspiration
The design should match the aesthetic of premium feminine wellness apps like "28" and "Paseo":
- Deep sage/forest green backgrounds with nature photography
- Warm cream/ivory cards and surfaces
- Elegant serif typography for headings (use a Google Font like Playfair Display or similar available in Expo)
- Organic, botanical decorative elements
- Photo-overlay cards with bold white text
- Rounded corners everywhere (2xl/3xl), soft shadows
- Premium, editorial feel

## Color Palette Update

### Primary Colors
- **Forest Green**: `#3D5A3E` (deep sage, primary brand color - backgrounds, headers)
- **Sage**: `#8B9E7C` (lighter green for accents, icons)
- **Sage Light**: `#A8B89C` (subtle backgrounds)
- **Cream**: `#FAF8F5` (card backgrounds, text on dark)
- **Cream Dark**: `#F0ECE6` (alternate card backgrounds)
- **Warm Gold**: `#C4A76C` (accent highlights, like Paseo's gold)
- **Ivory**: `#FFFDF8` (page backgrounds)

### Keep existing
- Rating colors (clean/caution/avoid) stay the same
- Dark text colors stay

## Typography
- Headings: Use a serif or elegant display font. Since we're in React Native/Expo, use `@expo-google-fonts/playfair-display` or similar. If too complex, use system serif: `fontFamily: 'Georgia'` or Platform.select serif.
- Body: Keep system sans-serif but ensure consistent sizing
- Heading sizes should be generous - 28-36px for page titles, 20-24px for section headers

## Screen-by-Screen Changes

### Tab Bar (_layout.tsx)
- Background: cream/ivory with no harsh border
- Active color: forest green `#3D5A3E`
- Inactive: muted sage
- Slightly taller, more breathing room
- Consider custom icons or filled versions when active

### Home Screen (index.tsx)
- Hero section with a nature-inspired gradient or image background (forest green gradient)
- "Good morning" greeting with elegant serif font
- Crunchy Score card: large, rounded, cream card with sage accent
- Feature cards in a grid: rounded-3xl, soft shadows, sage/cream theme
- Section headers in serif font

### Quiz (quiz.tsx, quiz-result.tsx)
- Quiz questions on cream cards with forest green accents
- Progress bar in sage green gradient
- Result page: large score circle with botanical decorative elements
- Score breakdown on cream cards

### Scan screens (scan.tsx, product-scan.tsx, label-scan.tsx, scan-result.tsx)
- Camera view can stay as-is
- Results: cream cards with green accent borders
- Score badges with the rating colors but softer/rounder
- Product detail cards: rounded-3xl, subtle shadow

### Explore (explore.tsx)
- Category cards with nature-inspired imagery or sage green backgrounds
- Search bar: rounded-full, cream background, sage border
- Cards: image + overlay text style (like the 28 app's "YOUR PATH" cards)

### Community (community.tsx)
- Posts on cream cards
- User avatars with sage green rings
- Like/comment icons in sage

### Profile (profile.tsx, edit-profile.tsx, settings.tsx)
- Profile header with forest green gradient background
- Stats in cream cards
- Settings items: clean list with sage green chevrons

### Onboarding (welcome.tsx, onboarding.tsx, onboarding-profile.tsx, interests.tsx)
- Full-screen nature-inspired backgrounds (use LinearGradient with forest green tones)
- White/cream text overlay
- Elegant serif headlines
- Smooth, editorial feel like the Paseo welcome screen

### Login/Signup (login.tsx, signup.tsx)
- Clean cream background
- Forest green accent buttons
- Serif heading "Welcome back" style

### Paywall (paywall.tsx)
- Premium feel: gold accents on forest green
- Feature list with leaf/botanical bullet icons

### Recipe screens (recipes.tsx, recipe-detail.tsx)
- Photo-forward cards
- Cream card overlay at bottom
- Tags/badges in sage green pills

## Component Updates

### Button.tsx
- Primary: forest green `#3D5A3E` background, cream text, rounded-full
- Secondary: cream background, forest green border/text
- Add subtle press animation (scale down slightly)

### Card.tsx
- Default: cream background, rounded-3xl, soft shadow
- Variant with image background + text overlay

### Header.tsx
- Transparent or forest green gradient
- White/cream title text in serif font

### Badge.tsx
- Rounded-full, softer colors
- Rating badges keep their colors but with rounded-full shape

### ScoreCard.tsx
- Larger, more prominent
- Circular score display with sage green ring
- Cream card with generous padding

## General Rules
- NO harsh borders - use very subtle shadows or transparent borders
- Generous padding everywhere (p-5, p-6 minimum on cards)
- Rounded corners: minimum rounded-2xl on cards, rounded-full on buttons/badges
- Text hierarchy: clear size difference between heading/subheading/body
- Animations: subtle fade-ins on screen load where possible
- LinearGradient usage for backgrounds (expo-linear-gradient)

## Technical Notes
- Using NativeWind (Tailwind for React Native)
- Update tailwind.config.js with new colors
- Install expo-linear-gradient if not already present
- Install @expo-google-fonts/playfair-display for serif headings (or use Georgia as fallback)
- Keep all existing functionality - this is purely visual
- Test that dark text is readable on all backgrounds
