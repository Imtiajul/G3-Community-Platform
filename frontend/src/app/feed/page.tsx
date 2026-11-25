import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { MemberNavbar } from "@/components/shared/MemberNavbar";
import { MemberLeftSidebar, MemberMobileBottomNav } from "@/components/shared/MemberSidebar";
import { MemberRightAside } from "@/components/shared/MemberRightAside";
import { VerificationBanner } from "@/components/shared/VerificationBanner";
import { FeedSessionItem } from "./FeedSessionItem";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import { Calendar } from "lucide-react";

async function getFeedSessions() {
  const token = await getAccessToken();
  try {
    const endpoint = token
      ? `${env.DJANGO_INTERNAL_API_URL}/community/sessions/`
      : `${env.DJANGO_INTERNAL_API_URL}/public/sessions/`;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.results || data;
      if (Array.isArray(results) && results.length > 0) {
        return results;
      }
    }
  } catch {
    // Fallback if backend is temporarily offline
  }

  return [
    {
      id: "featured-1",
      slug: "business-integrity-trust",
      title: "উদ্যোক্তার সততা, ধৈর্য ও গ্রাহক আস্থা অর্জনের মূলনীতি",
      batch_number: 24,
      session_number: 12,
      date: "2024-05-15",
      excerpt:
        "ব্যবসার ভিত্তি কেবল মূলধনে গঠিত হয় না, বরং প্রতিটি পদক্ষেপে সততার প্রতিফলনই গ্রাহকের মনে স্থায়ী জায়গা নিশ্চিত করে। সাময়িক লাভের মোহে নীতি বিসর্জন না দিয়ে ধৈর্যের সাথে মানের সাথে আপস না করাই দীর্ঘমেয়াদী ব্র্যান্ড প্রতিষ্ঠার মূল চাবিকাঠি।",
      like_count: 124,
      comment_count: 28,
      bookmark_count: 15,
      is_liked_by_me: false,
      is_bookmarked_by_me: false,
    },
    {
      id: "feed-1",
      slug: "risk-management",
      title: "ব্যবসায়ের ঝুঁকি ব্যবস্থাপনা ও সঠিক সিদ্ধান্তের সাহস",
      batch_number: 24,
      session_number: 11,
      date: "2024-05-14",
      excerpt:
        "কোনো উদ্যোগই ঝুঁকিমুক্ত নয়। কিন্তু ঝুঁকি মানে অন্ধের মতো এগিয়ে যাওয়া নয়, বরং সম্ভাব্য প্রতিটি প্রতিকূলতার আগাম বিশ্লেষণ করে বিকল্প পথ তৈরি রাখা। বিপদের মুহূর্তে স্থির থেকে সিদ্ধান্ত নেওয়ার মানসিক ক্ষমতাই একজন উদ্যোক্তাকে সাধারণ ব্যবসায়ী থেকে আলাদা করে।",
      like_count: 98,
      comment_count: 14,
      bookmark_count: 9,
      is_liked_by_me: true,
      is_bookmarked_by_me: false,
      latest_comment: {
        author_first_name: "ফারহানা",
        excerpt:
          "অসাধারণ বিশ্লেষণ! বিশেষ করে ৩য় পয়েন্টটি আমার বাস্তব ব্যবসায় কাজে লেগেছে। সাপ্লাই চেইন নিয়ে দ্বিধায় ছিলাম, আপনার এই নোট নতুন পথ দেখাল।",
        created_at: "2024-05-14T10:00:00Z",
      },
    },
  ];
}

export default async function FeedPage() {
  const user = await getCurrentUser();
  const rawSessions = await getFeedSessions();

  const featuredSession = rawSessions.find((s: any) => s.is_featured) || rawSessions[0];
  const streamSessions = rawSessions.filter((s: any) => s.id !== featuredSession?.id);

  return (
    <>
      <MemberNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 pt-16 bg-white font-bangla min-h-screen">
        {/* Left Sidebar */}
        <MemberLeftSidebar />

        {/* Central Editorial Feed Column */}
        <main className="flex-1 max-w-[680px] mx-auto w-full py-6 pb-20 lg:pb-8 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col gap-6 w-full">
            {/* Dynamic Verification Banner */}
            <VerificationBanner />

            {/* Welcoming & Reading Progress Card */}
            <section className="bg-white border border-[#e5e7eb] p-6 rounded-xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-black">
                    স্বাগতম, {user?.first_name || user?.full_name || "সম্মানিত সদস্য"}
                  </h1>
                  {user?.verification_status === "verified" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>যাচাইকৃত সদস্য</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] text-xs font-bold">
                      ব্যাচ {banglaNumber(user?.batch || 24)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {formatDateBn(new Date())}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl font-normal">
                আজকের শেখার যাত্রা শুরু হোক ইতিবাচক মনোভাব ও মূল্যবোধ নিয়ে। প্রতিদিনের ক্ষুদ্র প্রয়াসই গড়ে তোলে আগামী দিনের টেকসই প্রতিষ্ঠান।
              </p>

              {/* Dynamic Reading Progress Strip */}
              <div className="mt-4 pt-3 flex flex-col gap-2 bg-[#f9fafb] border border-[#e5e7eb] p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black font-semibold">
                    ব্যাচ {banglaNumber(user?.batch || 24)} • পাঠ অগ্রগতি (সেশন ১২/৯০)
                  </span>
                  <span className="text-black font-bold font-mono bg-[#E2E361]/20 border border-[#E2E361] px-2 py-0.5 rounded-full text-[11px]">
                    ১৩% সম্পন্ন
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-mint rounded-full w-[13%]" />
                </div>
              </div>
            </section>

            {/* Segmented Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#e5e7eb] p-2 rounded-xl">
              <div className="inline-flex items-center p-1 bg-gray-100/60 rounded-lg gap-1">
                <button className="px-3.5 py-1.5 rounded-md text-xs bg-mint text-black font-bold border border-mint transition-all">
                  সব
                </button>
                <button className="px-3.5 py-1.5 rounded-md text-xs text-gray-700 hover:text-black hover:bg-white font-medium transition-colors">
                  আমার ব্যাচ (ব্যাচ {banglaNumber(user?.batch || 24)})
                </button>
                <Link
                  href="/saved"
                  className="px-3.5 py-1.5 rounded-md text-xs text-gray-700 hover:text-black hover:bg-white font-medium transition-colors"
                >
                  সংরক্ষিত
                </Link>
              </div>

              <div className="flex items-center gap-2 px-1">
                <Link
                  href="/sessions"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e5e7eb] hover:bg-gray-50 text-black text-xs font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>সকল সেশন</span>
                </Link>
              </div>
            </div>

            {/* Featured / Today's Session Card */}
            {featuredSession && (
              <FeedSessionItem
                session={featuredSession}
                currentUser={user}
                isFeatured={true}
              />
            )}

            {/* Stream Sessions Cards */}
            {streamSessions.map((session: any) => (
              <FeedSessionItem
                key={session.id || session.slug}
                session={session}
                currentUser={user}
              />
            ))}
          </div>
        </main>

        {/* Right Aside */}
        <MemberRightAside />
      </div>

      {/* Mobile Bottom Navigation */}
      <MemberMobileBottomNav />
    </>
  );
}
