"use client";

import React from "react";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Users,
  Heart,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  TrendingUp,
  MapPin,
} from "lucide-react";

interface AnalyticsProps {
  initialAnalytics?: {
    current_totals?: {
      users?: number;
      sessions?: number;
      likes?: number;
      comments?: number;
      bookmarks?: number;
    };
    users_by_status?: {
      unverified?: number;
      pending?: number;
      verified?: number;
      rejected?: number;
    };
  };
}

const TOP_SESSIONS = [
  {
    rank: "১",
    title: "উদ্যোক্তার সততা, ধৈর্য ও গ্রাহক আস্থা অর্জনের মূলনীতি",
    batch_session: "ব্যাচ ২৪ • সেশন ১২",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "১৫ মে, ২০২৪",
    likes: 1248,
    comments: 420,
    bookmarks: 310,
    score: "৯৮.২",
  },
  {
    rank: "২",
    title: "ব্যবসায়ের ঝুঁকি ব্যবস্থাপনা ও সঠিক সিদ্ধান্তের সাহস",
    batch_session: "ব্যাচ ২৪ • সেশন ১১",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "১৪ মে, ২০২৪",
    likes: 980,
    comments: 295,
    bookmarks: 180,
    score: "৯৪.৫",
  },
  {
    rank: "৩",
    title: "নেতৃত্ব ও টিম ম্যানেজমেন্ট: সংকটকালে সঠিক সিদ্ধান্ত গ্রহণের সাহস",
    batch_session: "ব্যাচ ২৩ • সেশন ৫০",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "১০ মে, ২০২৪",
    likes: 850,
    comments: 210,
    bookmarks: 140,
    score: "৯১.০",
  },
  {
    rank: "৪",
    title: "কার্যকর ক্যাশফ্লো ও আর্থিক শৃঙ্খলা রক্ষা করার উপায়",
    batch_session: "ব্যাচ ২৪ • সেশন ১৩",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "০৮ মে, ২০২৪",
    likes: 720,
    comments: 185,
    bookmarks: 110,
    score: "৮৮.৪",
  },
];

export function AnalyticsClient({ initialAnalytics }: AnalyticsProps) {
  const totalMembers = initialAnalytics?.current_totals?.users || 12480;
  const totalInteractions =
    (initialAnalytics?.current_totals?.likes ?? 0) +
      (initialAnalytics?.current_totals?.comments ?? 0) +
      (initialAnalytics?.current_totals?.bookmarks ?? 0) || 73470;
  const verifiedMembers = initialAnalytics?.users_by_status?.verified ?? 9450;

  const handleExportReport = () => {
    toast.success("অ্যানালিটিক্স রিপোর্ট (PDF/CSV) প্রস্তুত হচ্ছে...");
  };

  return (
    <div className="flex flex-col gap-8 w-full font-bangla pb-12">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-[#e5e7eb]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              লাইভ অ্যানালিটিক্স
            </span>
            <span className="text-xs text-gray-500 font-mono">হালনাগাদ: আজ সকাল ১০:১৫</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-headline">
            পরিসংখ্যান ও অ্যানালিটিক্স
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal">
            প্ল্যাটফর্মের সার্বিক প্রবৃদ্ধি, ব্যাচভিত্তিক সক্রিয়তা ও সদস্য মিথস্ক্রিয়ার সামগ্রিক চিত্র
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#e5e7eb] text-xs font-mono font-semibold text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>গত ৩০ দিন (১ মে - ৩০ মে, ২০২৪)</span>
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-mint border border-mint text-black text-xs font-bold hover:bg-[#72eab0] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>রিপোর্ট এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Row (4 Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col justify-between gap-3 hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs text-gray-500 font-mono font-semibold uppercase">মোট সক্রিয় সদস্য</span>
            <div className="w-9 h-9 rounded-lg bg-[#63DB9A]/20 border border-[#63DB9A] text-black flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black font-headline tracking-tight">{banglaNumber(totalMembers)} জন</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
              <span>+১২.৪% বিগত মাসের তুলনায়</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col justify-between gap-3 hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs text-gray-500 font-mono font-semibold uppercase">মোট মিথস্ক্রিয়া</span>
            <div className="w-9 h-9 rounded-lg bg-[#E2E361]/20 border border-[#E2E361] text-black flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black font-headline tracking-tight">{banglaNumber(totalInteractions)} টি</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-black" />
              <span>+১৮.২% লাইক, মন্তব্য ও নোট</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col justify-between gap-3 hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs text-gray-500 font-mono font-semibold uppercase">সেশন সমাপ্তির হার</span>
            <div className="w-9 h-9 rounded-lg bg-[#63DB9A]/20 border border-[#63DB9A] text-black flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black font-headline tracking-tight">৭৮.৫%</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
              <span>+৪.১% লক্ষ্যমাত্রা অতিক্রম</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col justify-between gap-3 hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs text-gray-500 font-mono font-semibold uppercase">গড় অধ্যয়ন সময়</span>
            <div className="w-9 h-9 rounded-lg bg-[#FF49D2]/15 border border-[#FF49D2] text-black flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-black font-headline tracking-tight">১৪.২ মিনিট</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 font-mono">
              <span>প্রতি সেশনে গড় মনোযোগ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Analytics Section (2-Column Grid 7 cols + 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Bar chart & Line chart */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Batch-wise Participation Bar Chart */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-black font-headline">ব্যাচ অনুযায়ী অংশগ্রহণ</h2>
                <p className="text-xs text-gray-500">
                  প্রতিটি ব্যাচের নিবন্ধিত শিক্ষার্থীদের নিয়মিত পাঠ ও ফিডব্যাক হার
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-black">
                <span className="w-3 h-3 rounded bg-mint border border-mint" />
                <span>বর্তমান সক্রিয় ব্যাচ (২৪)</span>
              </div>
            </div>

            {/* Custom Clean Bar Chart SVG */}
            <div className="w-full">
              <svg
                className="w-full h-56"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 540 210"
              >
                <line stroke="#e5e7eb" strokeDasharray="3 3" x1="40" x2="520" y1="20" y2="20" />
                <line stroke="#e5e7eb" strokeDasharray="3 3" x1="40" x2="520" y1="65" y2="65" />
                <line stroke="#e5e7eb" strokeDasharray="3 3" x1="40" x2="520" y1="110" y2="110" />
                <line stroke="#e5e7eb" strokeDasharray="3 3" x1="40" x2="520" y1="155" y2="155" />
                <line stroke="#e5e7eb" strokeWidth="1" x1="40" x2="520" y1="180" y2="180" />

                {/* Y-axis */}
                <text className="text-gray-400 font-mono text-[11px]" fill="currentColor" textAnchor="end" x="30" y="24">১০০%</text>
                <text className="text-gray-400 font-mono text-[11px]" fill="currentColor" textAnchor="end" x="30" y="69">৭৫%</text>
                <text className="text-gray-400 font-mono text-[11px]" fill="currentColor" textAnchor="end" x="30" y="114">৫০%</text>
                <text className="text-gray-400 font-mono text-[11px]" fill="currentColor" textAnchor="end" x="30" y="159">২৫%</text>

                {/* Batch 20 (52%) */}
                <rect fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" height="83" rx="4" width="46" x="65" y="97" />
                <text className="text-gray-700 font-mono text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="88" y="90">৫২%</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="88" y="198">ব্যাচ ২০</text>

                {/* Batch 21 (58%) */}
                <rect fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" height="93" rx="4" width="46" x="145" y="87" />
                <text className="text-gray-700 font-mono text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="168" y="80">৫৮%</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="168" y="198">ব্যাচ ২১</text>

                {/* Batch 22 (64%) */}
                <rect fill="#E2E361" fillOpacity="0.4" stroke="#E2E361" strokeWidth="1" height="103" rx="4" width="46" x="225" y="77" />
                <text className="text-black font-mono text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="248" y="70">৬৪%</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="248" y="198">ব্যাচ ২২</text>

                {/* Batch 23 (72%) */}
                <rect fill="#E2E361" fillOpacity="0.6" stroke="#E2E361" strokeWidth="1" height="115" rx="4" width="46" x="305" y="65" />
                <text className="text-black font-mono text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="328" y="58">৭২%</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="328" y="198">ব্যাচ ২৩</text>

                {/* Batch 24 (88% - Active) */}
                <rect fill="#63DB9A" stroke="#63DB9A" strokeWidth="1" height="141" rx="4" width="46" x="385" y="39" />
                <text className="text-black font-mono text-[12px] font-black" fill="currentColor" textAnchor="middle" x="408" y="31">৮৮%</text>
                <text className="text-black font-mono text-[11px] font-bold" fill="currentColor" textAnchor="middle" x="408" y="198">ব্যাচ ২৪</text>

                {/* Batch 25 (45%) */}
                <rect fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" height="72" rx="4" width="46" x="465" y="108" />
                <text className="text-gray-700 font-mono text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="488" y="101">৪৫%</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="488" y="198">ব্যাচ ২৫</text>
              </svg>
            </div>
          </div>

          {/* Card 2: Weekly Growth Line Chart */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-black font-headline">সাপ্তাহিক নতুন সদস্য বৃদ্ধি</h2>
                <p className="text-xs text-gray-500">
                  গত ৮ সপ্তাহের নিবন্ধন বনাম পূর্ণাঙ্গ যাচাইকরণ গতিশীলতা
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-mint border border-mint" />
                  <span className="text-black">নতুন নিবন্ধিত</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#E2E361] border border-[#E2E361]" />
                  <span className="text-black">যাচাইকৃত রূপান্তর</span>
                </div>
              </div>
            </div>

            <div className="w-full">
              <svg
                className="w-full h-52"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 540 180"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#63DB9A" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#63DB9A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line stroke="#e5e7eb" strokeDasharray="3 3" x1="30" x2="520" y1="20" y2="20" />
                <line stroke="#e5e7eb" strokeDasharray="3 3" x1="30" x2="520" y1="65" y2="65" />
                <line stroke="#e5e7eb" strokeDasharray="3 3" x1="30" x2="520" y1="110" y2="110" />
                <line stroke="#e5e7eb" strokeWidth="1" x1="30" x2="520" y1="150" y2="150" />

                <polygon
                  fill="url(#areaGrad)"
                  points="50,135 110,120 170,105 230,80 290,92 350,60 410,45 480,30 480,150 50,150"
                />

                {/* Secondary curve */}
                <path
                  d="M50,142 C85,138 95,132 110,130 C140,126 155,120 170,118 C200,114 215,102 230,98 C260,95 275,105 290,104 C320,100 335,82 350,78 C380,72 395,68 410,62 C445,55 460,46 480,44"
                  fill="none"
                  stroke="#E2E361"
                  strokeWidth="2.5"
                />

                {/* Primary curve */}
                <path
                  d="M50,135 C85,130 95,122 110,120 C140,115 155,107 170,105 C200,101 215,84 230,80 C260,76 275,94 290,92 C320,88 335,66 350,60 C380,52 395,48 410,45 C445,39 460,32 480,30"
                  fill="none"
                  stroke="#63DB9A"
                  strokeLinecap="round"
                  strokeWidth="3"
                />

                <circle cx="50" cy="135" fill="#63DB9A" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="110" cy="120" fill="#63DB9A" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="170" cy="105" fill="#63DB9A" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="230" cy="80" fill="#63DB9A" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="290" cy="92" fill="#63DB9A" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="350" cy="60" fill="#63DB9A" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="410" cy="45" fill="#63DB9A" r="3.5" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="480" cy="30" fill="#63DB9A" r="4.5" stroke="#ffffff" strokeWidth="2" />

                {/* X labels */}
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="50" y="168">সপ্তাহ ১</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="110" y="168">সপ্তাহ ২</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="170" y="168">সপ্তাহ ৩</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="230" y="168">সপ্তাহ ৪</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="290" y="168">সপ্তাহ ৫</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="350" y="168">সপ্তাহ ৬</text>
                <text className="text-gray-500 font-mono text-[11px]" fill="currentColor" textAnchor="middle" x="410" y="168">সপ্তাহ ৭</text>
                <text className="text-black font-mono text-[11px] font-bold" fill="currentColor" textAnchor="middle" x="480" y="168">সপ্তাহ ৮</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Verification ratio & Demographic breakdown */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Donut Chart: Verified vs Unverified */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-black font-headline">যাচাইকৃত বনাম অযাচাইকৃত</h2>
              <p className="text-xs text-gray-500">প্ল্যাটফর্ম সদস্যদের সত্যতা যাচাই অনুপাত</p>
            </div>

            {/* Donut SVG */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" fill="transparent" r="62" stroke="#f3f4f6" strokeWidth="16" />
                  <circle
                    cx="80"
                    cy="80"
                    fill="transparent"
                    r="62"
                    stroke="#63DB9A"
                    strokeDasharray="389.55"
                    strokeDashoffset="93.5"
                    strokeLinecap="round"
                    strokeWidth="16"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-4xl font-extrabold text-black font-headline leading-none">৭৬%</span>
                  <span className="text-xs text-gray-500 font-mono font-medium mt-1">যাচাইকৃত সদস্য</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-mint border border-mint shrink-0" />
                  <span className="font-semibold text-black">যাচাইকৃত সদস্য</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-black">৯,৪৫০ জন</span>
                  <span className="text-gray-500 font-normal">(৭৬%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300 shrink-0" />
                  <span className="text-gray-600 font-normal">অযাচাইকৃত / অপেক্ষমান</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-semibold text-black">৩,০৩০ জন</span>
                  <span className="text-gray-500 font-normal">(২৪%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Active Distribution */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-black" />
                <h3 className="text-sm font-bold text-black font-headline">সর্বাধিক সক্রিয় বিভাগ</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-gray-500">৮টি বিভাগ</span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-mono">
                  <span className="font-semibold text-black">ঢাকা বিভাগ</span>
                  <span className="font-bold text-black">৪২%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-mint rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-mono">
                  <span className="font-semibold text-black">চট্টগ্রাম বিভাগ</span>
                  <span className="font-bold text-black">২৪%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E2E361] rounded-full" style={{ width: "24%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-mono">
                  <span className="font-semibold text-black">রাজশাহী বিভাগ</span>
                  <span className="font-bold text-black">১৪%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF49D2]/40 rounded-full" style={{ width: "14%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Performing Sessions Table */}
      <div className="rounded-xl bg-white border border-[#e5e7eb] flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-black font-headline">সেরা সেশনসমূহ</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] text-xs font-mono font-bold">
                শীর্ষ ৪টি নির্বাচিত
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-normal">
              সর্বাধিক পঠিত ও মিথস্ক্রিয়াসম্পন্ন সেশনসমূহের সামগ্রিক এনগেজমেন্ট মূল্যায়ন
            </p>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f9fafb] text-gray-700 font-mono font-semibold uppercase tracking-wider border-b border-[#e5e7eb] select-none">
                <th className="py-3.5 px-6 text-center w-16">ক্রমিক</th>
                <th className="py-3.5 px-6 min-w-[280px]">সেশন বিবরণ</th>
                <th className="py-3.5 px-6 whitespace-nowrap">প্রকাশের তারিখ</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap">লাইক</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap">মন্তব্য</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap">সংরক্ষণ</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">এনগেজমেন্ট স্কোর</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {TOP_SESSIONS.map((session) => (
                <tr key={session.rank} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-black font-headline text-sm">
                    {session.rank}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-black line-clamp-1 text-sm font-bangla">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#f3f4f6] text-gray-700 border border-[#e5e7eb] font-semibold">
                          {session.batch_session}
                        </span>
                        <span className="font-bangla font-medium text-black">{session.mentor}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-mono text-xs">
                    {session.date}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap font-mono font-semibold text-black">
                    {banglaNumber(session.likes)}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap font-mono font-semibold text-black">
                    {banglaNumber(session.comments)}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap font-mono font-semibold text-black">
                    {banglaNumber(session.bookmarks)}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-black text-sm">
                    {session.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
