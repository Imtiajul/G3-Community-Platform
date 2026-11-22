import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import { ArrowRight, BookOpen, ShieldCheck, Users, ChevronRight, Lock, Bookmark } from "lucide-react";

interface RecentSession {
  id: string;
  slug: string;
  title: string;
  session_number: number;
  batch_number: number;
  date: string;
  excerpt: string;
  author_name: string;
}

// ISR with cache tags for instant loading and revalidation
export const revalidate = 300;

async function getRecentSessions(): Promise<RecentSession[]> {
  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/public/sessions/?limit=3`, {
      next: { revalidate: 300, tags: ["sessions", "landing"] },
    });
    if (res.ok) {
      const data = await res.json();
      const results = data.results || data;
      return results.slice(0, 3).map((item: any) => ({
        id: item.id || item.slug,
        slug: item.slug,
        title: item.title,
        session_number: item.session_number || 1,
        batch_number: item.batch?.number || item.batch_number || 24,
        date: item.date || item.created_at,
        excerpt: item.excerpt || item.content?.slice(0, 150) || "উদ্যোগের প্রাথমিক ধাপ ও মানসিক প্রস্তুতি...",
        author_name: item.author_name || "ইকবাল বাহার জাহিদ",
      }));
    }
  } catch {
    // Fallback to static Stitch data if backend is offline during build
  }

  return [
    {
      id: "1",
      slug: "session-42",
      title: "উদ্যোগের প্রাথমিক ধাপ ও মানসিক প্রস্তুতি",
      session_number: 42,
      batch_number: 24,
      date: "2024-05-12",
      excerpt: "নতুন কোনো কাজ শুরু করার পূর্বে মানসিক দৃঢ়তা কীভাবে গড়ে তুলতে হয় এবং শুরুর ব্যর্থতাকে ইতিবাচকভাবে দেখার উপায়সমূহ...",
      author_name: "ইকবাল বাহার জাহিদ",
    },
    {
      id: "2",
      slug: "session-41",
      title: "পণ্য নির্বাচন ও গ্রাহক সেবা নিশ্চিতকরণ",
      session_number: 41,
      batch_number: 24,
      date: "2024-05-11",
      excerpt: "বাজার চাহিদা বিশ্লেষণ এবং সাধারণ গ্রাহকের আস্থার প্রতি সম্মান রেখে কীভাবে একটি টেকসই সেবা কাঠামো তৈরি করা যায়...",
      author_name: "ইকবাল বাহার জাহিদ",
    },
    {
      id: "3",
      slug: "session-90",
      title: "ব্যবসায় সততা ও দীর্ঘমেয়াদী সুনাম তৈরি",
      session_number: 90,
      batch_number: 23,
      date: "2024-05-10",
      excerpt: "ক্ষুদ্র লাভকে প্রাধান্য না দিয়ে কীভাবে দীর্ঘমেয়াদে চারিত্রিক সততার মাধ্যমে বাজারে অতুলনীয় ব্র্যান্ড পরিচিতি গড়ে তোলা সম্ভব...",
      author_name: "ইকবাল বাহার জাহিদ",
    },
  ];
}

export default async function LandingPage() {
  const recentSessions = await getRecentSessions();

  return (
    <>
      <PublicNavbar />
      <main className="w-full pt-16 bg-background min-h-screen flex flex-col font-bangla">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* Hero Section */}
          <section className="w-full py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Vision & Identity */}
              <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary border border-border text-foreground text-xs font-semibold mb-6 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-foreground">
                    auto_stories
                  </span>
                  <span>বিনামূল্যে যুক্ত হোন • উদ্যোক্তা ও মূল্যবোধের শিক্ষা</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[52px] text-foreground font-extrabold tracking-tight mb-5 leading-tight">
                  নিজের বলার মতো একটা গল্প
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                  প্রতিদিনের সেশন, শেখা আর একসাথে এগিয়ে চলার একটি কমিউনিটি। কোনো ফি নেই, কেবল নিয়মিত আত্মউন্নয়ন ও সহমর্মিতার পথচলা।
                </p>

                {/* Stats / Trust Micro-Ribbon */}
                <div className="w-full grid grid-cols-3 gap-3 sm:gap-4 pt-4 border border-border bg-card p-5 rounded-xl shadow-sm">
                  <div>
                    <div className="text-2xl font-bold text-foreground">৯০ দিন</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">ধারাবাহিক কর্মশালা</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">২৪+</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">সম্পন্ন সফল ব্যাচ</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">১০০%</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">সম্পূর্ণ অবাণিজ্যিক</div>
                  </div>
                </div>

                {/* Avatars row */}
                <div className="mt-8 flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold text-foreground shadow-sm">ম</div>
                    <div className="inline-block h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-bold text-foreground shadow-sm">র</div>
                    <div className="inline-block h-8 w-8 rounded-full bg-neutral-200 border-2 border-background flex items-center justify-center text-xs font-bold text-foreground shadow-sm">স</div>
                  </div>
                  <span className="text-foreground font-medium text-xs sm:text-sm">
                    সারাদেশের ৬৪ জেলা ও প্রবাসীদের একাত্ম প্ল্যাটফর্ম
                  </span>
                </div>
              </div>

              {/* Right Column: Membership Gateway Card */}
              <div className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0">
                <div className="bg-card border border-border rounded-xl p-7 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">কমিউনিটিতে প্রবেশ করুন</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">আপনার নিয়মিত সেশন ও নোট দেখুন</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground shadow-sm">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>

                  <form action="/login" method="GET" className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="email-preview">
                        ইমেইল ঠিকানা
                      </label>
                      <input
                        id="email-preview"
                        type="email"
                        placeholder="name@example.com"
                        className="w-full h-11 px-3.5 bg-background text-foreground border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-foreground" htmlFor="password-preview">
                          পাসওয়ার্ড
                        </label>
                        <Link href="/password-reset" className="text-xs text-foreground font-medium hover:underline">
                          পাসওয়ার্ড ভুলে গেছেন?
                        </Link>
                      </div>
                      <input
                        id="password-preview"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 bg-background text-foreground border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full h-11 font-bold shadow-sm flex items-center justify-center gap-2">
                      <span>লগইন</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>

                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-[1px] bg-border" />
                    </div>
                    <span className="relative px-3 bg-card text-xs text-muted-foreground">অথবা</span>
                  </div>

                  <Button asChild variant="outline" className="w-full h-11 font-medium shadow-sm">
                    <Link href="/register">
                      বিনামূল্যে একটি নতুন অ্যাকাউন্ট তৈরি করুন
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-6">
                    ইতিমধ্যে সদস্য? <Link href="/login" className="text-foreground font-bold hover:underline">সাইন ইন করুন</Link>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Break / Atmosphere Banner */}
          <section className="w-full my-8">
            <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
              <div
                className="bg-cover bg-center w-full h-56 sm:h-72 grayscale opacity-90 contrast-125"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNh6O7e8OIh093ERlpQbgw569MJMKo7r2IOAGwtD4l1uBJLbbh4fmr3wiC4yzHJLSgnfNIuMegkurQUgbbRboYets-gZZ1jzhwZxqAhXVnFrFkoIt6QyPtY7ODzD6m35ESjeL93ll0z3kdTub9StMmdyO2DbvokFmEKoqC3YqW8Eaw5Rm1a0eFmbEIjsaOKd3ni2m3RM5Wo0qan8KPKbRy4IhCHxWWAbFp8DnUsTAf')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end p-6 sm:p-10">
                <div className="max-w-2xl text-foreground">
                  <span className="text-xs bg-foreground text-background font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    আমাদের দর্শন
                  </span>
                  <p className="text-xl sm:text-2xl mt-3 font-bold text-foreground leading-relaxed">
                    &ldquo;ভালো মানুষ হওয়া ও অন্যকে ভালো মানুষ হতে সহায়তা করাই সবচেয়ে বড় উদ্যোগ।&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* About Section ('আমাদের কথা') */}
          <section className="w-full py-14 sm:py-20">
            <div className="max-w-3xl mx-auto text-center px-4">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-[1px] bg-foreground" />
                <span className="text-xs uppercase tracking-widest text-foreground font-bold">
                  আমাদের কথা
                </span>
                <span className="w-8 h-[1px] bg-foreground" />
              </div>

              <h2 className="text-2xl sm:text-4xl text-foreground font-extrabold mb-6 tracking-tight">
                একটি ইতিবাচক পরিবর্তনের স্বপ্ন
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                ২০১৮ সালে এই বিশ্বাসের সাথে আমাদের যাত্রা শুরু হয়েছিল—প্রতিটি মানুষের এমন একটি গল্প থাকা উচিত যা নিয়ে তার বাবা-মা গর্ব করতে পারেন, সন্তানরা অনুপ্রাণিত হতে পারে এবং সমাজ ইতিবাচক পরিবর্তন দেখতে পায়। এই প্ল্যাটফর্ম হলো প্রতিদিনের নিয়মানুবর্তিতা, নৈতিক মূল্যবোধ ও উদ্যোগের পাঠ নিয়ে একসাথে বড় হওয়ার উন্মুক্ত প্রাঙ্গণ।
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-foreground">
                <div className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg bg-secondary border border-border">
                  <ShieldCheck className="w-4 h-4 text-foreground" />
                  <span className="font-medium">সম্পূর্ণ অবাণিজ্যিক কর্মশালা</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg bg-secondary border border-border">
                  <Users className="w-4 h-4 text-foreground" />
                  <span className="font-medium">সততা ও মূল্যবোধের ঐক্য</span>
                </div>
              </div>
            </div>
          </section>

          {/* Three-step Process Row ('কীভাবে কাজ করে') */}
          <section className="w-full py-10">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs text-foreground uppercase font-bold tracking-widest">
                পথচলার পদ্ধতি
              </span>
              <h3 className="text-2xl sm:text-4xl text-foreground font-extrabold mt-2">
                কীভাবে শুরু করবেন
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                খুব সাধারণ তিনটি ধাপে অংশ নিন প্রতিদিনের সেশনে
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="bg-card border border-border hover:border-foreground p-7 rounded-xl shadow-sm flex flex-col items-start transition-all">
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center mb-5 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">person_add</span>
                </div>
                <span className="text-xs text-foreground uppercase font-bold tracking-wider mb-1">ধাপ ০১</span>
                <h4 className="text-lg font-bold text-foreground mb-2">যুক্ত হোন</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ইমেইল বা গুগল দিয়ে সহজে অ্যাকাউন্ট তৈরি করুন। কোনো গোপন ফি বা শর্ত ছাড়া সম্পূর্ণ উন্মুক্ত রেজিস্ট্রেশন।
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-card border border-border hover:border-foreground p-7 rounded-xl shadow-sm flex flex-col items-start transition-all">
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center mb-5 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">menu_book</span>
                </div>
                <span className="text-xs text-foreground uppercase font-bold tracking-wider mb-1">ধাপ ০২</span>
                <h4 className="text-lg font-bold text-foreground mb-2">শিখুন</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  আপনার ব্যাচের প্রতিদিনের সেশন পড়ুন, গঠনমূলক আলোচনা করুন এবং সহপাঠীদের সাথে অভিজ্ঞতা বিনিময় করুন।
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-card border border-border hover:border-foreground p-7 rounded-xl shadow-sm flex flex-col items-start transition-all">
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center mb-5 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">bookmark_heart</span>
                </div>
                <span className="text-xs text-foreground uppercase font-bold tracking-wider mb-1">ধাপ ০৩</span>
                <h4 className="text-lg font-bold text-foreground mb-2">সংরক্ষণ করুন</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  পছন্দের সেশন বুকমার্ক করুন এবং নিজস্ব ব্যক্তিগত নোট লিখে রাখুন যাতে ভবিষ্যতে সহজেই পর্যালোচনা করতে পারেন।
                </p>
              </div>
            </div>
          </section>

          {/* Recent Sessions ('সাম্প্রতিক সেশন') */}
          <section className="w-full py-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs text-foreground uppercase font-bold tracking-widest">
                  নিয়মিত পাঠ
                </span>
                <h3 className="text-2xl sm:text-3xl text-foreground font-extrabold mt-1">
                  সাম্প্রতিক সেশন
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  নির্বাচিত সাম্প্রতিক পাঠ ও অভিজ্ঞতা
                </p>
              </div>
              <Link
                href="/sessions"
                className="inline-flex items-center gap-1 text-sm font-bold text-foreground hover:underline"
              >
                <span>সকল সেশন দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentSessions.map((session) => (
                <article
                  key={session.id}
                  className="bg-card border border-border hover:border-foreground rounded-xl p-6 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-xs font-medium border border-border">
                          ব্যাচ {banglaNumber(session.batch_number)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-foreground text-background text-xs font-bold">
                          সেশন {banglaNumber(session.session_number)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatDateBn(session.date)}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:underline">
                      <Link href={`/sessions/${session.slug}`}>{session.title}</Link>
                    </h4>

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                      {session.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
                        ই
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {session.author_name}
                      </span>
                    </div>
                    <Link
                      href={`/sessions/${session.slug}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      পড়ুন <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Editorial Invitation Callout */}
          <section className="w-full my-10">
            <div className="bg-secondary border border-border p-8 sm:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="max-w-xl text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl text-foreground font-bold mb-2">
                  আপনি কি পরবর্তী ব্যাচে যুক্ত হতে প্রস্তুত?
                </h3>
                <p className="text-sm text-muted-foreground">
                  প্রতিটি নতুন ব্যাচে সারাদেশ থেকে হাজারো তরুণ-তরুণী ও উদ্যোক্তা যুক্ত হয়ে গড়ে তুলছেন তাদের সততা ও আত্মনির্ভরশীলতার গল্প।
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Button asChild size="lg" className="font-bold shadow-sm">
                  <Link href="/register">বিনামূল্যে নিবন্ধন করুন</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
