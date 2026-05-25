# Cosmic Bites — Product Requirements

## What this is
A premium **pure-vegetarian catering** business platform built on a single backend (FastAPI + MongoDB) with three frontends served from the same Expo Router project:
1. **Public SEO-friendly website** (`/`, `/about`, `/services`, `/contact`, `/get-quote`)
2. **Customer mobile app** (`/home`, `/menu`, `/quote`, `/portfolio`, `/profile`) — auth-gated
3. **Web-based admin console** (`/admin/*`) — admin-role gated

Caters birthdays, house parties, housewarmings, pre-wedding events, corporate events and festive celebrations. Min 20–500 guests.

---

## v1 — Mobile customer app + JWT auth (shipped)
- Email + password registration & login (bcrypt, 7-day JWT)
- 6-step Instant Quote Builder with live pricing engine
- Categorized menus (10 cuisines, veg/jain/spice/live-counter badges)
- Bento-style portfolio with filters and case study detail
- Profile with DoB, anniversary, address, kids; My-Quotes history
- WhatsApp + Call CTAs throughout
- Premium dark luxury design (saffron + emerald + plum)

## v2 — Admin console (shipped)
- Web-optimised admin shell with role guard + responsive sidebar
- Dashboard with 7 KPIs (total quotes, pending, customers, menu items, portfolio, new inquiries, pipeline value)
- **Quotes management**: filter by status, view details, change status (pending/contacted/confirmed/cancelled), WhatsApp customer, call customer, delete
- **Queries/Inquiries**: list, reply (saves note + marks replied/resolved), email customer, delete
- **Generic CRUD** for Menu / Services / Portfolio / Testimonials / Corporate Clients with shared `CrudList` component
- **Media upload**: web file picker → base64 → stored in MongoDB → reusable as image URL or paste an external URL

## v3 — Public SEO website (shipped)
- Home (`/`): hero with tagline + 3 CTAs (Get Quote, WhatsApp, Sign In), event categories grid, corporate trust strip, about teaser, services grid, signature dishes carousel, 4-step process, portfolio teaser, testimonials, CTA band, full footer
- About (`/about`): story, 4 value pillars (Pure Vegetarian, Hygiene First, Fresh Ingredients, Multi-Event Mastery), milestones timeline
- Services (`/services`): all 8 catering packages with starting prices and features
- Contact (`/contact`): info cards (Call, WhatsApp, Email, Instagram) + message form
- Get Quote (`/get-quote`): public quote builder with live estimate and contact form — **no signup required**
- **SEO**: `document.title` + `<meta name="description">` + Open Graph tags per page
- Sticky top nav (Home / About / Services / Contact + Sign In + Get Quote)
- Responsive: 412px mobile → 1400px desktop

## Backend endpoint inventory
**Public** (no auth): `/api/event-categories`, `/api/services`, `/api/menu`, `/api/portfolio`, `/api/testimonials`, `/api/corporate-clients`, `/api/inquiries` (POST), `/api/quotes/estimate`, `/api/quotes/public`, `/api/media/{id}`

**Customer** (JWT): `/api/auth/*`, `/api/quotes` (POST + GET my)

**Admin** (admin role): `/api/admin/stats`, `/api/admin/quotes/*`, `/api/admin/inquiries/*`, `/api/admin/menu/*`, `/api/admin/services/*`, `/api/admin/portfolio/*`, `/api/admin/testimonials/*`, `/api/admin/corporate-clients/*`, `/api/admin/media`

## Tech
- **Backend**: FastAPI, Motor (MongoDB async), passlib/bcrypt, python-jose JWT, idempotent seeding on startup
- **Frontend**: Expo Router (web + native), React Native components only, fetch-based client, `@/src/utils/storage` for tokens, Ionicons
- **36/36 backend pytest** pass · all frontend flows verified end-to-end

## Future roadmap (not in v3)
- Razorpay token-amount payment
- Push notifications, loyalty points, reorder
- Community feed (recipes, pre-book small-batch), blog
- Google Maps embed on contact, Instagram feed embed
- Replace stub corporate logo placeholders with real brand SVGs
- Server-side rendering for SEO snippets / sitemap.xml

## Business growth lever
**Three funnels, one backend**: SEO website attracts organic search → public Quote / Inquiry forms capture leads → admin manages the funnel with one-click WhatsApp follow-up. Customer mobile app handles repeat business with logged-in quotes & history. Designed for the Indian catering market where most deals close on WhatsApp chat.
