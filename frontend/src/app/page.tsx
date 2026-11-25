import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  ChevronRight,
  Bookmark,
  Calendar,
} from "lucide-react";

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

interface Announcement {
  id: string;
  title: string;
  content: string;
  link?: string | null;
  is_focused: boolean;
}

export const revalidate = 300;

async function getLandingData(): Promise<{
  focusedAnnouncement?: Announcement | null;
  recentSessions: RecentSession[];
}> {
  try {
    const landingRes = await fetch(`${env.DJANGO_INTERNAL_API_URL}/public/landing/`, {
      next: { revalidate: 300, tags: ["landing"] },
    });

    let focusedAnnouncement: Announcement | null = null;
    if (landingRes.ok) {
      const data = await landingRes.json();
      if (data.focused_announcements && data.focused_announcements.length > 0) {
        focusedAnnouncement = data.focused_announcements[0];
      }
    }

    const sessionsRes = await fetch(`${env.DJANGO_INTERNAL_API_URL}/public/sessions/?limit=3`, {
      next: { revalidate: 300, tags: ["sessions", "landing"] },
    });

    if (sessionsRes.ok) {
      const sessionsData = await sessionsRes.json();
      const results = sessionsData.results || sessionsData;
      const recentSessions = results.slice(0, 3).map((item: any) => ({
        id: item.id || item.slug,
        slug: item.slug,
        title: item.title,
        session_number: item.session_number || 1,
        batch_number: item.batch_number || item.batch?.number || 1,
        date: item.date || item.created_at || "2026-11-19",
        excerpt:
          item.excerpt ||
          (item.content ? item.content.slice(0, 140) + "..." : "উদ্যোগের প্রাথমিক ধাপ ও মানসিক প্রস্তুতি..."),
        author_name: item.author_name || "ইকবাল বাহার জাহিদ",
      }));

      return { focusedAnnouncement, recentSessions };
    }
  } catch {
    // Fallback to static data
  }

  return {
    focusedAnnouncement: {
      id: "focused-1",
      title: "ব্যাচ ১৬ এর ওরিয়েন্টেশন ক্লাস আগামী শুক্রবার!",
      content: "সকল নিবন্ধিত শিক্ষার্থীদের যথাসময়ে অনলাইন প্ল্যাটফর্মে যুক্ত হতে আহ্বান জানানো হচ্ছে।",
      link: "https://nijerbolarmotogolpo.com/live",
      is_focused: true,
    },
    recentSessions: [
      {
        id: "1",
        slug: "session-42",
        title: "উদ্যোগের প্রাথমিক ধাপ ও মানসিক প্রস্তুতি",
        session_number: 42,
        batch_number: 24,
        date: "2024-05-12",
        excerpt:
          "নতুন কোনো কাজ শুরু করার পূর্বে মানসিক দৃঢ়তা কীভাবে গড়ে তুলতে হয় এবং শুরুর ব্যর্থতাকে ইতিবাচকভাবে দেখার উপায়সমূহ...",
        author_name: "ইকবাল বাহার জাহিদ",
      },
      {
        id: "2",
        slug: "session-41",
        title: "পণ্য নির্বাচন ও গ্রাহক সেবা নিশ্চিতকরণ",
        session_number: 41,
        batch_number: 24,
        date: "2024-05-11",
        excerpt:
          "বাজার চাহিদা বিশ্লেষণ এবং সাধারণ গ্রাহকের আস্থার প্রতি সম্মান রেখে কীভাবে একটি টেকসই সেবা কাঠামো তৈরি করা যায়...",
        author_name: "ইকবাল বাহার জাহিদ",
      },
      {
        id: "3",
        slug: "session-90",
        title: "ব্যবসায় সততা ও দীর্ঘমেয়াদী সুনাম তৈরি",
        session_number: 90,
        batch_number: 23,
        date: "2024-05-10",
        excerpt:
          "ক্ষুদ্র লাভকে প্রাধান্য না দিয়ে কীভাবে দীর্ঘমেয়াদে চারিত্রিক সততার মাধ্যমে বাজারে অতুলনীয় ব্র্যান্ড পরিচিতি গড়ে তোলা সম্ভব...",
        author_name: "ইকবাল বাহার জাহিদ",
      },
    ],
  };
}

export default async function LandingPage() {
  const { focusedAnnouncement, recentSessions } = await getLandingData();

  return (
    <>
      <PublicNavbar />
      <main className="w-full pt-16 bg-[#eff9f2] min-h-screen flex flex-col font-bangla">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
          {/* Focused Announcement Banner if active */}
          {focusedAnnouncement && (
            <div className="w-full bg-white border border-[#e5e7eb] border-l-8 border-l-[#63DB9A] p-4 rounded-xl mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[22px] text-black bg-mint p-1 rounded border border-[#e5e7eb] shrink-0">
                  campaign
                </span>
                <div>
                  <span className="text-sm font-bold text-black">{focusedAnnouncement.title}</span>
                  {focusedAnnouncement.content && (
                    <span className="hidden sm:inline text-xs text-neutral-700 font-medium ml-2">
                      — {focusedAnnouncement.content}
                    </span>
                  )}
                </div>
              </div>
              {focusedAnnouncement.link && (
                <a
                  href={focusedAnnouncement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start sm:self-auto shrink-0 text-xs font-bold text-black bg-lime/20 border border-lime px-3.5 py-1.5 rounded-lg hover:bg-lime/30 transition-all inline-flex items-center gap-1"
                >
                  <span>বিস্তারিত</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Hero Section */}
          <section className="w-full py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Vision & Identity */}
              <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E2E361]/20 border border-[#E2E361] text-black text-xs font-bold mb-6">
                  <span className="material-symbols-outlined text-[15px] text-black">
                    auto_stories
                  </span>
                  <span>বিনামূল্যে যুক্ত হোন • উদ্যোক্তা ও মূল্যবোধের শিক্ষা</span>
                </div>

                <h1 className="font-headline text-3xl sm:text-5xl lg:text-[52px] text-black font-extrabold tracking-tight mb-5 leading-tight">
                  নিজের বলার মতো একটা গল্প
                </h1>

                <p className="text-base sm:text-lg text-black max-w-xl mb-8 leading-relaxed font-medium">
                  প্রতিদিনের সেশন, শেখা আর একসাথে এগিয়ে চলার একটি কমিউনিটি। কোনো ফি নেই, কেবল নিয়মিত আত্মউন্নয়ন ও সহমর্মিতার পথচলা।
                </p>

                {/* Stats / Trust Micro-Ribbon */}
                <div className="w-full grid grid-cols-3 gap-4 pt-6 border border-[#e5e7eb] bg-white p-5 rounded-xl">
                  <div>
                    <div className="font-headline text-2xl font-bold text-black">৯০ দিন</div>
                    <div className="text-xs text-black mt-1 font-semibold uppercase tracking-wider">ধারাবাহিক কর্মশালা</div>
                  </div>
                  <div>
                    <div className="font-headline text-2xl font-bold text-black">২৪+</div>
                    <div className="text-xs text-black mt-1 font-semibold uppercase tracking-wider">সম্পন্ন সফল ব্যাচ</div>
                  </div>
                  <div>
                    <div className="font-headline text-2xl font-bold text-black">১০০%</div>
                    <div className="text-xs text-black mt-1 font-semibold uppercase tracking-wider">সম্পূর্ণ অবাণিজ্যিক</div>
                  </div>
                </div>

                {/* Avatars row */}
                <div className="mt-8 flex items-center gap-3 text-black text-sm">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-8 w-8 rounded-full bg-[#63DB9A] border border-[#e5e7eb] flex items-center justify-center text-xs font-bold text-black">
                      ম
                    </div>
                    <div className="inline-block h-8 w-8 rounded-full bg-[#E2E361] border border-[#e5e7eb] flex items-center justify-center text-xs font-bold text-black">
                      র
                    </div>
                    <div className="inline-block h-8 w-8 rounded-full bg-[#FF49D2] border border-[#e5e7eb] flex items-center justify-center text-xs font-bold text-black">
                      স
                    </div>
                  </div>
                  <span className="text-black font-semibold text-xs sm:text-sm">
                    সারাদেশের ৬৪ জেলা ও প্রবাসীদের একাত্ম প্ল্যাটফর্ম
                  </span>
                </div>
              </div>

              {/* Right Column: Membership Gateway Card */}
              <div className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0">
                <div className="bg-white border border-[#e5e7eb] rounded-xl p-7 lg:p-8 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold font-headline text-black">কমিউনিটিতে প্রবেশ করুন</h2>
                      <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                        আপনার নিয়মিত সেশন ও নোট দেখুন
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#E2E361]/20 border border-[#E2E361] flex items-center justify-center text-black">
                      <span className="material-symbols-outlined text-[22px]">lock_open</span>
                    </div>
                  </div>

                  <form action="/login" method="GET" className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-black mb-1.5" htmlFor="email-preview">
                        ইমেইল ঠিকানা
                      </label>
                      <input
                        id="email-preview"
                        type="email"
                        placeholder="name@example.com"
                        className="w-full h-11 px-3.5 bg-white text-black border border-[#e5e7eb] rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-black" htmlFor="password-preview">
                          পাসওয়ার্ড
                        </label>
                        <Link href="/password-reset" className="text-xs text-black font-semibold hover:underline">
                          পাসওয়ার্ড ভুলে গেছেন?
                        </Link>
                      </div>
                      <input
                        id="password-preview"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 bg-white text-black border border-[#e5e7eb] rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 mt-2 bg-mint text-black font-bold rounded-lg border border-mint hover:bg-[#72eab0] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                    >
                      <span>লগইন</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-[1px] bg-[#e5e7eb]" />
                    </div>
                    <span className="relative px-3 bg-white text-xs text-black font-bold">অথবা</span>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 bg-white hover:bg-gray-50 text-black border border-[#e5e7eb] rounded-lg font-bold transition-all flex items-center justify-center gap-3"
                  >
                    <Link href="/login">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>গুগল দিয়ে চালিয়ে যান</span>
                    </Link>
                  </Button>

                  <p className="text-xs text-neutral-600 text-center mt-6 font-medium">
                    নতুন সদস্য?{" "}
                    <Link href="/register" className="text-black font-bold hover:underline">
                      বিনামূল্যে নিবন্ধন করুন
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Break / Atmosphere Banner */}
          <section className="w-full my-8">
            <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-[#e5e7eb]">
              <div
                className="bg-cover bg-center w-full h-56 sm:h-72 grayscale opacity-90 contrast-125"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNh6O7e8OIh093ERlpQbgw569MJMKo7r2IOAGwtD4l1uBJLbbh4fmr3wiC4yzHJLSgnfNIuMegkurQUgbbRboYets-gZZ1jzhwZxqAhXVnFrFkoIt6QyPtY7ODzD6m35ESjeL93ll0z3kdTub9StMmdyO2DbvokFmEKoqC3YqW8Eaw5Rm1a0eFmbEIjsaOKd3ni2m3RM5Wo0qan8KPKbRy4IhCHxWWAbFp8DnUsTAf')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end p-6 sm:p-10">
                <div className="max-w-2xl text-black">
                  <span className="text-xs bg-[#E2E361]/20 border border-[#E2E361] text-black font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    আমাদের দর্শন
                  </span>
                  <p className="text-xl sm:text-2xl mt-3 font-bold text-black leading-relaxed">
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
                <span className="w-8 h-[1px] bg-[#e5e7eb]" />
                <span className="text-xs uppercase tracking-widest text-black font-bold px-2 py-0.5 rounded bg-[#E2E361]/20 border border-[#E2E361]">
                  আমাদের কথা
                </span>
                <span className="w-8 h-[1px] bg-[#e5e7eb]" />
              </div>

              <h2 className="text-2xl sm:text-4xl text-black font-extrabold mb-6 tracking-tight">
                একটি ইতিবাচক পরিবর্তনের স্বপ্ন
              </h2>

              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium">
                ২০১৮ সালে এই বিশ্বাসের সাথে আমাদের যাত্রা শুরু হয়েছিল—প্রতিটি মানুষের এমন একটি গল্প থাকা উচিত যা নিয়ে তার বাবা-মা গর্ব করতে পারেন, সন্তানরা অনুপ্রাণিত হতে পারে এবং সমাজ ইতিবাচক পরিবর্তন দেখতে পায়। এই প্ল্যাটফর্ম হলো প্রতিদিনের নিয়মানুবর্তিতা, নৈতিক মূল্যবোধ ও উদ্যোগের পাঠ নিয়ে একসাথে বড় হওয়ার উন্মুক্ত প্রাঙ্গণ।
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-black">
                <div className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg bg-white border border-[#e5e7eb]">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span className="font-semibold">সম্পূর্ণ অবাণিজ্যিক কর্মশালা</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg bg-white border border-[#e5e7eb]">
                  <Users className="w-4 h-4 text-black" />
                  <span className="font-semibold">সততা ও মূল্যবোধের ঐক্য</span>
                </div>
              </div>
            </div>
          </section>

          {/* Three-step Process Row ('কীভাবে কাজ করে') */}
          <section className="w-full py-10">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs text-black uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#E2E361]/20 border border-[#E2E361]">
                পথচলার পদ্ধতি
              </span>
              <h3 className="text-2xl sm:text-4xl text-black font-extrabold mt-3">
                কীভাবে শুরু করবেন
              </h3>
              <p className="text-sm text-neutral-600 mt-2 font-medium">
                খুব সাধারণ তিনটি ধাপে অংশ নিন প্রতিদিনের সেশনে
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl hover:-translate-y-0.5 flex flex-col items-start relative group transition-all">
                <div className="w-12 h-12 rounded-xl bg-mint border border-mint text-black flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px]">person_add</span>
                </div>
                <span className="text-xs uppercase font-bold tracking-wider mb-1 px-2 py-0.5 bg-[#E2E361]/20 border border-[#E2E361] rounded text-black">
                  ধাপ ০১
                </span>
                <h4 className="text-lg font-bold text-black mb-2">যুক্ত হোন</h4>
                <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                  ইমেইল বা গুগল দিয়ে সহজে অ্যাকাউন্ট তৈরি করুন। কোনো গোপন ফি বা শর্ত ছাড়া সম্পূর্ণ উন্মুক্ত রেজিস্ট্রেশন।
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl hover:-translate-y-0.5 flex flex-col items-start relative group transition-all">
                <div className="w-12 h-12 rounded-xl bg-mint border border-mint text-black flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px]">menu_book</span>
                </div>
                <span className="text-xs uppercase font-bold tracking-wider mb-1 px-2 py-0.5 bg-[#E2E361]/20 border border-[#E2E361] rounded text-black">
                  ধাপ ০২
                </span>
                <h4 className="text-lg font-bold text-black mb-2">প্রতিদিন পাঠ নিন</h4>
                <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                  প্রতিদিন প্রকাশিত সেশন মনোযোগ দিয়ে পড়ুন। বাস্তব জীবনের অভিজ্ঞতা ও নৈতিক উদ্যোগের দিকনির্দেশনা গ্রহণ করুন।
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#e5e7eb] p-8 rounded-xl hover:-translate-y-0.5 flex flex-col items-start relative group transition-all">
                <div className="w-12 h-12 rounded-xl bg-mint border border-mint text-black flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                </div>
                <span className="text-xs uppercase font-bold tracking-wider mb-1 px-2 py-0.5 bg-[#E2E361]/20 border border-[#E2E361] rounded text-black">
                  ধাপ ০৩
                </span>
                <h4 className="text-lg font-bold text-black mb-2">নোট রাখুন ও চর্চা করুন</h4>
                <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                  গুরুত্বপূর্ণ বিষয়গুলো ব্যক্তিগত নোটে সংরক্ষণ করুন এবং নিজের উদ্যোগ ও দৈনন্দিন জীবনে প্রয়োগ করে গল্প তৈরি করুন।
                </p>
              </div>
            </div>
          </section>

          {/* Recent Sessions Showcase */}
          <section className="w-full py-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 bg-[#E2E361]/20 border border-[#E2E361] rounded text-black">
                  নিয়মিত পাঠ
                </span>
                <h3 className="text-2xl sm:text-3xl text-black font-extrabold mt-2 font-headline">
                  সাম্প্রতিক সেশন
                </h3>
                <p className="text-sm text-neutral-600 mt-1 font-medium">
                  নির্বাচিত সাম্প্রতিক পাঠ ও অভিজ্ঞতা
                </p>
              </div>
              <Link
                href="/sessions"
                className="inline-flex items-center gap-1 text-sm font-bold text-black hover:underline"
              >
                <span>সকল সেশন দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentSessions.map((session) => (
                <article
                  key={session.id}
                  className="bg-white border border-[#e5e7eb] rounded-xl p-6 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E2E361]/20 text-black text-xs font-bold border border-[#E2E361]">
                          ব্যাচ {banglaNumber(session.batch_number)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FF49D2]/15 text-black text-xs font-bold border border-[#FF49D2]">
                          সেশন {banglaNumber(session.session_number)}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-600 font-semibold font-mono">
                        {formatDateBn(session.date)}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold font-headline text-black mb-2 line-clamp-2 hover:underline">
                      <Link href={`/sessions/${session.slug}`}>{session.title}</Link>
                    </h4>

                    <p className="text-sm text-neutral-700 font-medium line-clamp-3 mb-6 leading-relaxed">
                      {session.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-mint border border-mint text-black flex items-center justify-center font-bold text-xs">
                        ই
                      </div>
                      <span className="text-xs font-bold text-black">
                        {session.author_name}
                      </span>
                    </div>
                    <Link
                      href={`/sessions/${session.slug}`}
                      className="text-xs font-bold text-black bg-white hover:bg-gray-50 border border-[#e5e7eb] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <span>পড়ুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Editorial Invitation Callout */}
          <section className="w-full my-12">
            <div className="bg-white border border-[#e5e7eb] p-8 sm:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="max-w-xl text-center md:text-left relative z-10">
                <h3 className="text-2xl sm:text-3xl text-black font-extrabold font-headline mb-2">
                  আপনি কি পরবর্তী ব্যাচে যুক্ত হতে প্রস্তুত?
                </h3>
                <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                  প্রতিটি নতুন ব্যাচে সারাদেশ থেকে হাজারো তরুণ-তরুণী ও উদ্যোক্তা যুক্ত হয়ে গড়ে তুলছেন তাদের সততা ও আত্মনির্ভরশীলতার গল্প।
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 relative z-10">
                <Button asChild size="lg" variant="primary" className="font-bold h-11 px-7 rounded-lg">
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
