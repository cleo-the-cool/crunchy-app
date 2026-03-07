# 🥦 Crunchy — Clean Living Scanner

**The all-in-one app for Gen Z women who want to live toxin-free.**

Crunchy replaces 5+ fragmented apps (Yuka, EWG, Seed Oil Scout, Pinterest, Reddit) with one beautiful platform. Scan any product, find clean alternatives, discover DIY recipes, and connect with a community that actually lives this lifestyle.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 **3-Mode Scanner** | Barcode scan, ingredient label OCR, or full AI product recognition |
| 🧪 **Toxin Analysis** | Every ingredient rated Safe / Concern / Toxic with plain-English explanations |
| ♻️ **Clean Alternatives** | 2-5 curated swaps for every flagged product, with prices and buy links |
| 🌱 **Crunchy Score Quiz** | Personal 1-100 score. Shareable result card for TikTok/Instagram |
| 🧴 **DIY Recipes** | 30+ homemade recipes for cleaning, skincare, haircare, and more |
| 👯 **Community Feed** | Posts, hashtags, likes, comments — built for crunchy creators |
| 💳 **Subscription Tiers** | Free / Starter ($9.99/mo) / Premium ($19.99/mo) |

---

## 🛠 Tech Stack

- **Framework:** React Native + [Expo](https://expo.dev) SDK 55
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Language:** TypeScript
- **Backend:** [Supabase](https://supabase.com) (Auth, Postgres, Storage, Edge Functions)
- **AI Scanning:** Google Gemini 2.0 Flash (vision + text analysis)
- **Product Data:** Open Food Facts API (free, open source)
- **Build:** Expo EAS Build
- **Web Preview:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo@latest`)
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### 1. Clone & Install

```bash
git clone https://github.com/cleo-the-cool/crunchy-app.git
cd crunchy-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Setup

Run the migrations against your Supabase project:

```bash
# Option A: Supabase CLI
supabase db push

# Option B: Paste manually
# Run supabase/migrations/00001_create_schema.sql
# Then run supabase/migrations/00002_row_level_security.sql
# in your Supabase SQL Editor
```

### 4. Run

```bash
# Development (Expo Go or device)
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android
```

> **Note:** This app uses Expo SDK 55. Expo Go on the App Store only supports up to SDK 52.
> For device testing, use `npx expo run:ios` (requires Xcode) or an EAS development build.

---

## 📁 Project Structure

```
crunchy-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Bottom tab navigator screens
│   │   ├── index.tsx       # Home screen
│   │   ├── scan.tsx        # Product scanner
│   │   ├── explore.tsx     # Browse alternatives
│   │   ├── recipes.tsx     # DIY recipe library
│   │   ├── community.tsx   # Social feed
│   │   └── profile.tsx     # User profile
│   ├── scan-result.tsx     # Scan analysis result
│   ├── quiz.tsx            # Crunchy Score quiz
│   ├── quiz-result.tsx     # Score result + share card
│   ├── paywall.tsx         # Subscription screen
│   ├── onboarding.tsx      # First-run onboarding
│   ├── interests.tsx       # Interest selection
│   ├── login.tsx           # Auth screens
│   └── signup.tsx
├── components/             # Reusable UI components
├── services/
│   └── gemini.ts           # Gemini AI scanning service
├── contexts/               # React context providers
├── data/                   # Seed data (products, recipes)
├── supabase/
│   └── migrations/         # SQL schema + RLS policies
├── utils/                  # Shared utilities
└── assets/                 # Icons, splash, images
```

---

## 🤖 AI Scanning Pipeline

Crunchy uses **Google Gemini 2.0 Flash** for all visual analysis:

```
User takes photo
      ↓
Base64 encoded → Gemini API
      ↓
Mode-specific prompt:
  • "item"        → Identify product + analyze toxicity
  • "ingredients" → Read ingredient list + rate each ingredient
  • "label"       → Analyze nutrition/claims label
      ↓
Structured JSON response:
  { productName, rating, ingredients[], concerns[], cleanAlternatives[] }
      ↓
Saved to Supabase scans table
Cache result by barcode (avoid re-scanning same product)
```

**Why Gemini over Google Cloud Vision:**
- Single API call for both image recognition AND text extraction
- Better ingredient understanding with context
- Rates ingredients on health impact (not just lists them)
- Cheaper at scale ($0 for first 15 RPM on free tier)

---

## 💰 Monetization

| Tier | Price | Limits |
|---|---|---|
| **Free** | $0 | 5 scans/day, 10 recipes |
| **Starter** | $9.99/mo | Unlimited scans, full recipes, community |
| **Premium** | $19.99/mo | AI recognition, personalized recs, restaurant finder |

Plus:
- **Affiliate commissions** on recommended clean product links
- **Brand partnerships** ($10K–$50K/year for featured placement)

---

## 🗃 Database Schema

Key tables (full schema in `supabase/migrations/`):

- `users` — extends Supabase auth, stores crunchy_score + subscription_tier
- `products` — barcode, rating, category, diy_recipe_id
- `ingredients` — per-product ingredient ratings (safe/concern/toxic)
- `alternatives` — clean swap recommendations per product
- `scans` — user scan history
- `recipes` — DIY recipe library with steps + ingredients
- `posts`, `comments`, `post_likes` — community feed
- `follows`, `saved_items` — social graph + bookmarks
- `quiz_results` — crunchy score history

---

## 📱 App Store

- **Bundle ID (iOS):** `com.cleothecooldev.crunchyapp`
- **Package (Android):** `com.cleothecooldev.crunchyapp`
- **Category:** Health & Fitness / Food & Drink
- **Age Rating:** 4+

---

## 🔒 Privacy

Crunchy collects only what's needed to personalize your clean living experience:
- Account email + name (required for auth)
- Scan history (linked to your account, deleteable)
- Quiz answers + crunchy score
- Community posts you create

We **never** sell your data. Full privacy policy: [crunchy.app/privacy](https://crunchy.app/privacy)

---

## 📄 License

Private. © 2026 Crunchy. All rights reserved.

---

*Built with 🥬 by Maddy + Cleo*
