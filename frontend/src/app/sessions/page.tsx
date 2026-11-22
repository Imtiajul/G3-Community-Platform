import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { env } from "@/lib/env";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import { Search, RotateCcw, ChevronLeft, ChevronRight, Home, Calendar, Clock, ThumbsUp, MessageSquare, Bookmark } from "lucide-react";

interface SessionItem {
  id: string;
  slug: string;
  title: string;
  session_number: number;
  batch_number: number;
  date: string;
  excerpt: string;
  author_name: string;
  reading_time_minutes: number;
  likes_count: number;
  comments_count: number;
  is_featured?: boolean;
}

export const revalidate = 300;

async function getSessionsData(searchParams: {
  q?: string;
  batch?: string;
  page?: string;
  tag?: string;
}) {
  const query = searchParams.q || "";
  const batch = searchParams.batch || "";
  const page = searchParams.page || "1";

  try {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (batch) params.set("batch", batch);
    params.set("page", page);

    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/public/sessions/?${params.toString()}`, {
      next: { revalidate: 300, tags: ["sessions"] },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        count: data.count || (data.results ? data.results.length : 0),
        results: (data.results || data).map((s: any) => ({
          id: String(s.id || s.slug),
          slug: s.slug,
          title: s.title,
          session_number: s.session_number || 1,
          batch_number: s.batch?.number || s.batch_number || 24,
          date: s.date || s.created_at,
          excerpt: s.excerpt || s.content?.slice(0, 160) || "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জনের মূলনীতি...",
          author_name: s.author_name || "ইকবাল বাহার জাহিদ",
          reading_time_minutes: s.reading_time_minutes || 8,
          likes_count: s.likes_count || 48,
          comments_count: s.comments_count || 12,
          is_featured: s.is_featured || false,
        })),
      };
    }
  } catch {
    // Fallback static data
  }

  return {
    count: 4,
    results: [
      {
        id: "1",
        slug: "business-integrity-trust",
        title: "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জনের মূলনীতি",
        session_number: 12,
        batch_number: 24,
        date: "2024-05-15",
        excerpt: "একটি সফল উদ্যোগ শুধু মূলধন বা বিপণন কৌশলের ওপর দাঁড়িয়ে থাকে না। ব্যবসায় দীর্ঘমেয়াদে টিকে থাকার একমাত্র ভিত্তি হলো সততা ও মানবিক মূল্যবোধ...",
        author_name: "ইকবাল বাহার জাহিদ",
        reading_time_minutes: 8,
        likes_count: 128,
        comments_count: 24,
        is_featured: true,
      },
      {
        id: "2",
        slug: "market-testing-first-hundred-clients",
        title: "বাজার যাচাই এবং প্রথম ১০০ জন বিশ্বস্ত গ্রাহক তৈরির বাস্তব কৌশল",
        session_number: 11,
        batch_number: 24,
        date: "2024-05-12",
        excerpt: "বড় বিজ্ঞাপনী বাজেট ছাড়াই সততা ও আন্তরিক সেবার মাধ্যমে প্রথম গ্রাহকদের স্থায়ী শুভানুধ্যায়ীতে রূপান্তরের কার্যকর পদ্ধতি...",
        author_name: "ইকবাল বাহার জাহিদ",
        reading_time_minutes: 7,
        likes_count: 96,
        comments_count: 18,
      },
      {
        id: "3",
        slug: "leadership-team-management",
        title: "নেতৃত্ব ও টিম ম্যানেজমেন্ট: সংকটকালে সঠিক সিদ্ধান্ত গ্রহণের সাহস",
        session_number: 50,
        batch_number: 23,
        date: "2024-05-10",
        excerpt: "কঠিন পরিস্থিতিতে প্রতিকূলতাকে সম্ভাবনা হিসেবে দেখা এবং দলের সদস্যদের মানসিক শক্তি ও আত্মবিশ্বাস অটুট রাখার কৌশল...",
        author_name: "ইকবাল বাহার জাহিদ",
        reading_time_minutes: 10,
        likes_count: 152,
        comments_count: 31,
      },
      {
        id: "4",
        slug: "cashflow-financial-discipline",
        title: "কার্যকর ক্যাশফ্লো ও আর্থিক শৃঙ্খলা রক্ষা করার উপায়",
        session_number: 13,
        batch_number: 24,
        date: "2024-05-08",
        excerpt: "লাভ ও নগদ টাকার পার্থক্য বোঝা এবং ব্যবসায় অযথা খরচ কমিয়ে একটি টেকসই আর্থিক ভিত্তি গড়ে তোলার নির্দেশিকা...",
        author_name: "ইকবাল বাহার জাহিদ",
        reading_time_minutes: 6,
        likes_count: 64,
        comments_count: 9,
      },
    ],
  };
}

export default async function SessionsArchivePage({
  searchParams,
}: {
  searchParams: { q?: string; batch?: string; page?: string; tag?: string };
}) {
  const { count, results } = await getSessionsData(searchParams);

  return (
    <>
      <PublicNavbar />
      <main className="w-full pt-16 bg-background flex-grow font-bangla min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>হোম</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">সেশন আর্কাইভ</span>
          </nav>

          {/* Title Banner */}
          <section className="bg-card border border-border rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 z-10 relative">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-foreground text-xs font-semibold mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  জ্ঞানভাণ্ডার ও পাঠক্রম
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  সেশন আর্কাইভ (Sessions Archive)
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  উদ্যোক্তা উন্নয়ন, সততা ও মূল্যবোধের ধারাবাহিক শিক্ষণ ও দিকনির্দেশনা। ৯০০ দিনের নিরবচ্ছিন্ন পথচলার প্রতিটি অধ্যায়।
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <div className="flex flex-col items-center bg-secondary border border-border px-5 py-3 rounded-lg">
                  <span className="text-2xl font-bold text-foreground">{banglaNumber(160)}+</span>
                  <span className="text-xs text-muted-foreground font-semibold">মোট সেশন</span>
                </div>
                <div className="flex flex-col items-center bg-card border border-border px-5 py-3 rounded-lg">
                  <span className="text-2xl font-bold text-foreground">{banglaNumber(24)}টি</span>
                  <span className="text-xs text-muted-foreground font-semibold">সফল ব্যাচ</span>
                </div>
              </div>
            </div>
          </section>

          {/* Filtering Console */}
          <section className="bg-card border border-border p-5 sm:p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <form method="GET" action="/sessions" className="space-y-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  name="q"
                  defaultValue={searchParams.q || ""}
                  placeholder="সেশনের বিষয়বস্তু, মেন্টরের বক্তব্য বা কি-ওয়ার্ড দিয়ে খুঁজুন..."
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">ব্যাচ নির্বাচন করুন</label>
                  <select
                    name="batch"
                    defaultValue={searchParams.batch || ""}
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="">সব ব্যাচ (All Batches)</option>
                    <option value="24">ব্যাচ ২৪</option>
                    <option value="23">ব্যাচ ২৩</option>
                    <option value="22">ব্যাচ ২২</option>
                    <option value="3">ব্যাচ ৩</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">ক্রমানুসার</label>
                  <select
                    name="ordering"
                    className="w-full bg-background border border-border text-foreground text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="-date">সর্বশেষ</option>
                    <option value="-likes">জনপ্রিয়</option>
                    <option value="date">প্রাচীনতম</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    className="h-10 px-4 bg-foreground text-background font-bold text-sm rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    অনুসন্ধান করুন
                  </button>
                </div>

                <div className="flex flex-col justify-end">
                  <Link
                    href="/sessions"
                    className="h-10 px-4 bg-secondary border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>রিসেট</span>
                  </Link>
                </div>
              </div>
            </form>
          </section>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              মোট <span className="font-bold text-primary">{banglaNumber(count)}টি</span> সেশন পাওয়া গেছে
            </p>
          </div>

          {/* Session Cards Grid */}
          {results.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((session: SessionItem) => (
                <article
                  key={session.id}
                  className="bg-card border border-border hover:border-foreground rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-xs font-semibold border border-border">
                        ব্যাচ {banglaNumber(session.batch_number)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-foreground text-background text-xs font-bold">
                        সেশন {banglaNumber(session.session_number)}
                      </span>
                      {session.is_featured && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                          ★ ফিচার্ড
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      <Link href={`/sessions/${session.slug}`} className="hover:underline">
                        {session.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {session.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-secondary border border-border text-foreground flex items-center justify-center font-bold text-xs shrink-0">
                        ই
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">{session.author_name}</span>
                        <span className="text-[11px] text-muted-foreground">প্রতিষ্ঠাতা ও প্রধান মেন্টর</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {banglaNumber(session.reading_time_minutes)} মিনিট পাঠ
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {banglaNumber(session.likes_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {banglaNumber(session.comments_count)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <div className="bg-card border border-border rounded-xl p-10 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-muted-foreground mb-3">
                search_off
              </span>
              <h3 className="text-lg font-bold text-foreground mb-1">কোনো সেশন খুঁজে পাওয়া যায়নি</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                আপনার খোঁজার শর্ত বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
              </p>
              <Link
                href="/sessions"
                className="px-4 py-2 bg-foreground text-background rounded-lg font-medium text-xs"
              >
                সকল ফিল্টার সাফ করুন
              </Link>
            </div>
          )}

          {/* Pagination */}
          <nav aria-label="Pagination" className="flex items-center justify-between py-6 border-t border-border mt-4">
            <span className="text-xs text-muted-foreground">
              পৃষ্ঠা ১ এর ১ (সর্বমোট {banglaNumber(count)}টি ফলাফল)
            </span>
            <div className="flex items-center gap-2">
              <button disabled className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground opacity-50 cursor-not-allowed flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
              </button>
              <span className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-bold">
                ১
              </span>
              <button disabled className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground opacity-50 cursor-not-allowed flex items-center gap-1">
                পরবর্তী <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
