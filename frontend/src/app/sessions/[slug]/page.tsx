import React from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { MarkdownRenderer } from "@/components/sessions/MarkdownRenderer";
import { SessionInteractions } from "@/components/sessions/SessionInteractions";
import { SessionComments } from "@/components/sessions/SessionComments";
import { SessionNotes } from "@/components/sessions/SessionNotes";
import { env } from "@/lib/env";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import { Home, ChevronRight, Check, Clock, Calendar, Lock } from "lucide-react";

interface Props {
  params: { slug: string };
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${env.DJANGO_INTERNAL_API_URL}/public/sessions/${params.slug}/meta/`,
      { next: { revalidate: 3600 } }
    );

    if (res.ok) {
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
  } catch {
    // Fallback if backend offline
  }

  return {
    title: "সেশন বিস্তারিত | নিজের বলার মতো একটা গল্প",
    description: "উদ্যোক্তা উন্নয়ন ও মূল্যবোধের ধারাবাহিক শিক্ষণ সেশন।",
  };
}

// 2. Server Component Page
export default async function SessionDetailPage({ params }: Props) {
  let sessionData: any = null;
  let metaData: any = null;

  try {
    const res = await fetch(
      `${env.DJANGO_INTERNAL_API_URL}/public/sessions/${params.slug}/`,
      { next: { revalidate: 300, tags: [`session-${params.slug}`, "sessions"] } }
    );

    // Handle 301 permanent redirect if slug changed in DRF
    if (res.status === 301) {
      const data = await res.json();
      redirect(`/sessions/${data.redirect_to}`);
    }

    if (res.status === 404) {
      notFound();
    }

    if (res.ok) {
      sessionData = await res.json();
    }

    // Fetch JSON-LD Schema
    const metaRes = await fetch(
      `${env.DJANGO_INTERNAL_API_URL}/public/sessions/${params.slug}/meta/`,
      { next: { revalidate: 3600 } }
    );
    if (metaRes.ok) {
      metaData = await metaRes.json();
    }
  } catch {
    // If backend is not currently running, provide fallback mock for Stitch preview
  }

  // Fallback session data if backend is offline during local test
  const session = sessionData || {
    id: "sample-1",
    slug: params.slug,
    title: "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জনের মূলনীতি",
    session_number: 12,
    batch: { number: 24 },
    date: "2024-05-15",
    reading_time_minutes: 8,
    author_name: "ইকবাল বাহার জাহিদ",
    author_role: "প্রতিষ্ঠাতা ও প্রধান মেন্টর",
    likes_count: 128,
    is_liked: false,
    is_bookmarked: false,
    login_required: false,
    content: `## ১. বিশ্বাসের ভিত্তি তৈরি: ব্যবসায় দীর্ঘমেয়াদী সফলতার প্রথম ধাপ

ব্যবসায়ের মূল ভিত্তি কেবল তাৎক্ষণিক মুনাফা অর্জন নয়, বরং গ্রাহক ও সমাজের আস্থা অর্জন। যখন একজন উদ্যোক্তা প্রতিটি পদক্ষেপে সততার পরিচয় দেন এবং নিজের পণ্য বা সেবার মান সম্পর্কে স্বচ্ছ থাকেন, তখন গ্রাহক কেবল ক্রেতা থাকেন না, তিনি প্রতিষ্ঠানের আজীবন সমর্থক ও ব্র্যান্ড অ্যাম্বাসেডরে পরিণত হন।

> “একটি খাঁটি উদ্যোক্তা কখনো মুনাফাকে মূল্যবোধের ওপরে স্থান দেন না। সাময়িক লাভের চেয়ে আত্মমর্যাদা ও গ্রাহকের গভীর বিশ্বাসই আপনার দীর্ঘমেয়াদী শ্রেষ্ঠ সম্পদ।” — ইকবাল বাহার জাহিদ

## ২. গ্রাহক প্রতিশ্রুতি ও সময়ানুবর্তিতা রক্ষার মূল কৌশলসমূহ

1. **স্পষ্ট যোগাযোগ রক্ষা করা**: ডেলিভারি বা সেবায় কোনো বিলম্ব ঘটলে গ্রাহককে আগেই অবহিত করুন এবং বিকল্প সমাধান প্রস্তুত রাখুন।
2. **প্রতিশ্রুতির চেয়ে অতিরিক্ত প্রদান (Under-promise & Over-deliver)**: যা বাস্তবায়ন করতে পারবেন ঠিক সেটুকুই বলুন, কথার চেয়ে কাজের মান বেশি রাখুন।
3. **ভুল স্বীকার ও তাৎক্ষণিক সমাধান**: অসাবধানতাবশত ত্রুটি হলে দ্বিধাহীনভাবে আন্তরিকতার সাথে দ্রুত দায়িত্ব নিন ও ক্ষতিপূরণ নিশ্চিত করুন।
4. **নৈতিক মূল্যবোধ বজায় রাখা**: ব্যবসায়িক সংকটকালীন যেকোনো মুহূর্তেও পণ্যের গুণগত মানের সাথে আপস না করা।

প্রতিটি ব্যাচের শিক্ষার্থীদের মনে রাখতে হবে, সততা হলো একটি নিয়মিত চর্চা। প্রতিদিনের ছোট ছোট সিদ্ধান্তই আপনার ব্যক্তিগত ও প্রাতিষ্ঠানিক ভাবমূর্তি গড়ে তোলে।`,
    tags: [
      { id: "1", name: "উদ্যোক্তা", slug: "entrepreneurship" },
      { id: "2", name: "নৈতিকতা", slug: "ethics" },
      { id: "3", name: "গ্রাহকসেবা", slug: "customer-service" },
    ],
    comments: [
      {
        id: "c1",
        author_name: "ফারহানা ইয়াসমিন",
        author_batch: 24,
        content: "অসাধারণ দিকনির্দেশনা স্যার! আমাদের বুটিক উদ্যোগে ডেলিভারি টাইমিং ঠিক রাখতে এই ফর্মুলা মেনে চলছি। শুরুতে কিছুটা চ্যালেঞ্জ হলেও এখন কাস্টমাররা আগের চেয়ে অনেক বেশি খুশি।",
        created_at: "2024-05-15T14:30:00Z",
      },
      {
        id: "c2",
        author_name: "রাকিবুল হাসান",
        author_batch: 23,
        content: "ভুল স্বীকার করে দ্রুত সমাধান দেওয়ার বিষয়টি সত্যিই গ্রাহকের আস্থা কয়েকগুণ বাড়িয়ে দেয়। আমরা গত সপ্তাহে কুরিয়ার বিভ্রাটে নিজের খরচে নতুন পণ্য পাঠিয়েছিলাম, ক্লায়েন্ট ভীষণ মুগ্ধ হয়েছেন।",
        created_at: "2024-05-15T12:00:00Z",
      },
    ],
  };

  return (
    <>
      <PublicNavbar />
      {/* Schema.org Article Structured Data */}
      {metaData?.schema_org && (
        <Script
          id="schema-article"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(metaData.schema_org) }}
        />
      )}

      <main className="w-full pt-16 bg-background flex-grow font-bangla min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>হোম</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <Link href="/sessions" className="hover:text-foreground transition-colors">
              সেশনসমূহ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">
              ব্যাচ {banglaNumber(session.batch?.number || 24)} • সেশন {banglaNumber(session.session_number)}
            </span>
          </nav>

          {/* Members-only Post Locked State for Anonymous Visitor */}
          {session.login_required ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 sm:p-10 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto mb-4 text-amber-900">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{session.title}</h1>
              <p className="text-gray-700 max-w-lg mx-auto mb-6 leading-relaxed">
                এই সেশনটি শুধুমাত্র নিবন্ধিত ও ভেরিফাইড সদস্যদের জন্য উন্মুক্ত। বিস্তারিত পড়ার জন্য অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href={`/login?next=/sessions/${session.slug}`}
                  className="px-6 py-2.5 bg-foreground text-background font-bold text-sm rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  লগইন করুন
                </Link>
                <Link
                  href={`/register?next=/sessions/${session.slug}`}
                  className="px-6 py-2.5 bg-background border border-border text-foreground font-semibold text-sm rounded-lg hover:bg-secondary transition-colors"
                >
                  নতুন অ্যাকাউন্ট খুলুন
                </Link>
              </div>
            </div>
          ) : (
            <article className="flex flex-col">
              {/* Badges / Chips */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold border border-border">
                  ব্যাচ {banglaNumber(session.batch?.number || 24)}
                </span>
                <span className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold">
                  সেশন {banglaNumber(session.session_number)}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateBn(session.date)}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  {banglaNumber(session.reading_time_minutes || 8)} মিনিট পাঠ
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-6">
                {session.title}
              </h1>

              {/* Author & Verification Row */}
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-border">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-base shrink-0">
                    ইব
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-foreground">
                        {session.author_name || "ইকবাল বাহার জাহিদ"}
                      </span>
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {session.author_role || "প্রতিষ্ঠাতা ও প্রধান মেন্টর"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Image if present */}
              {session.cover_image_url && (
                <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-border shadow-sm">
                  <Image
                    src={session.cover_image_url}
                    alt={session.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Sanitized Long-form Editorial Markdown Content */}
              <div className="mb-8">
                <MarkdownRenderer content={session.content} />
              </div>

              {/* Tags */}
              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground font-medium">ট্যাগ:</span>
                  {session.tags.map((tag: any) => (
                    <span
                      key={tag.id || tag.slug}
                      className="px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-medium border border-border"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Interactive Like, Bookmark, Copy Link */}
              <SessionInteractions
                slug={session.slug}
                initialLikesCount={session.likes_count}
                initialIsLiked={session.is_liked}
                initialIsBookmarked={session.is_bookmarked}
              />

              {/* Private Notes Editor for Logged-in User */}
              <SessionNotes slug={session.slug} />

              {/* Discussion & Constructive Comments */}
              <SessionComments
                slug={session.slug}
                initialComments={session.comments || []}
              />
            </article>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
