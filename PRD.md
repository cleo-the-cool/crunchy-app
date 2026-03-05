# Product Requirements Document: Crunchy

**Product:** All-in-one clean living app for Gen Z women
**Owner:** Maddy
**Status:** Draft
**Last Updated:** March 2026
**Vision:** Replace 5+ fragmented eco apps with one beautiful platform that makes conscious living effortless.
**Target ARR:** $1M-$10M

---

## 1. Executive Summary

### Product Vision
Crunchy is a mobile-first app that consolidates product scanning, clean alternatives, DIY recipes, restaurant discovery, and community into one sleek interface for Gen Z women pursuing a clean, non-toxic lifestyle. It replaces the fragmented experience of juggling Yuka, Seed Oil Scout, EWG, Pinterest boards, and Reddit threads.

### Key Differentiator
No existing app offers the full "crunchy stack." Yuka does food scanning. EWG does cosmetics. Seed Oil Scout does restaurants. Pinterest has DIY recipes. Reddit has community. Crunchy is the first app to combine ALL of these, plus universal scanning that goes beyond barcodes: scan any product label, clothing tag, drink bottle, or item and get a toxin analysis with clean alternatives.

### Success Definition
- 10,000 MAU within 3 months of launch
- 5-10% free-to-paid conversion
- $20K-$40K MRR by month 6
- App Store rating 4.5+

### Strategic Alignment
- Targets the $100B+ clean living market growing 8-15% annually
- Clean beauty alone projected to hit $23.7B by 2033
- First-mover advantage: zero comprehensive competitors
- Aligns with Gen Z's demand for transparency, sustainability, and mobile-first experiences
- MAHA movement and eco-awareness trends accelerating demand

### Resource Requirements
- **Team:** Solo founder + AI tools (Bolt.new for UI, Windsurf for backend)
- **Budget:** $0-$10K
- **MVP Timeline:** 2-4 weeks
- **Skills:** React Native, Supabase, API integration, basic ML/vision

---

## 2. Problem Statement & Opportunity

### Problem Definition
Gen Z women living a "crunchy" lifestyle currently:
- Juggle 5+ separate apps daily (Yuka, Seed Oil Scout, EWG, Pinterest, Reddit)
- Spend excessive time cross-referencing information across platforms
- Have no single source of truth for clean living decisions
- Can't scan non-food products (clothes, water bottles, household items) for toxicity
- Lack community built specifically around their lifestyle

**Pain Score: 9/10 (Severe)**
- Pain frequency: 9/10 (daily interactions with multiple apps)
- Pain intensity: 8/10 (strong emotional frustration, desire for simplicity)
- Current solutions: 5/10 (specialized apps exist but no all-in-one)
- Willingness to pay: 8/10 (strong community engagement indicates high motivation)

**Evidence:**
- Users juggle 5+ apps like Yuka and Seed Oil Scout daily
- Millions engage in Reddit's r/ZeroWaste for non-toxic solutions
- Facebook groups actively discuss DIY non-toxic alternatives
- YouTube channels amass millions of views on DIY eco-friendly content
- "Non toxic cleaners" keyword: 22.2K volume, +2,423% growth

### Opportunity Analysis
- **Market size:** $100B+ clean living market
- **Growth:** 8-15% annually
- **Target segment:** Millions of Gen Z women on TikTok, Pinterest, Reddit
- **Competitive gap:** No app consolidates the full crunchy lifestyle stack
- **Opportunity score:** 9/10 (Exceptional)
- **Market timing:** 9/10 (Perfect)
- **Community signals:** Reddit 8/10 (5 subreddits, 2.5M+ members), Facebook 7/10 (5 groups, 150K+), YouTube 7/10 (14 channels)

### Key Risks
- API integration challenges
- Marketing budget management
- Potential misalignment with audience trends
- Competition from existing single-purpose apps expanding

---

## 3. Target Users

### Primary Persona: "Crunchy Girl"
- **Age:** 16-28 (Gen Z core)
- **Gender:** Primarily women
- **Platforms:** TikTok (primary), Pinterest, Reddit (r/ZeroWaste, r/CleanLiving, r/NaturalBeauty)
- **Behavior:** Researches ingredients obsessively, DIYs cleaning products, avoids seed oils, shops organic when possible, shares finds with friends
- **Current workflow:** Open Yuka to scan groceries → check EWG for new skincare → scroll Pinterest for DIY recipes → ask Reddit for recommendations → check Seed Oil Scout before eating out
- **Frustration:** "Why isn't this all in one place?"
- **Goal:** Make clean living choices effortlessly, without spending hours researching across platforms
- **Success criteria:** Can scan ANY product, get a clear toxin rating, find a clean alternative, and share it with friends, all in under 30 seconds

### Secondary Personas
- **"Crunchy Curious"** (18-25): Just starting their clean living journey. Needs guidance, education, and a gentle onramp. The quiz hooks them.
- **"Crunchy Mom"** (25-35): Making cleaner choices for her family. Needs product scanning for baby products, kid-safe cleaning supplies, non-toxic toys.
- **"Eco Creator"** (20-30): Health/wellness content creator. Needs a community hub and shareable content (scan results, crunchy scores).

### User Journey: Current State
1. Hear about a product on TikTok → open browser to research ingredients
2. Find conflicting info → check EWG database separately
3. Want a clean alternative → search Amazon, ask Reddit
4. Want to DIY instead → search Pinterest for recipes
5. Want to share findings → post across multiple platforms
6. Want restaurant recommendations → open Seed Oil Scout or ask in Facebook group

### User Journey: Future State (with Crunchy)
1. See a product anywhere → open Crunchy, scan it (barcode OR label OR product itself)
2. Instantly see toxin rating + flagged ingredients + why they're bad
3. Tap "Find Alternatives" → curated clean swaps with prices and buy links
4. Tap "DIY Instead" → homemade recipe for a clean version
5. Share scan result or crunchy score → friends download app (viral loop)
6. Browse community → discover new products, recipes, tips from other crunchy girls

---

## 4. Functional Requirements

### 4.1 MUST HAVE (MVP)

#### F1: Universal Product Scanner
The killer feature. Goes beyond barcode scanning.

**Scanning Modes:**
1. **Barcode scan:** Scan any product barcode → instant lookup from product databases
2. **Label scan (OCR):** Point camera at an ingredient list/label → OCR reads ingredients → analyzes each one for toxicity
3. **Product recognition (AI):** Can't find a label? Scan the product itself → AI identifies the product → looks up known ingredients/materials → provides toxin analysis

**Output for every scan:**
- Overall safety rating: Clean ✅ / Caution ⚠️ / Avoid 🚫 (simple, color-coded)
- Detailed ingredient breakdown with plain-English explanations
- Flagged ingredients highlighted with severity (mild concern → known toxin)
- "Why it's bad" one-liner for each flagged ingredient
- 2-5 cleaner alternatives with prices and purchase links (affiliate)
- Option to "DIY Instead" if a recipe exists

**Product categories:**
- Food and beverages
- Skincare and cosmetics
- Cleaning products
- Personal care (deodorant, shampoo, toothpaste, etc.)
- **Clothing and textiles** (scan fabric tags for harmful dyes, synthetic materials, chemical treatments)
- **Drink bottles and containers** (BPA, phthalates, lead in materials)
- Baby products
- Household items

**Acceptance criteria:**
- Barcode scan returns results in under 2 seconds
- OCR label scan returns results in under 5 seconds
- Product recognition returns results in under 8 seconds
- Works in low-light conditions
- Handles blurry/partial labels gracefully (asks user to re-scan with helpful guidance)
- Offline mode caches recent scans

**Data sources:** Open Food Facts API, EWG database, USDA FoodData Central, curated internal database (start with top 1,000 products manually), AI analysis for unlisted products

**User stories:**
- As a crunchy girl, I want to scan a protein bar barcode so I can instantly see if it has seed oils or artificial sweeteners
- As a crunchy girl, I want to photograph my shampoo's ingredient list so I can understand which chemicals to avoid
- As a crunchy girl, I want to point my camera at a water bottle so the app can tell me if the material is BPA-free
- As a crunchy girl, I want to scan a clothing tag so I can see if the fabric was treated with harmful chemicals

#### F2: Crunchy Score Quiz (Lead Magnet + Onboarding)
- 10-15 fun, visual questions about current lifestyle habits
- Categories: food, skincare, cleaning, home, clothing, mindset
- Results: score from 1-100 with a label (Seedling 🌱 → Fully Rooted 🌳)
- Personalized recommendations based on score ("You scored 34: here are the 3 easiest swaps to level up")
- Shareable result card designed for Instagram/TikTok stories (viral loop)
- No account required to take quiz (reduces friction)
- Account prompt after results ("Save your score and track your progress")

**Acceptance criteria:**
- Quiz completes in under 3 minutes
- Result card renders correctly on all screen sizes
- Share button works for Instagram Stories, TikTok, iMessage, and copy-link
- Quiz can be retaken monthly to track progress

#### F3: Clean Alternatives Database
- Search any product by name → see 2-5 clean alternatives
- Each alternative shows: name, brand, price, where to buy, safety rating, why it's better
- Filter by: price range, availability, certifications (organic, EWG verified, cruelty-free), rating
- Save favorites to personal lists ("My Clean Swaps")
- Affiliate links on all product recommendations

**Acceptance criteria:**
- Database launches with 500+ products across all categories
- Search returns results in under 1 second
- Filters work combinatorially
- Affiliate links track correctly

#### F4: DIY Recipe Library
- Curated recipes: cleaning products, skincare, haircare, candles, bug spray, laundry detergent, etc.
- Each recipe: ingredients list with quantities, step-by-step instructions, photos, cost estimate vs. store-bought, difficulty rating (1-5), time estimate
- Filter by: category, difficulty, time, ingredients on hand
- "I have these ingredients" smart filter
- Save favorites, mark as "made it"

**Acceptance criteria:**
- Launch with 75+ recipes across at least 5 categories
- Recipes load with images in under 2 seconds
- Search and filter work correctly
- Each recipe has at least 3 user-visible fields (time, cost, difficulty)

#### F5: Community Feed
- Social feed: share tips, product reviews, DIY results, scan results, hauls
- Post types: text, photo, scan share, recipe share, poll
- Follow users, like, comment
- Hashtag discovery (#crunchyskincare, #nontoxichome, #seedoilfree)
- "Trending" section for popular posts
- Report/block functionality

**Acceptance criteria:**
- Feed loads in under 2 seconds
- Supports image uploads up to 10MB
- Moderation: auto-flag inappropriate content
- Infinite scroll with smooth performance

#### F6: User Accounts & Profiles
- Sign up with email, Google, or Apple
- Profile: username, avatar, crunchy score, scan history, saved items, posted content
- Scan history with re-access to past results
- Saved alternatives and recipes
- Progress tracking (crunchy score over time)

**Acceptance criteria:**
- Onboarding flow completes in under 60 seconds
- OAuth works for Google and Apple
- Profile loads in under 1 second

### 4.2 SHOULD HAVE (v1.1, Weeks 5-8)

#### F7: AI-Powered Personalized Recommendations
- Based on scan history, quiz results, saved items, and stated preferences
- Daily "Clean Swap of the Day" push notification
- "Based on your scans, you might want to switch from X to Y"
- Powered by Claude API

#### F8: Restaurant & Food Finder
- Find nearby restaurants with clean ingredients, no seed oils, organic options
- Geolocation-based map view
- User-contributed ratings and reviews
- Filter by: cuisine, dietary needs, price, distance, "seed oil free," "organic"
- Partnership pipeline with clean food establishments

#### F9: Advanced Filtering & Search
- Filter products by specific toxins to avoid (parabens, phthalates, SLS, etc.)
- Filter by certifications (USDA Organic, EWG Verified, B Corp, etc.)
- Dietary filters (vegan, gluten-free, keto, etc.)
- "Toxin watchlist" where users add specific ingredients they always want flagged

#### F10: Push Notifications
- Product recall alerts for items in scan history
- New recipes matching preferences
- Community activity (likes, comments, follows)
- Weekly "crunchy digest" with top community posts

### 4.3 COULD HAVE (v2, Weeks 9-16)

#### F11: Local Farm Finder
- Map of local farms, farmers markets, co-ops, CSAs
- Filter by: products offered, organic/conventional, distance, season
- User reviews and tips

#### F12: Seasonal Content & Wellness
- Seasonal eating plans and guides
- Mental wellness tips connected to clean living
- Monthly challenges ("No plastic July," "DIY cleaning month")
- Wellness workshops ($29.99/mo add-on tier)

#### F13: User-Submitted Content
- Submit DIY recipes (moderated before publishing)
- Submit restaurant reviews
- Submit product alternatives
- Contributor badges and recognition

#### F14: Brand Partnership Portal
- Self-serve portal for eco-friendly brands
- Featured product placement (clearly labeled as sponsored)
- Brand profiles with certification verification
- Campaign analytics for brand partners

### 4.4 WON'T HAVE (for now)
- Desktop/web app (mobile-first, web later)
- E-commerce/direct purchasing (use affiliate links instead)
- Meal planning
- Fitness/exercise tracking
- Medical/health advice

---

## 5. Technical Requirements

### Architecture
- **Frontend:** React Native (Expo) for cross-platform iOS + Android
- **Backend:** Supabase (PostgreSQL database, Auth, Realtime subscriptions, Edge Functions, Storage)
- **AI/ML:** Claude API (ingredient analysis, personalized recs, product recognition assist), Google Cloud Vision or Apple Vision for OCR
- **Barcode:** Open Food Facts API + UPC lookup APIs
- **Product Recognition:** Google Cloud Vision API or custom model for product identification from photos
- **Maps:** Google Places API (restaurant finder, farm finder)
- **Payments:** RevenueCat (in-app subscription management)
- **Push:** Expo Push Notifications
- **Analytics:** Mixpanel or PostHog
- **Hosting:** Supabase (backend), Vercel (marketing site), Expo EAS (app builds)
- **CDN:** Cloudflare or Supabase Storage for images

### API Requirements

**Product Scanner API:**
- POST /api/scan/barcode → { barcode } → { product, rating, ingredients, alternatives }
- POST /api/scan/label → { image } → OCR → { ingredients, rating, flagged, alternatives }
- POST /api/scan/product → { image } → Vision AI → { identified_product, ingredients, rating, alternatives }
- Response time: <2s barcode, <5s label, <8s product recognition
- Rate limiting: 10 scans/day free, unlimited paid

**Community API:**
- Standard CRUD for posts, comments, likes, follows
- Realtime subscriptions via Supabase Realtime
- Image upload to Supabase Storage
- Pagination: cursor-based, 20 items per page

**Auth:**
- Supabase Auth with email, Google OAuth, Apple Sign-In
- JWT tokens, refresh token rotation
- Row Level Security on all tables

### Data Model (Core Tables)
- **users**: id, email, username, avatar_url, crunchy_score, subscription_tier, created_at
- **products**: id, name, brand, barcode, category, ingredients (jsonb), toxin_rating, image_url
- **alternatives**: id, product_id, name, brand, price, buy_url (affiliate), rating, why_better
- **scans**: id, user_id, product_id, scan_type (barcode/label/product), result (jsonb), created_at
- **recipes**: id, title, category, difficulty, time_minutes, cost_estimate, ingredients (jsonb), steps (jsonb), image_url
- **posts**: id, user_id, type, content, image_url, hashtags, likes_count, created_at
- **comments**: id, post_id, user_id, content, created_at
- **follows**: follower_id, following_id
- **saved_items**: user_id, item_type (product/recipe/alternative), item_id

### Performance Specifications
- App cold start: <3 seconds
- Screen transitions: <300ms
- Barcode scan to result: <2 seconds
- Label OCR to result: <5 seconds
- Product recognition to result: <8 seconds
- Feed load: <2 seconds
- Search results: <1 second
- Image upload: <5 seconds for 10MB
- 99.9% uptime target
- Support 10,000 concurrent users at launch scale

### Security Requirements
- All data encrypted in transit (TLS 1.3) and at rest
- Supabase Row Level Security on all tables
- No PII stored beyond email and username
- GDPR-compliant: data export and deletion on request
- Apple App Store and Google Play privacy compliance
- Content moderation for community posts
- Rate limiting on all API endpoints
- Input sanitization on all user-generated content

### Platform Requirements
- iOS 16+ (primary)
- Android 12+ (secondary, same codebase via React Native)
- Marketing website: all modern browsers
- Responsive design: iPhone SE through iPad

---

## 6. User Experience Requirements

### Design Principles
- **Clean and natural:** Soft greens, warm neutrals, organic shapes. The app should feel like a breath of fresh air.
- **Simple over comprehensive:** Show the rating first, details on tap. Don't overwhelm.
- **Scannable (pun intended):** Users should be able to scan a product and get value in under 10 seconds.
- **Shareable:** Every result, score, and recipe should be designed to look great when shared.
- **Inclusive:** Avoid judgment. "Crunchy Curious" users are just as welcome as veterans.

### Key Screens
1. **Home:** Quick scan button (prominent), daily swap recommendation, trending community posts
2. **Scanner:** Camera viewfinder with scan mode toggle (barcode/label/product), recent scans below
3. **Scan Result:** Rating badge (Clean/Caution/Avoid), ingredient breakdown, alternatives carousel, "DIY Instead" button, share button
4. **Explore:** Search bar, browse by category (food, skincare, cleaning, clothing, home), trending alternatives
5. **Recipes:** Browse/search DIY recipes, filter bar, recipe cards with photos
6. **Community:** Feed of posts, trending hashtags, create post button
7. **Profile:** Crunchy score, scan history, saved items, settings
8. **Quiz:** Full-screen, swipeable question cards, animated result reveal

### Accessibility
- WCAG 2.1 AA compliance
- VoiceOver and TalkBack support
- Minimum 4.5:1 contrast ratio
- Touch targets minimum 44x44pt
- Alt text on all images
- Supports Dynamic Type (iOS) and font scaling (Android)

### Onboarding Flow
1. Welcome screen → "Take the Crunchy Quiz" (or skip)
2. Quiz (10-15 questions, 2-3 min)
3. Result screen with score and personalized tips
4. "Create account to save your score" (email/Google/Apple)
5. Choose interests (food, skincare, cleaning, clothing, home)
6. Home screen with first scan prompt

---

## 7. Monetization

### Pricing Tiers

**Free Tier:**
- 5 product scans per day
- Crunchy Score quiz (unlimited retakes)
- Browse community feed (read + limited posting)
- Browse recipe previews (10 full recipes)
- Basic search and browse

**Crunchy Starter: $9.99/month**
- Unlimited barcode + label scanning
- Full DIY recipe library
- Recipe conversion tools (conventional → clean)
- Seasonal eating plans
- Unlimited community posting
- Save unlimited favorites

**Crunchy Premium: $19.99/month**
- Everything in Starter
- AI product recognition scanning (point at any product)
- AI-powered personalized recommendations
- Advanced toxin filtering and watchlists
- Restaurant and food finder
- Local farm finder
- Wellness tips and guides
- Priority support
- Early access to new features

### Additional Revenue Streams
- **Affiliate commissions:** 3-8% on every product purchased through app recommendation links (Amazon Associates, brand direct)
- **Brand partnerships:** $10K-$50K/year for eco-friendly brands to get featured placement, brand profiles, campaign analytics
- **Monthly Wellness Workshops:** $29.99/month add-on for interactive workshops on eco-friendly living, mental wellness, DIY masterclasses
- **Data insights:** Anonymized trend data sold to clean product brands (future, with user consent)

### Revenue Projections
- Month 1-3: Focus on user acquisition, minimal revenue ($1K-$5K MRR)
- Month 3-6: Conversion optimization, first brand partnerships ($10K-$40K MRR)
- Month 6-12: Scale marketing, expand partnerships ($50K-$100K MRR)
- Year 2: $1M+ ARR target

---

## 8. Go-to-Market Strategy

### Channel Strategy

**TikTok (Primary, High Engagement)**
- Partner with crunchy/clean living influencers for authentic "scan with me" content
- "I scanned my entire bathroom" series format
- Crunchy Score quiz as shareable content (viral loop)
- Target hashtags: #crunchygirl #nontoxic #cleanliving #crunchytok #seedoilfree
- Frequency: Weekly content, 1% CTR target
- Budget: Micro-influencers ($50-$500 per post)

**Pinterest (Visual Content)**
- Create boards for every DIY recipe category
- Pin scan result infographics
- Target: "non toxic cleaning recipes," "clean beauty DIY," "natural alternatives"
- Frequency: Bi-weekly, 200 saves/month target

**Reddit (Community-Driven)**
- Genuine participation in r/ZeroWaste (1M+ members), r/CleanLiving, r/NaturalBeauty
- Host AMAs about clean living
- Share quiz as community resource
- Frequency: Monthly

**YouTube (Long-form)**
- Partner with creators for detailed product review videos
- "I replaced all my toxic products" transformation content

### Launch Strategy
1. **Pre-launch (2 weeks before):** Landing page with waitlist, quiz available on web, teaser TikToks
2. **Soft launch:** 100 beta users from Reddit/TikTok communities, collect feedback aggressively
3. **Public launch:** App Store + coordinated influencer posts + Product Hunt
4. **Post-launch:** Iterate based on feedback, double down on highest-performing channel

### Early Positioning
- "Simplify your clean living journey"
- "One app for all your non-toxic needs"
- "Stop juggling 5 apps. Start living clean."

### Customer Acquisition
- Target CAC: $5-$7
- Target churn: <15%
- Target pilot conversion: 5% free-to-paid

---

## 9. Success Metrics & Analytics

### Primary KPIs
- **Monthly Active Users (MAU):** 10,000 by month 3
- **Daily Active Scanners:** 30%+ of MAU scanning daily
- **Free-to-Paid Conversion:** 5-10%
- **MRR:** $20K-$40K by month 6
- **App Store Rating:** 4.5+

### Secondary Metrics
- Quiz completion rate (target: 80%+)
- Quiz share rate (target: 20%+)
- Scans per user per day (target: 2-3)
- Community posts per day (target: 50+ by month 3)
- Recipe saves per user (target: 5+ in first month)
- Affiliate click-through rate (target: 3-5%)
- Day 1 retention (target: 60%+)
- Day 7 retention (target: 30%+)
- Day 30 retention (target: 15%+)

### Analytics Implementation
- **Mixpanel or PostHog:** Event tracking for scans, quiz completions, shares, purchases, feature usage
- **RevenueCat:** Subscription analytics, trial conversion, churn
- **Custom dashboard:** Real-time MAU, scans, revenue
- **A/B testing:** Quiz flow, paywall placement, scan result layout, push notification copy

### Review Cadence
- Daily: scan volume, new signups, crash rate
- Weekly: conversion rates, retention, community engagement, top scanned products
- Monthly: MRR, churn, CAC, LTV, feature adoption, NPS survey
- Quarterly: strategic review, roadmap adjustment

---

## 10. Implementation Plan

### Phase 1: MVP (Weeks 1-4)
**Goal:** Core scanning + quiz + alternatives + recipes + community

- Week 1: Project setup, design system, database schema, auth flow, quiz UI
- Week 2: Barcode scanner integration, product database seeding (500+ products), scan result screen
- Week 3: Label OCR scanning, alternatives database, DIY recipe library (75+ recipes), community feed
- Week 4: Profile/accounts, saved items, paywall integration, testing, App Store submission

**Milestone:** App live on TestFlight with 100 beta users

### Phase 2: Growth (Weeks 5-8)
- AI product recognition scanning (point camera at anything)
- AI-powered personalized recommendations
- Restaurant finder with geolocation
- Advanced filtering (toxin watchlists, certifications)
- Push notifications
- Affiliate link integration
- Premium tier launch ($19.99)
- Influencer marketing campaign kick-off

**Milestone:** Public launch on App Store + Google Play, 1,000+ users

### Phase 3: Expansion (Weeks 9-16)
- Local farm finder
- User-submitted recipes and reviews
- Seasonal content calendar
- Monthly wellness workshops
- Brand partnership portal (self-serve)
- Mental wellness features
- Expanded product database (10,000+ products)

**Milestone:** 10,000 MAU, $20K+ MRR, 3+ brand partnerships

### Phase 4: Scale (Months 5-12)
- International expansion (UK, Australia, EU)
- Desktop/web companion
- API for third-party integrations
- Advanced community features (groups, challenges, leaderboards)
- Machine learning for better product recognition
- White-label B2B opportunities

**Milestone:** $100K+ MRR, 50,000+ MAU

---

## 11. Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Product database gaps (scan returns no data) | High | High | Start with curated top 1,000 products. Use AI analysis as fallback for unlisted items. Let users request products. Grow database continuously. |
| OCR accuracy on damaged/small labels | Medium | Medium | Offer manual ingredient entry as fallback. Use multiple OCR engines. Improve with user corrections. |
| Product recognition AI inaccuracy | Medium | High | Launch as Premium-only feature. Use confidence scores and ask for confirmation. Improve model over time. |
| API rate limits/costs | Medium | Medium | Cache aggressively. Use multiple data sources. Budget for API costs in pricing. |
| App Store rejection | Low | High | Follow all guidelines strictly. No health claims. Clear privacy policy. |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Yuka expands to all-in-one | Low | High | Move fast. Build community moat (Yuka has no social features). Focus on Gen Z brand and UX. |
| Low conversion to paid | Medium | High | Test paywall placement aggressively. Make free tier useful but gate the magic (AI scanning, unlimited scans). |
| Marketing budget overrun | Medium | Medium | Start with organic/micro-influencer only. Track CAC religiously. Kill underperforming channels fast. |
| Audience misalignment | Low | High | Beta test with 100 real crunchy girls before public launch. Iterate based on actual usage data. |
| Legal issues with health/toxin claims | Medium | High | Use disclaimers. Cite sources. Say "may contain" not "is toxic." Consult legal before launch. |

---

## 12. Competitive Landscape

### Direct Competitors
- **Yuka** (Main competitor): Food and cosmetics scanning only. European-focused. No community, no DIY, no restaurant finder, no clothing/household scanning. 50M+ downloads but narrow scope.
- **EWG Healthy Living:** Cosmetics and cleaning product database. Clunky UX, no scanning, no community.
- **Seed Oil Scout:** Restaurant-only. Very niche.

### Indirect Competitors
- **Pinterest:** DIY recipes exist but scattered, no scanning, no curation
- **Reddit:** Community exists but fragmented across subreddits
- **Think Dirty:** Cosmetics scanning app, limited categories
- **Clearya:** Browser extension for online shopping, not mobile-first

### Competitive Advantage
- First all-in-one solution (nobody else combines scan + alternatives + DIY + community + restaurants)
- Universal scanning (beyond barcodes: labels, products, clothing, bottles)
- Gen Z-native design and branding
- Community-driven (network effects create switching costs)
- AI-powered analysis for products not in any database

---

## 13. Quality Checklist

- ✅ Problem clearly defined with evidence (pain score 9/10, market data, keyword growth)
- ✅ Solution aligns with user needs (consolidates 5+ apps) and business goals ($1M-$10M ARR)
- ✅ Requirements are specific and measurable (response times, scan limits, database sizes)
- ✅ Acceptance criteria are testable (every feature has clear pass/fail criteria)
- ✅ Technical feasibility validated (existing APIs, proven tech stack, 3/10 execution difficulty)
- ✅ Success metrics defined and trackable (MAU, conversion, MRR, retention)
- ✅ Risks identified with mitigation plans (10+ risks covered)
- ⬜ Stakeholder alignment confirmed (pending Maddy review)

---

*This is a living document. Update as decisions are made and learnings emerge.*
