# Image Integration Plan — Like the 28 App

## How 28 Uses Images
Looking at the 28 app screenshots for reference:
- **Full-screen nature backgrounds** on the Today/home screen (lush green tropical leaves)
- **Image overlay cards** with text on top (semi-transparent overlays)
- **Section headers** with botanical photography backgrounds
- **Category cards** with nature imagery + white text overlay
- **Profile/score area** with subtle nature texture background
- The overall feel: editorial, magazine-quality, immersive nature photography

## Image Assets Available
Located in `assets/images/aesthetic/`:
- `leaves-hero.jpg` - Close-up green leaves (hero/splash)
- `eucalyptus.jpg` - Eucalyptus arrangement (natural products vibe)
- `forest-canopy.jpg` - Looking up through forest (immersive green)
- `monstera.jpg` - Monstera leaf (modern botanical)
- `botanical.jpg` - Pink flowers (botanical garden)
- `herbs.jpg` - Herb plant close-up
- `natural-skincare.jpg` - Skincare flat lay
- `fresh-produce.jpg` - Fresh vegetables
- `linen-texture.jpg` - Natural linen/cotton texture
- `water-leaf.jpg` - Water droplet on leaf (purity)
- `sage-herbs.jpg` - Sage/herbs
- `green-smoothie.jpg` - Green smoothie/clean food
- `aloe-vera.jpg` - Aloe vera
- `fern-pattern.jpg` - Fern fronds pattern

## Implementation Plan

### 1. Home Screen (index.tsx)
**Like 28's "Today" screen:**
- Replace the plain forest green gradient header with a full-bleed nature photo (forest-canopy.jpg or leaves-hero.jpg)
- Semi-transparent dark green overlay on the photo for readability
- "Good morning" greeting + user name in white serif text on top
- Crunchy score display overlaid on the nature background
- Quick action buttons (Scan, Score, Saved) as white cards floating below the hero image
- Getting Started card with botanical background

### 2. Onboarding Screens
- Each onboarding page gets a full-screen botanical background image
- Page 1 (Welcome): leaves-hero.jpg with white text overlay
- Page 2 (What is Crunchy): forest-canopy.jpg
- Page 3 (Preferences): eucalyptus.jpg
- Page 4 (Profile setup): monstera.jpg
- Use ImageBackground component with dark green overlay (rgba(61,90,62,0.6))

### 3. Scan Tab (scan.tsx)
- The scan area (camera preview + scan button) stays as-is
- Recent Scans section: add a subtle botanical watermark/background
- Section header with small leaf decoration

### 4. Explore Page (explore.tsx)  
- Hero image at top (fresh-produce.jpg or natural-skincare.jpg) with "Discover clean alternatives" overlay text
- Search bar floats on top of the hero
- If we bring back category cards, use image backgrounds:
  - Food: fresh-produce.jpg
  - Skincare: natural-skincare.jpg
  - Clothing: linen-texture.jpg
  - Home: herbs.jpg

### 5. Profile Screen (profile.tsx)
- Profile header area: subtle botanical background (fern-pattern.jpg) with dark overlay
- White text for name/score on the nature background
- Cards below remain white with thin borders

### 6. Score Detail (score-detail.tsx)
- Hero card with nature background (water-leaf.jpg) + score overlay
- Like 28's "Awaken" card with the butterfly

### 7. Scan Result (product-scan.tsx result state, scan-result.tsx)
- The share card gets a botanical border/frame
- Product header card with subtle nature texture background

### 8. Splash Screen
- Full screen leaves-hero.jpg or forest-canopy.jpg
- "crunchy" wordmark in cream/white Georgia font, centered
- Subtle fade-in animation

## Technical Implementation
- Use `ImageBackground` from react-native for full-bleed images
- Add dark/green overlay with `rgba(61,90,62,0.5)` for text readability
- Use `require()` for local images: `require('@/assets/images/aesthetic/leaves-hero.jpg')`
- Keep existing card styling (white bg, thin border) for content cards
- Images should NOT slow down the app - use `resizeMode="cover"`
- Don't use images everywhere - some screens should stay clean (settings, privacy policy, etc.)

## Gender-Neutral But Feminine
- NO women in bikinis or yoga poses
- Nature/botanical imagery is inherently gender-neutral
- Earthy tones (green, brown, cream) appeal to everyone
- The femininity comes from the editorial design, serif fonts, and soft styling - not from the images themselves

## Design Rules
- Forest green (#3D5A3E) overlay on images
- White/cream text on image backgrounds
- Georgia font for headings on images
- Cards that float on top of images use white bg + thin border
- Never put body text directly on a busy image - always use overlay
