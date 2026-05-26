# Cosmic Bites — Product Requirements

## What this is
A premium **pure-vegetarian catering** business website with an integrated admin console, built on a single backend (FastAPI + MongoDB) and a React frontend (Expo Router targeting web).

## Pages (web)
1. **`/`**  Homepage — hero, trust strip, about teaser, event categories, packages, signature dishes, testimonials, CTA band
2. **`/menu`** — Menu page with category filter
3. **`/packages`** — Catering packages with images, features, pricing
4. **`/about`** — About + values + milestones + stats
5. **`/contact`** — Contact info cards + inquiry form (submits to `/api/inquiries`)
6. **`/admin`** — Password-protected admin console (login + dashboard + CRUD)

## Admin console (`/admin`)
- Login screen (admin role required)
- Dashboard with KPIs (total quotes, pending, new inquiries, customers, menu, portfolio, pipeline)
- Menu CRUD (create/edit/delete + image upload)
- Packages CRUD (create/edit/delete + image upload)
- Inquiries: list with status filter (new/replied/resolved), inline reply notes, email/WhatsApp/delete actions
- Quotes: list with status filter (pending/contacted/confirmed/cancelled), inline status updates, email/WhatsApp/delete
- Media library: upload images (base64) and copy URL for reuse

## Backend (unchanged — FastAPI + MongoDB)
- Public: `/api/menu`, `/api/services`, `/api/testimonials`, `/api/event-categories`, `/api/corporate-clients`, `/api/portfolio`, `/api/inquiries` (POST)
- Auth: `/api/auth/login`, `/api/auth/me`
- Admin (JWT + admin role): `/api/admin/stats`, `/api/admin/menu/*`, `/api/admin/services/*`, `/api/admin/inquiries/*`, `/api/admin/quotes/*`, `/api/admin/media`

## Tech
- **Backend**: FastAPI, Motor (MongoDB async), passlib/bcrypt, python-jose JWT, idempotent seeding on startup
- **Frontend**: Expo Router (React + React Native Web), fetch-based client, AsyncStorage for admin JWT, Ionicons

## Admin credentials (seeded)
- Email: admin@cosmicbites.com
- Password: Admin@123

## Business growth lever
SEO-friendly catering site captures leads via inquiry form. Admin console manages menu, packages, inquiries and quotes with one-click WhatsApp follow-up.
