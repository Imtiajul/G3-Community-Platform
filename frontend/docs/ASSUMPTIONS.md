# Implementation Assumptions & Project Decisions

This document records architectural, design token, dependency, and backend contract assumptions for the **"নিজের বলার মতো একটা গল্প" (A Story Worth Telling)** Bangla community platform frontend.

---

## 1. Technical Stack & Dependencies

- **Framework**: Next.js 14 (App Router) with React 18, React Server Components (RSC), and strict TypeScript mode (`noUncheckedIndexedAccess: true`).
- **Styling**: Tailwind CSS v3.4 + `tailwindcss-animate`, `@tailwindcss/typography`, and Radix UI primitives styled via shadcn/ui.
- **Icons**: Lucide React (`lucide-react`) + Google Material Symbols Outlined (for exact Stitch fidelity where Material icons are used).
- **Client State & Mutations**: TanStack Query (`@tanstack/react-query`) for interactive queries, mutations, cache invalidation, and optimistic updates.
- **Form Handling & Validation**: `react-hook-form` paired with `@hookform/resolvers/zod` and `zod` runtime schemas at API boundaries.
- **Type Generation**: `openapi-typescript` generates fully typed TypeScript interfaces from `backend/schema.yml`, consumed by `openapi-fetch` and server data-fetchers.
- **Markdown & Content Rendering**: `react-markdown` with `rehype-sanitize` enforcing strict HTML element sanitization (no raw scripts or external XSS vectors).
- **Typography & Localization**: `next/font/google` for `Noto Sans Bengali` (Bangla content) and `Inter` (English, UI labels, numeric dates). Locale defaults to `bn-BD`.
- **Feedback & Notifications**: `sonner` for accessible toasts; Recharts for responsive admin analytics visualizations.

---

## 2. Design System Tokens: Neo-Editorial Electric (Active)

Extracted from Google Stitch MCP project `12247759999368583774` ("Bangla Learning Community Design System"), Asset `3c51c879e8784564b9e2402b65ac5e0f`:
- **Theme**: Neo-Editorial Electric (Neo-brutalist structure meets modern high-contrast editorial typography and vibrant accents).
- **Surfaces & Borders**:
  - Background (Canvas): Pure White `#FFFFFF`
  - Pitch Black Text / Structural Borders: `#000000` / `#0E0E0E` (`border-2 border-dark`)
  - Elevated Surface Level 1: Pure White `#FFFFFF` with `border-2 border-dark` and flat offset hard shadow `3px 3px 0px #0E0E0E` (`shadow-neo`)
  - Surface Level 2 / Subtle Fill: Neutral Tint `#F5F5F4` / `#FAFAF9`
- **Color Accents & Semantic States**:
  - **Mint Green (`#63DB9A`)**: Primary Call-to-Action buttons, active elements, verified status chips, highlighted badges.
  - **Electric Lime (`#E2E361`)**: Secondary accents, tags, pending/in-review notices, key batch pills.
  - **Neon Magenta (`#FF49D2`)**: Notifications, destructive warnings, rejected statuses, urgent alerts.
  - **Pitch Black (`#0E0E0E`)**: Solid crisp typography, high-contrast structural borders, and hard drop-shadows.
- **Typography & Font Pairings**:
  - `Space Grotesk`: Bold headlines, hero titles, statistics, numbers, section headers (`font-space-grotesk`).
  - `Noto Sans Bengali`: Bengali editorial body copy, session content, Bengali longform (`font-bangla`).
  - `JetBrains Mono`: Monospace metadata, batch pills, registration IDs, timestamps, table column headers (`font-mono`).
  - `Inter`: Complementary English subtext and UI labels.
- **Elevation & Hard Shadows**:
  - Card & Container: `3px 3px 0px #0E0E0E` (`shadow-neo`)
  - Buttons & Small Badges: `2px 2px 0px #0E0E0E` (`shadow-neo-sm`)
  - Modals & Hero Containers: `6px 6px 0px #0E0E0E` (`shadow-neo-lg`)
  - Colored Accent Shadows: `3px 3px 0px #63DB9A` (`shadow-neo-mint`), `3px 3px 0px #E2E361` (`shadow-neo-lime`), `3px 3px 0px #FF49D2` (`shadow-neo-neon`)
- **Shapes & Radii**:
  - Sharp brutalist 4px (`rounded` / `0.25rem`) for cards, buttons, containers, textareas, inputs.
  - Full pill (`rounded-full`) reserved for status badges, tags, and avatars.
- **Interaction Feedback**:
  - Buttons and interactive items translate 1px down and right on hover (`hover:translate-x-[1px] hover:translate-y-[1px]`) and 2px on active click (`active:translate-x-[2px] active:translate-y-[2px]`), giving tactile physical button feedback.

---

## 3. Backend Contract & BFF (Backend-for-Frontend) Architecture

- **Backend Base URL**: `/api/v1` (Default local: `http://localhost:8000/api/v1`).
- **Security Boundary**:
  - Tokens (`access_token` and `refresh_token`) never enter browser client JavaScript.
  - Server actions and route handlers store JWTs in `HttpOnly`, `Secure`, `SameSite=Lax` cookies with `Path=/`.
  - Next.js acts as a secure BFF proxy under `/api/bff/*` for client-side mutations (likes, bookmarks, comments, notes).
  - Cross-Site Request Forgery (CSRF) is prevented using custom headers (`X-Requested-With`) and SameSite cookies.
  - Automatic single-flight token refresh happens on the Next.js server when access token expires.
- **Public & SEO**:
  - Public routes (`/`, `/sessions`, `/sessions/[slug]`) leverage Next.js ISR with cache tags (`sessions`, `session-[slug]`, `landing`).
  - `/api/revalidate` endpoint secured via `NEXTJS_REVALIDATE_SECRET` allows Django to flush cache on publish/update.
  - Full Open Graph, Twitter cards, and Schema.org Article JSON-LD embedded on every public session.

- **Deployment & Standalone Output**:
  - `next.config.mjs` sets `output: "standalone"` conditionally (`process.env.BUILD_STANDALONE === "true" || process.platform !== "win32"`). On Windows local machines without Developer Mode/elevated permissions, Windows blocks symlink creation with EPERM. In Linux/Docker and production CI, standalone output builds automatically.

---

## 4. Implementation Stages

- **Stage 0: Foundation & Setup**
  - Package manifest, tsconfig, Tailwind theme configuration, shadcn/ui primitives, and OpenAPI type generation.
- **Stage 1: Core Architecture & BFF Layer**
  - Typed client, HttpOnly cookie auth session management, server `getCurrentUser()`, CSRF validation, and middleware route guard.
- **Stage 2: Public & SEO Pages**
  - Guest Landing page, Sessions Archive, Public Session Detail with SEO/JSON-LD, `/api/revalidate`, sitemap, robots, 404 & 403 pages.
- **Stage 3: Authentication & Verification Flows**
  - Login (with error states), Sign Up, Verify Email, Password Reset, Verification Status Banner & Submission Flow.
- **Stage 4: Member Portal & Interactions**
  - Member Feed (Desktop & Mobile), Session Detail with Interactive Comments, Likes, Bookmarks, Private Session Notes, Saved Sessions, My Notes.
- **Stage 5: Staff & Admin Management**
  - Overview Dashboard, Sessions Manager, Markdown Session Editor, Verification Review Desk, User Role Management, Moderation, Analytics.
- **Stage 6: Verification, Performance & Build Audit**
  - Unit tests, linting, typecheck, Lighthouse & responsive verification, Dockerfile standalone build.
