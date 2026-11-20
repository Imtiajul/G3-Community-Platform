# Next.js (App Router) Frontend Integration Guide

This guide details how to integrate the **নিজের বলার মতো একটা গল্প** Django REST Framework API with a **Next.js (App Router)** application.

---

## 1. Architecture Overview

- **Public Content (SEO First)**:
  - Landing page, session directory, and session detail pages are rendered on the server with **Incremental Static Regeneration (ISR)** (`revalidate = 300` or on-demand).
  - Search engines, crawlers, and link-preview bots receive pre-rendered HTML without needing authentication.
- **On-Demand ISR Revalidation**:
  - The Django backend triggers a webhook (`POST /api/revalidate`) whenever a session is published, updated, or re-scheduled.
- **Private Interactions**:
  - Likes, comments, bookmarks, and private notes are rendered as client components utilizing Server Actions or client fetch with the JWT token.
- **Authentication**:
  - Tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies. Next.js middleware seamlessly attaches the access token to downstream API calls and handles automatic token rotation.

---

## 2. Environment Variables (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=https://api.nijerbolarmotogolpo.com/api/v1
NEXTJS_REVALIDATE_SECRET=your-shared-revalidation-secret-key-12345
```

---

## 3. On-Demand ISR Revalidation Route

Create `app/api/revalidate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.NEXTJS_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, path, tag } = body;

    if (slug) {
      revalidatePath(`/sessions/${slug}`);
    }
    if (path) {
      revalidatePath(path);
    }
    if (tag) {
      revalidateTag(tag);
    }

    // Always revalidate sessions list and sitemap
    revalidatePath("/sessions");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating", error: String(err) }, { status: 500 });
  }
}
```

---

## 4. Public Session Page with Dynamic SEO & JSON-LD

Create `app/sessions/[slug]/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import { SessionInteractions } from "@/components/SessionInteractions";
import { SessionNotes } from "@/components/SessionNotes";

interface Props {
  params: { slug: string };
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/sessions/${params.slug}/meta/`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    return { title: "সেশন পাওয়া যায়নি | নিজের বলার মতো একটা গল্প" };
  }

  const meta = await res.json();

  return {
    title: `${meta.title} | নিজের বলার মতো একটা গল্প`,
    description: meta.description,
    alternates: {
      canonical: meta.canonical_url,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical_url,
      images: meta.og_image_url ? [{ url: meta.og_image_url }] : [],
      type: "article",
      locale: "bn_BD",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: meta.og_image_url ? [meta.og_image_url] : [],
    },
  };
}

// 2. Server Component Page
export default async function SessionDetailPage({ params }: Props) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/sessions/${params.slug}/`,
    { next: { revalidate: 300, tags: [`session-${params.slug}`] } }
  );

  // Handle 301 permanent redirect if slug changed
  if (res.status === 301) {
    const data = await res.json();
    redirect(`/sessions/${data.redirect_to}`);
  }

  if (res.status === 404) {
    notFound();
  }

  const session = await res.json();

  // Fetch JSON-LD Schema
  const metaRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/sessions/${params.slug}/meta/`,
    { next: { revalidate: 3600 } }
  );
  const metaData = metaRes.ok ? await metaRes.json() : null;

  // Members-only post handling for anonymous visitor
  if (session.login_required) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
          <p className="text-gray-600 mb-6">
            এই সেশনটি শুধুমাত্র ভেরিফাইড সদস্যদের জন্য উন্মুক্ত। বিস্তারিত পড়ার জন্য অনুগ্রহ করে লগইন করুন।
          </p>
          <a
            href={`/login?redirect=/sessions/${session.slug}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            লগইন করুন
          </a>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Schema.org Article Structured Data */}
      {metaData?.schema_org && (
        <Script
          id="schema-article"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(metaData.schema_org) }}
        />
      )}

      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
            <span className="font-semibold text-blue-600">ব্যাচ {session.batch.number}</span>
            <span>•</span>
            <span>সেশন #{session.session_number}</span>
            <span>•</span>
            <time dateTime={session.date}>{session.date}</time>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
            {session.title}
          </h1>
        </div>

        {/* Cover Image */}
        {session.cover_image_url && (
          <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <Image
              src={session.cover_image_url}
              alt={session.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Sanitized HTML Content */}
        <div
          className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-12 font-bangla"
          dangerouslySetInnerHTML={{ __html: session.content_html }}
        />

        {/* Tags */}
        {session.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {session.tags.map((tag: any) => (
              <span
                key={tag.slug}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Interactive Features (Like, Bookmark, Comments) */}
        <SessionInteractions
          slug={session.slug}
          initialLikesCount={session.likes_count}
          initialComments={session.comments}
        />

        {/* Private Personal Notes */}
        <SessionNotes slug={session.slug} />
      </article>
    </>
  );
}
```

---

## 5. Dynamic Sitemap (`app/sitemap.ts`)

```typescript
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/sitemap/`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return [];
  }

  const sessions = await res.json();
  const baseUrl = "https://nijerbolarmotogolpo.com";

  return sessions.map((item: any) => ({
    url: `${baseUrl}/sessions/${item.slug}`,
    lastModified: item.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
```

---

## 6. Authentication & Token Management Middleware

Create `middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/me");

  // Redirect unauthenticated user from protected routes
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auto-refresh access token if expired
  if (!accessToken && refreshToken) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const response = NextResponse.next();
        response.cookies.set("access_token", data.access, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 60, // 30 minutes
        });
        return response;
      }
    } catch {
      // Refresh failed, let request continue or redirect to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/me/:path*", "/login", "/register"],
};
```

---

## 7. Verification Banner Component

Display this component in your layout or member dashboard:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function VerificationBanner() {
  const [statusData, setStatusData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/me/verification/`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStatusData(data));
  }, []);

  if (!statusData || statusData.verification_status === "verified") {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 text-sm text-blue-900 flex items-center justify-between">
      <div>
        {statusData.verification_status === "unverified" && (
          <span>
            ⚠️ আপনার প্রোফাইলটি এখনো ভেরিফাইড নয়। সেশনে মন্তব্য ও লাইক করতে প্রোফাইলে ব্যাচ ও রেজিস্ট্রেশন নম্বর যুক্ত করে আবেদন করুন।
          </span>
        )}
        {statusData.verification_status === "pending" && (
          <span>
            ⏳ আপনার ভেরিফিকেশন আবেদনটি মডারেটরদের পর্যালোচনায় রয়েছে। খুব শীঘ্রই অনুমোদিত হবে।
          </span>
        )}
        {statusData.verification_status === "rejected" && (
          <span>
            ❌ আপনার ভেরিফিকেশন আবেদনটি বাতিল করা হয়েছে। কারণ: {statusData.rejection_reason}। তথ্য সংশোধন করে পুনরায় আবেদন করুন।
          </span>
        )}
      </div>
      <Link
        href="/me/profile"
        className="ml-4 font-semibold text-blue-700 hover:text-blue-900 underline whitespace-nowrap"
      >
        প্রোফাইল দেখুন
      </Link>
    </div>
  );
}
```
