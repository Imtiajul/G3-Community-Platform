import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { MemberNavbar } from "@/components/shared/MemberNavbar";
import { MemberLeftSidebar, MemberMobileBottomNav } from "@/components/shared/MemberSidebar";
import { MemberRightAside } from "@/components/shared/MemberRightAside";
import { VerificationBanner } from "@/components/shared/VerificationBanner";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  ChevronRight,
  ArrowRight,
  Send,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";

export default async function FeedPage() {
  const user = await getCurrentUser();

  return (
    <>
      <MemberNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 pt-16 bg-background font-bangla min-h-screen">
        {/* Left Sidebar */}
        <MemberLeftSidebar />

        {/* Central Editorial Feed Column */}
        <main className="flex-1 max-w-[680px] mx-auto w-full py-6 pb-20 lg:pb-8 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col gap-6 w-full">
            {/* Dynamic Verification Banner */}
            <VerificationBanner />

            {/* Welcoming & Reading Progress Card */}
            <section className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    স্বাগতম, {user?.first_name || user?.full_name || "সম্মানিত সদস্য"}
                  </h1>
                  {user?.verification_status === "verified" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>যাচাইকৃত সদস্য</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border text-xs font-semibold">
                      ব্যাচ {banglaNumber(user?.batch || 24)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-foreground" />
                  {formatDateBn(new Date())}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                আজকের শেখার যাত্রা শুরু হোক ইতিবাচক মনোভাব ও মূল্যবোধ নিয়ে। প্রতিদিনের ক্ষুদ্র প্রয়াসই গড়ে তোলে আগামী দিনের টেকসই প্রতিষ্ঠান।
              </p>

              {/* Dynamic Reading Progress Strip */}
              <div className="mt-4 pt-2 flex flex-col gap-1.5 bg-secondary border border-border p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">
                    ব্যাচ {banglaNumber(user?.batch || 24)} • পাঠ অগ্রগতি (সেশন ১২/৯০)
                  </span>
                  <span className="text-foreground font-bold font-mono">১৩% সম্পন্ন</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-foreground rounded-full w-[13%]" />
                </div>
              </div>
            </section>

            {/* Segmented Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-2 rounded-xl shadow-sm">
              <div className="inline-flex items-center p-1 bg-secondary border border-border rounded-lg gap-1">
                <button className="px-3 py-1.5 rounded-md text-xs bg-foreground text-background font-bold shadow-sm transition-all">
                  সব
                </button>
                <button className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors">
                  আমার ব্যাচ (ব্যাচ ২৪)
                </button>
                <button className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors">
                  সংরক্ষিত
                </button>
              </div>

              <div className="flex items-center gap-2 px-1">
                <Link
                  href="/sessions"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-foreground text-foreground text-xs font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>সকল ফিল্টার</span>
                </Link>
              </div>
            </div>

            {/* Featured Card: "আজকের সেশন" */}
            <article className="relative bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden group hover:border-foreground transition-all">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
              <div className="flex items-center justify-between gap-2 mb-3 pl-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-foreground text-background text-xs font-bold">
                    আজকের সেশন
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border text-xs font-bold">
                    ব্যাচ ২৪
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground text-xs">
                    সেশন ১২
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-foreground" />
                  ৬ মিনিট পাঠ
                </span>
              </div>

              <div className="pl-1">
                <h2 className="text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer mb-2">
                  <Link href="/sessions/business-integrity-trust">
                    উদ্যোক্তার সততা, ধৈর্য ও গ্রাহক আস্থা অর্জনের মূলনীতি
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  ব্যবসার ভিত্তি কেবল মূলধনে গঠিত হয় না, বরং প্রতিটি পদক্ষেপে সততার প্রতিফলনই গ্রাহকের মনে স্থায়ী জায়গা নিশ্চিত করে। সাময়িক লাভের মোহে নীতি বিসর্জন না দিয়ে ধৈর্যের সাথে মানের সাথে আপস না করাই দীর্ঘমেয়াদী ব্র্যান্ড প্রতিষ্ঠার মূল চাবিকাঠি।
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 bg-secondary border-t border-border -mx-6 -mb-6 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
                      ই
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">ইকবাল বাহার জাহিদ</span>
                      <span className="text-[11px] text-muted-foreground">প্রতিষ্ঠাতা ও মেন্টর</span>
                    </div>
                  </div>
                  <Link
                    href="/sessions/business-integrity-trust"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-foreground hover:bg-neutral-800 text-background text-xs font-bold transition-colors shadow-sm"
                  >
                    <span>পড়ুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>

            {/* Feed Card 1: Detailed & Expanded Discussion View */}
            <article className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-sm text-foreground shrink-0">
                    ইব
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link href="/sessions/risk-management" className="text-base sm:text-lg font-bold text-foreground hover:underline">
                        ব্যবসায়ের ঝুঁকি ব্যবস্থাপনা ও সঠিক সিদ্ধান্তের সাহস
                      </Link>
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                      <span className="px-2 py-0.2 rounded-full bg-secondary text-foreground border border-border font-bold text-[11px]">
                        ব্যাচ ২৪
                      </span>
                      <span>•</span>
                      <span>সেশন ১১</span>
                      <span>•</span>
                      <span>১৪ মে, ২০২৪</span>
                    </div>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">
                কোনো উদ্যোগই ঝুঁকিমুক্ত নয়। কিন্তু ঝুঁকি মানে অন্ধের মতো এগিয়ে যাওয়া নয়, বরং সম্ভাব্য প্রতিটি প্রতিকূলতার আগাম বিশ্লেষণ করে বিকল্প পথ তৈরি রাখা। বিপদের মুহূর্তে স্থির থেকে সিদ্ধান্ত নেওয়ার মানসিক ক্ষমতাই একজন উদ্যোক্তাকে সাধারণ ব্যবসায়ী থেকে আলাদা করে।
              </p>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between py-2 bg-secondary border border-border px-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-foreground hover:opacity-75 text-xs font-bold transition-colors">
                    <ThumbsUp className="w-4 h-4 fill-current text-primary" />
                    <span>১২৪ সমমনা</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>২৮ মন্তব্য</span>
                  </button>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <button className="p-1.5 hover:text-foreground hover:bg-card rounded-full transition-colors" title="সংরক্ষণ করুন">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:text-foreground hover:bg-card rounded-full transition-colors" title="শেয়ার করুন">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline Comments Thread Preview */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-start gap-3 bg-secondary/70 border border-border p-3 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center font-bold text-xs shrink-0">
                    ফা
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">ফারহানা ইয়াসমিন</span>
                        <span className="text-[11px] text-muted-foreground font-mono">সহপাঠী (ব্যাচ ২৪)</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">২ ঘন্টা আগে</span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                      অসাধারণ বিশ্লেষণ! বিশেষ করে ৩য় পয়েন্টটি আমার বাস্তব ব্যবসায় কাজে লেগেছে। সাপ্লাই চেইন নিয়ে দ্বিধায় ছিলাম, আপনার এই নোট নতুন পথ দেখাল।
                    </p>
                  </div>
                </div>

                {/* Inline Comment Box */}
                <form action="/sessions/risk-management#comments-section" className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs shrink-0 font-bold">
                    {user?.first_name?.[0] || "আ"}
                  </div>
                  <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-3 py-1 focus-within:border-foreground transition-all">
                    <input
                      className="w-full bg-transparent py-1.5 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none"
                      placeholder="আপনার গঠনমূলক মন্তব্য লিখুন..."
                    />
                    <button type="submit" className="shrink-0 p-1 text-foreground hover:opacity-75 transition-colors">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </article>

            {/* Skeleton Loading State Preview from Stitch */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-3 animate-pulse opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-5 bg-border rounded-full" />
                  <div className="w-16 h-5 bg-border rounded-full" />
                  <div className="w-20 h-4 bg-secondary rounded" />
                </div>
                <div className="w-6 h-6 bg-border rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-border rounded mt-1" />
              <div className="space-y-2 mt-2">
                <div className="w-full h-3.5 bg-secondary rounded" />
                <div className="w-5/6 h-3.5 bg-secondary rounded" />
                <div className="w-2/3 h-3.5 bg-secondary rounded" />
              </div>
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
                <div className="flex gap-4">
                  <div className="w-16 h-3.5 bg-secondary rounded" />
                  <div className="w-16 h-3.5 bg-secondary rounded" />
                </div>
                <div className="w-6 h-4 bg-secondary rounded" />
              </div>
            </div>
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
