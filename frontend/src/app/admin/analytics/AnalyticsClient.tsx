"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  Download,
  Calendar,
  Layers,
  Heart,
  MessageSquare,
  Bookmark,
  MapPin,
  Sparkles,
} from "lucide-react";

const TOP_SESSIONS = [
  {
    rank: "০১",
    title: "ব্যবসায় সততা, প্রতিশ্রুতি রক্ষা এবং দীর্ঘমেয়াদি গ্রাহকের অবিচল আস্থা অর্জনের কৌশলসমূহ...",
    batch_session: "ব্যাচ ২৪ • সেশন ১৬১",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "১৪ মে, ২০২৪",
    likes: 1240,
    comments: 348,
    bookmarks: 512,
    score: "৯৮.৪%",
  },
  {
    rank: "০২",
    title: "বাজার যাচাই এবং প্রথম ১০০ জন বিশ্বস্ত গ্রাহক তৈরির বাস্তব কৌশল ও কেস স্টাডি...",
    batch_session: "ব্যাচ ২৪ • সেশন ১৬০",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "১২ মে, ২০২৪",
    likes: 1080,
    comments: 295,
    bookmarks: 480,
    score: "৯৫.২%",
  },
  {
    rank: "০৩",
    title: "টেকসই সাপ্লাই চেইন ও কোয়ালিটি কন্ট্রোল: কাঁচামাল সংগ্রহ ও সময়নিষ্ঠ ডেলিভারি...",
    batch_session: "ব্যাচ ২৪ • সেশন ১৫৯",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "১০ মে, ২০২৪",
    likes: 960,
    comments: 210,
    bookmarks: 390,
    score: "৯২.১%",
  },
  {
    rank: "০৪",
    title: "নেতৃত্ব ও সংকটকালে স্থির থেকে সঠিক ব্যবসায়িক সিদ্ধান্ত গ্রহণের শক্তি...",
    batch_session: "ব্যাচ ২৩ • সেশন ৫০",
    mentor: "ইকবাল বাহার জাহিদ",
    date: "০২ মে, ২০২৪",
    likes: 890,
    comments: 185,
    bookmarks: 340,
    score: "৮৯.৮%",
  },
];

export function AnalyticsClient() {
  const [selectedRange, setSelectedRange] = useState("30");

  const handleExportReport = () => {
    toast.success("অ্যানালিটিক্স রিপোর্ট (PDF/CSV) প্রস্তুত হচ্ছে...");
  };

  return (
    <div className="flex flex-col gap-8 w-full font-bangla pb-12">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-border">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              লাইভ অ্যানালিটিক্স
            </span>
            <span className="text-xs text-muted-foreground">হালনাগাদ: আজ সকাল ১০:১৫</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            পরিসংখ্যান ও অ্যানালিটিক্স
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            প্ল্যাটফর্মের সার্বিক প্রবৃদ্ধি, ব্যাচভিত্তিক সক্রিয়তা ও সদস্য মিথস্ক্রিয়ার সামগ্রিক চিত্র
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-medium text-foreground shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>গত ৩০ দিন (১ মে - ৩০ মে, ২০২৪)</span>
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-foreground text-background hover:opacity-95 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>রিপোর্ট এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Row (4 Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between gap-3 shadow-sm hover:border-foreground/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs text-muted-foreground font-medium">মোট সক্রিয় সদস্য</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">১২,৪৮০ জন</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+১২.৪% বিগত মাসের তুলনায়</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between gap-3 shadow-sm hover:border-foreground/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs text-muted-foreground font-medium">মোট সম্পৃক্ততা / মিথস্ক্রিয়া</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">৭৩,৪৭০ টি</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+১৮.২% লাইক, মন্তব্য ও নোট</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between gap-3 shadow-sm hover:border-foreground/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs text-muted-foreground font-medium">সেশন সমাপ্তির হার</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">৭৮.৫%</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+৪.১% সমাপ্তি লক্ষ্যমাত্রা অতিক্রম</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between gap-3 shadow-sm hover:border-foreground/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs text-muted-foreground font-medium">গড় অধ্যয়ন সময়</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">১৪.২ মিনিট</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <span>প্রতি সেশনে গভীর মনোযোগ পর্যবেক্ষণ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Analytics Section (2-Column Grid 7 cols + 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Bar chart & Line chart */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Batch-wise Participation Bar Chart */}
          <div className="p-6 rounded-xl bg-card border border-border flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">ব্যাচ অনুযায়ী অংশগ্রহণ</h2>
                <p className="text-xs text-muted-foreground">
                  প্রতিটি ব্যাচের নিবন্ধিত শিক্ষার্থীদের নিয়মিত পাঠ ও ফিডব্যাক হার
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
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
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="520" y1="20" y2="20" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="520" y1="65" y2="65" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="520" y1="110" y2="110" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="40" x2="520" y1="155" y2="155" />
                <line stroke="#CBD5E1" x1="40" x2="520" y1="180" y2="180" />

                {/* Y-axis */}
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="end" x="30" y="24">১০০%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="end" x="30" y="69">৭৫%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="end" x="30" y="114">৫০%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="end" x="30" y="159">২৫%</text>

                {/* Batch 20 (52%) */}
                <rect fill="#CBD5E1" height="83" rx="4" width="46" x="65" y="97" />
                <text className="text-muted-foreground text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="88" y="90">৫২%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="88" y="198">ব্যাচ ২০</text>

                {/* Batch 21 (58%) */}
                <rect fill="#94A3B8" height="93" rx="4" width="46" x="145" y="87" />
                <text className="text-muted-foreground text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="168" y="80">৫৮%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="168" y="198">ব্যাচ ২১</text>

                {/* Batch 22 (64%) */}
                <rect fill="#64748B" height="103" rx="4" width="46" x="225" y="77" />
                <text className="text-foreground text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="248" y="70">৬৪%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="248" y="198">ব্যাচ ২২</text>

                {/* Batch 23 (72%) */}
                <rect fill="#99F6E4" height="115" rx="4" width="46" x="305" y="65" />
                <text className="text-foreground text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="328" y="58">৭২%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="328" y="198">ব্যাচ ২৩</text>

                {/* Batch 24 (88% - Active) */}
                <rect fill="#0F766E" height="141" rx="4" width="46" x="385" y="39" />
                <text className="text-foreground text-[12px] font-bold" fill="currentColor" textAnchor="middle" x="408" y="31">৮৮%</text>
                <text className="text-foreground text-[11px] font-bold" fill="currentColor" textAnchor="middle" x="408" y="198">ব্যাচ ২৪</text>

                {/* Batch 25 (45%) */}
                <rect fill="#E2E8F0" height="72" rx="4" width="46" x="465" y="108" />
                <text className="text-muted-foreground text-[11px] font-semibold" fill="currentColor" textAnchor="middle" x="488" y="101">৪৫%</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="488" y="198">ব্যাচ ২৫</text>
              </svg>
            </div>
          </div>

          {/* Card 2: Weekly Growth Line Chart */}
          <div className="p-6 rounded-xl bg-card border border-border flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">সাপ্তাহিক নতুন সদস্য বৃদ্ধি</h2>
                <p className="text-xs text-muted-foreground">
                  গত ৮ সপ্তাহের নিবন্ধন বনাম পূর্ণাঙ্গ যাচাইকরণ গতিশীলতা
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-teal-600" />
                  <span className="text-foreground font-medium">নতুন নিবন্ধিত</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-slate-400" />
                  <span className="text-muted-foreground">যাচাইকৃত রূপান্তর</span>
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
                    <stop offset="0%" stopColor="#0F766E" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="30" x2="520" y1="20" y2="20" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="30" x2="520" y1="65" y2="65" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="30" x2="520" y1="110" y2="110" />
                <line stroke="#CBD5E1" x1="30" x2="520" y1="150" y2="150" />

                <polygon
                  fill="url(#areaGrad)"
                  points="50,135 110,120 170,105 230,80 290,92 350,60 410,45 480,30 480,150 50,150"
                />

                {/* Secondary curve */}
                <path
                  d="M50,142 C85,138 95,132 110,130 C140,126 155,120 170,118 C200,114 215,102 230,98 C260,95 275,105 290,104 C320,100 335,82 350,78 C380,72 395,68 410,62 C445,55 460,46 480,44"
                  fill="none"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth="2"
                />

                {/* Primary curve */}
                <path
                  d="M50,135 C85,130 95,122 110,120 C140,115 155,107 170,105 C200,101 215,84 230,80 C260,76 275,94 290,92 C320,88 335,66 350,60 C380,52 395,48 410,45 C445,39 460,32 480,30"
                  fill="none"
                  stroke="#0F766E"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />

                <circle cx="50" cy="135" fill="#FFFFFF" r="3.5" stroke="#0F766E" strokeWidth="2" />
                <circle cx="110" cy="120" fill="#FFFFFF" r="3.5" stroke="#0F766E" strokeWidth="2" />
                <circle cx="170" cy="105" fill="#FFFFFF" r="3.5" stroke="#0F766E" strokeWidth="2" />
                <circle cx="230" cy="80" fill="#FFFFFF" r="3.5" stroke="#0F766E" strokeWidth="2" />
                <circle cx="290" cy="92" fill="#FFFFFF" r="3.5" stroke="#0F766E" strokeWidth="2" />
                <circle cx="350" cy="60" fill="#FFFFFF" r="3.5" stroke="#0F766E" strokeWidth="2" />
                <circle cx="410" cy="45" fill="#FFFFFF" r="3.5" stroke="#0F766E" strokeWidth="2" />
                <circle cx="480" cy="30" fill="#0F766E" r="4.5" stroke="#0E0E0E" strokeWidth="2" />

                {/* X labels */}
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="50" y="168">সপ্তাহ ১</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="110" y="168">সপ্তাহ ২</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="170" y="168">সপ্তাহ ৩</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="230" y="168">সপ্তাহ ৪</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="290" y="168">সপ্তাহ ৫</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="350" y="168">সপ্তাহ ৬</text>
                <text className="text-muted-foreground text-[11px]" fill="currentColor" textAnchor="middle" x="410" y="168">সপ্তাহ ৭</text>
                <text className="text-foreground text-[11px] font-bold" fill="currentColor" textAnchor="middle" x="480" y="168">সপ্তাহ ৮</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Verification ratio & Demographic breakdown */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Donut Chart: Verified vs Unverified */}
          <div className="p-6 rounded-xl bg-card border border-border flex flex-col gap-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-foreground">যাচাইকৃত বনাম অযাচাইকৃত</h2>
              <p className="text-xs text-muted-foreground">প্ল্যাটফর্ম সদস্যদের সত্যতা যাচাই অনুপাত</p>
            </div>

            {/* Donut SVG */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" fill="transparent" r="62" stroke="#E2E8F0" strokeWidth="16" />
                  <circle
                    cx="80"
                    cy="80"
                    fill="transparent"
                    r="62"
                    stroke="#0F766E"
                    strokeDasharray="389.55"
                    strokeDashoffset="93.5"
                    strokeLinecap="round"
                    strokeWidth="16"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-3xl font-bold text-foreground leading-none">৭৬%</span>
                  <span className="text-xs text-muted-foreground mt-1">যাচাইকৃত সদস্য</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
                  <span className="font-semibold text-foreground">যাচাইকৃত সদস্য</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">৯,৪৫০ জন</span>
                  <span className="text-muted-foreground">(৭৬%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-muted-foreground">অযাচাইকৃত / অপেক্ষমান</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">৩,০৩০ জন</span>
                  <span className="text-muted-foreground">(২৪%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Active Distribution */}
          <div className="p-6 rounded-xl bg-card border border-border flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">সর্বাধিক সক্রিয় বিভাগ</h3>
              </div>
              <span className="text-xs text-muted-foreground">৮টি বিভাগ</span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-foreground">ঢাকা বিভাগ</span>
                  <span className="font-bold text-foreground">৪২%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-foreground">চট্টগ্রাম বিভাগ</span>
                  <span className="font-bold text-foreground">২৪%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600/80 rounded-full" style={{ width: "24%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-foreground">রাজশাহী বিভাগ</span>
                  <span className="font-bold text-foreground">১৪%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600/60 rounded-full" style={{ width: "14%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Performing Sessions Table */}
      <div className="rounded-xl bg-card border border-border flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">সেরা সেশনসমূহ</h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
                শীর্ষ ৪টি নির্বাচিত
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              সর্বাধিক পঠিত ও মিথস্ক্রিয়াসম্পন্ন সেশনসমূহের সামগ্রিক এনগেজমেন্ট মূল্যায়ন
            </p>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border select-none">
                <th className="py-3 px-6 text-center w-16">ক্রমিক</th>
                <th className="py-3 px-6 min-w-[280px]">সেশন বিবরণ</th>
                <th className="py-3 px-6 whitespace-nowrap">প্রকাশের তারিখ</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">লাইক</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">মন্তব্য</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">সংরক্ষণ</th>
                <th className="py-3 px-6 text-right whitespace-nowrap">এনগেজমেন্ট স্কোর</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TOP_SESSIONS.map((session) => (
                <tr key={session.rank} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-foreground">
                    {session.rank}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-foreground line-clamp-1 text-sm">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="px-2 py-0.5 rounded bg-secondary font-medium">
                          {session.batch_session}
                        </span>
                        <span>{session.mentor}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-muted-foreground">
                    {session.date}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap font-semibold text-foreground">
                    {banglaNumber(session.likes)}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap font-semibold text-foreground">
                    {banglaNumber(session.comments)}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap font-semibold text-foreground">
                    {banglaNumber(session.bookmarks)}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-teal-700">
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
