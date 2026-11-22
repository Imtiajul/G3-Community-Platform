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

## 2. Design System Tokens (Extracted from Google Stitch MCP)

From project `12247759999368583774` ("Bangla Learning Community Design System"):
- **Theme**: Light, calm, text-first, editorial minimal reading atmosphere.
- **Surfaces**:
  - Background: `#FFFFFF` / `#FAFAF9`
  - Surface: `#FFFFFF`
  - Muted Surface / Container: `#F9FAFB`
  - High Container / Hover: `#F3F4F6`
  - Border: `#E5E7EB` / `#E7E5E4`
- **Text & Brand**:
  - Foreground / Headings: `#000000` / `#1C1917`
  - Muted Text / Captions: `#4B5563` / `#78716C`
  - Primary Accent: Deep Charcoal / Black `#000000` with subtle Deep Teal `#0F766E` brand accents as specified in Stitch palette.
  - Success: `#16A34A` (Verified, Published)
  - Warning / Pending: `#CA8A04` / `#D97706` (Under review)
  - Destructive: `#DC2626` (Rejected, Error)
- **Geometry & Spacing**:
  - Radius: `12px` (`rounded-xl`), default `8px` (`rounded-lg`).
  - Font Size: Bangla body reading `17px` with `line-height: 1.75` (28–30px).

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
