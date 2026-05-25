# Cosmic Bites — Product Requirements (v1 MVP)

## What this is
A premium **pure-vegetarian catering** mobile app (Expo + FastAPI + MongoDB) for India's
celebration market — birthdays, house parties, housewarming, pre-wedding, corporate, festive.
Caters 20–500 guests. Customer-facing app focused on **lead capture → instant quote → handoff to WhatsApp**.

## V1 scope (shipped)
- **Auth**: Email + password registration & login (JWT, 7-day expiry, bcrypt). Admin user seeded.
- **Home**: Premium dark luxury theme (saffron + emerald + plum). Hero with tagline & 3 CTAs (Quote, Menus, Consultation). Event categories grid, signature dishes carousel, live counter showcase, 4-step process, portfolio teaser, testimonials carousel, corporate client logos, WhatsApp/Call CTAs.
- **Services**: 8 catering service cards (Birthday, House Party, Housewarming, Pre-Wedding, Corporate, Festive, Live Counter, Bulk Meal) with starting prices.
- **Menus**: 10 categorized cuisines (North Indian, South Indian, Chinese, Italian, Chaat, Snacks, Desserts, Mocktails, Kids Menu, Jain Menu) with veg/jain/spice/live counter badges and per-plate pricing.
- **Instant Quote Builder**: 6-step flow (Event → Guests → Cuisines → Services → Extras → Summary) with live pricing engine (base + cuisine premiums + service multiplier + live counter add-ons + staff/decor extras), inquiry submission, WhatsApp follow-up.
- **Portfolio**: Bento-style gallery with event-type filters and case-study detail view (8 sample events including 150 Pax Corporate, Terrace Birthday, Engagement Function).
- **Profile**: Edit name/phone/DoB/anniversary/address. View submitted quotes with status.
- **Engagement**: WhatsApp + Call CTAs throughout (top bar, hero, contact block, profile, success screen).

## Tech
- **Backend**: FastAPI, Motor (MongoDB async), passlib/bcrypt, python-jose JWT, idempotent seeding on startup (admin + 6 categories + 8 services + 26 menu items + 8 portfolio + 5 testimonials + 3 logos).
- **Frontend**: Expo Router file-based routing, React Native components only, `@/src/utils/storage` for tokens, `@expo/vector-icons` for icons, fetch-based client.
- **Design**: Luxury dark theme (#0B1511 bg, #E6B04D primary), data-testid on all interactive elements.

## Future roadmap (not in v1)
- Payment gateway (Razorpay/Stripe) for advance booking
- Push notifications (festival packages, follow-ups)
- Loyalty points & reorder for corporate clients
- Community: recipe sharing, pre-book small-batch
- Blog/feed: DIY ideas, festival recipes
- Web-based admin panel for media upload, package editing, quote management

## Business growth lever
**WhatsApp handoff after every quote**: The success screen routes leads directly to a pre-filled WhatsApp message with Quote ID, dramatically increasing sales-conversation conversion vs. email-only inquiries — critical for the Indian catering market where most deals close on chat.
