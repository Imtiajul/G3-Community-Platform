"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  BookOpen,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Calendar,
  Clock,
  Check,
  Trash2,
} from "lucide-react";

export type AdminAnalyticsData = any;

export interface VerificationApplicant {
  id: number | string;
  name: string;
  email: string;
  batch: number;
  reg_no: string;
  district: string;
  track: string;
  matched: boolean;
  initials: string;
}

export interface AdminOverviewClientProps {
  initialAnalytics?: any;
  initialStats?: {
    total_users?: number;
    verified_users?: number;
    total_sessions?: number;
    total_likes?: number;
    total_comments?: number;
    total_bookmarks?: number;
  };
  initialApplicants?: VerificationApplicant[];
  initialComments?: Array<{
    id: number | string;
    author: string;
    session_title: string;
    content: string;
    time_ago: string;
  }>;
}

const DEFAULT_APPLICANTS = [
  {
    id: 1,
    name: "তানভীর আহমেদ",
    email: "tanvir.ctg@gmail.com",
    batch: 24,
    reg_no: "REG-24-10892",
    district: "চট্টগ্রাম",
    track: "ই-কমার্স উদ্যোগ",
    matched: true,
    initials: "তা",
  },
  {
    id: 2,
    name: "মেহেরুন্নেসা শম্পা",
    email: "shampa.crafts@yahoo.com",
    batch: 24,
    reg_no: "REG-24-11450",
    district: "রাজশাহী",
    track: "হস্তশিল্প ও বুটিক",
    matched: true,
    initials: "মে",
  },
  {
    id: 3,
    name: "আরিফুল ইসলাম",
    email: "arif.agro@outlook.com",
    batch: 23,
    reg_no: "REG-23-09812",
    district: "ময়মনসিংহ",
    track: "কৃষি ও ডেইরি ফার্মিং",
    matched: false,
    initials: "আ",
  },
];

const DEFAULT_COMMENTS = [
  {
    id: 1,
    author: "ফারহানা ইয়াসমিন (ব্যাচ ২৪)",
    session_title: "সেশন ১২ • মূল্যবোধ",
    content: "সততার সাথে প্রতিশ্রুতি রক্ষা করার এই নীতি আমাদের ব্যবসায় বিশাল পরিবর্তন এনেছে।",
    time_ago: "৫ মিনিট আগে",
  },
  {
    id: 2,
    author: "রাকিবুল হাসান (ব্যাচ ২৩)",
    session_title: "সেশন ৫০ • সংকটকালীন সিদ্ধান্ত",
    content: "দলের প্রতিটি কর্মীকে অনুপ্রাণিত রাখার এই বাস্তবমুখী টিপস দারুণ কাজে দিয়েছে।",
    time_ago: "১৮ মিনিট আগে",
  },
];

export function AdminOverviewClient({
  initialStats,
  initialApplicants = DEFAULT_APPLICANTS,
  initialComments = DEFAULT_COMMENTS,
}: AdminOverviewClientProps) {
  const [applicants, setApplicants] = useState(initialApplicants);
  const [comments, setComments] = useState(initialComments);

  const totalUsers = initialStats?.total_users ?? 12480;
  const verifiedUsers = initialStats?.verified_users ?? 8920;
  const totalSessions = initialStats?.total_sessions ?? 160;
  const totalLikes = initialStats?.total_likes ?? 48200;
  const totalComments = initialStats?.total_comments ?? 12350;
  const totalBookmarks = initialStats?.total_bookmarks ?? 6420;

  const handleApproveApplicant = async (id: number | string, name: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    toast.success(`${name}-এর আবেদন অনুমোদিত হয়েছে।`);

    try {
      await fetch(`/api/bff/admin/verification/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Backend sync
    }
  };

  const handleRejectApplicant = async (id: number | string, name: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    toast.error(`${name}-এর আবেদন প্রত্যাখ্যান করা হয়েছে।`);

    try {
      await fetch(`/api/bff/admin/verification/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Backend sync
    }
  };

  const handleApproveComment = async (id: number | string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success("মন্তব্যটি অনুমোদিত হয়েছে।");

    try {
      await fetch(`/api/bff/admin/comments/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Backend sync
    }
  };

  const handleDeleteComment = async (id: number | string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.error("মন্তব্যটি বাতিল করা হয়েছে।");

    try {
      await fetch(`/api/bff/admin/comments/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Backend sync
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full font-bangla pb-12">
      {/* Top Banner / Editorial Welcome */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline text-black tracking-tight">
              স্বাগতম, অ্যাডমিন প্যানেল
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              লাইভ সিস্টেম
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            প্ল্যাটফর্মের সার্বিক কার্যক্রম ও সদস্য ব্যবস্থাপনার সংক্ষিপ্ত চিত্র
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e5e7eb] rounded-lg text-black text-xs font-semibold">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>আজকের তারিখ: {formatDateBn(new Date())}</span>
          </div>
          <Link
            href="/admin/sessions/new"
            className="inline-flex items-center gap-2 bg-mint hover:bg-[#72eab0] text-black border border-mint px-4 py-2 rounded-lg text-xs font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন সেশন প্রকাশ করুন</span>
          </Link>
        </div>
      </section>

      {/* Metric Statistics: 6-Card Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Stat 1 */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl flex flex-col justify-between hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">মোট ব্যবহারকারী</span>
            <div className="w-8 h-8 rounded-lg bg-[#63DB9A]/20 text-black border border-[#63DB9A] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {banglaNumber(totalUsers)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
              <span>+১২% গত মাসে</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl flex flex-col justify-between hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">যাচাইকৃত সদস্য</span>
            <div className="w-8 h-8 rounded-lg bg-[#E2E361]/20 text-black border border-[#E2E361] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {banglaNumber(verifiedUsers)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
              <TrendingUp className="w-3.5 h-3.5 text-black" />
              <span>+৮% বৃদ্ধি</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl flex flex-col justify-between hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">মোট সেশন</span>
            <div className="w-8 h-8 rounded-lg bg-[#63DB9A]/20 text-black border border-[#63DB9A] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {banglaNumber(totalSessions)}টি
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
              <span>+৪টি নতুন</span>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl flex flex-col justify-between hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">মোট লাইক</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF49D2]/15 text-black border border-[#FF49D2] flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {banglaNumber(totalLikes)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
              <TrendingUp className="w-3.5 h-3.5 text-black" />
              <span>+১৫.৪%</span>
            </div>
          </div>
        </div>

        {/* Stat 5 */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl flex flex-col justify-between hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">মোট মন্তব্য</span>
            <div className="w-8 h-8 rounded-lg bg-[#E2E361]/20 text-black border border-[#E2E361] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {banglaNumber(totalComments)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
              <TrendingUp className="w-3.5 h-3.5 text-black" />
              <span>+৯.২%</span>
            </div>
          </div>
        </div>

        {/* Stat 6 */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl flex flex-col justify-between hover:border-gray-300 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">সংরক্ষিত সংখ্যা</span>
            <div className="w-8 h-8 rounded-lg bg-[#63DB9A]/20 text-black border border-[#63DB9A] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {banglaNumber(totalBookmarks)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
              <span>+৫.৭%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Grid (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Growth Chart Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-base sm:text-lg font-bold font-headline text-black tracking-tight">
                  গত ৩০ দিনের সদস্য ও কার্যক্রম
                </h2>
                <p className="text-xs text-gray-500 font-normal">
                  দৈনিক সক্রিয় ব্যবহারকারী ও নতুন নিবন্ধনের তুলনামূলক গ্রাফ
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#63DB9A]/20 text-black border border-[#63DB9A] rounded-full">
                  <span className="w-2 h-2 rounded-full bg-black" />
                  <span>নতুন নিবন্ধন (+৮৪০)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E2E361]/20 text-black border border-[#E2E361] rounded-full">
                  <span className="w-2 h-2 rounded-full bg-black" />
                  <span>সক্রিয় অংশগ্রহণ (+২৩%)</span>
                </div>
              </div>
            </div>

            {/* Inline SVG Chart */}
            <div className="w-full relative overflow-hidden pt-2 pb-4">
              <svg
                className="w-full h-56 text-black overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 760 220"
              >
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#63DB9A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#63DB9A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="760"
                  y1="40"
                  y2="40"
                />
                <line
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="760"
                  y1="95"
                  y2="95"
                />
                <line
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="760"
                  y1="150"
                  y2="150"
                />
                <line stroke="#e5e7eb" strokeWidth="1" x1="0" x2="760" y1="200" y2="200" />

                {/* Area fill */}
                <path
                  d="M 0,170 C 80,165 140,140 210,120 C 280,100 350,130 420,85 C 490,40 560,70 630,45 C 690,25 730,30 760,20 L 760,200 L 0,200 Z"
                  fill="url(#primaryGradient)"
                />
                {/* Smooth Curve */}
                <path
                  d="M 0,170 C 80,165 140,140 210,120 C 280,100 350,130 420,85 C 490,40 560,70 630,45 C 690,25 730,30 760,20"
                  fill="none"
                  stroke="#63DB9A"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                {/* Secondary Curve */}
                <path
                  d="M 0,185 C 70,180 150,165 220,155 C 300,145 370,160 440,130 C 510,100 580,115 650,95 C 700,80 735,75 760,70"
                  fill="none"
                  stroke="#E2E361"
                  strokeDasharray="6 4"
                  strokeWidth="2.5"
                />
                {/* Highlight Nodes */}
                <circle className="fill-white stroke-black" cx="210" cy="120" r="4" strokeWidth="2" />
                <circle className="fill-white stroke-black" cx="420" cy="85" r="4" strokeWidth="2" />
                <circle className="fill-mint stroke-black" cx="630" cy="45" r="5" strokeWidth="2" />
                <circle className="fill-white stroke-black" cx="760" cy="20" r="4" strokeWidth="2" />
              </svg>

              {/* Bangla Time Axis */}
              <div className="flex justify-between items-center pt-3 text-gray-500 font-medium font-mono text-xs">
                <span>১ মে</span>
                <span>৬ মে</span>
                <span>১১ মে</span>
                <span>১৬ মে</span>
                <span>২১ মে</span>
                <span>২৫ মে (আজ)</span>
              </div>
            </div>
          </div>

          {/* Pending Verifications Queue */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold font-headline text-black tracking-tight">
                  যাচাইয়ের অপেক্ষায়
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF49D2]/15 text-black border border-[#FF49D2] text-xs font-bold">
                  {banglaNumber(applicants.length)} জন
                </span>
              </div>

              <Link
                href="/admin/verification"
                className="px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-black bg-white hover:bg-gray-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
              >
                <span>সব আবেদন দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="p-4 rounded-xl border border-[#e5e7eb] hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] font-bold flex items-center justify-center shrink-0 text-sm">
                      {applicant.initials}
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-black truncate">
                          {applicant.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#E2E361]/20 text-black text-[11px] font-bold border border-[#E2E361]">
                          ব্যাচ {banglaNumber(applicant.batch)}
                        </span>
                        <span className="text-xs text-gray-600 font-mono font-semibold">
                          {applicant.reg_no}
                        </span>
                        {applicant.matched ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-black" />
                            রোস্টারে মিলেছে
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF49D2]/15 text-black border border-[#FF49D2] text-[11px] font-bold">
                            মিলেনি
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-normal truncate">
                        {applicant.email} • {applicant.district} • {applicant.track}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApproveApplicant(applicant.id, applicant.name)}
                      className="px-3 py-1.5 rounded-lg bg-mint hover:bg-[#72eab0] text-black border border-mint text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>অনুমোদন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectApplicant(applicant.id, applicant.name)}
                      className="px-3 py-1.5 rounded-lg bg-[#FF49D2]/15 hover:bg-[#FF49D2]/25 text-black border border-[#FF49D2] text-xs font-bold transition-all"
                    >
                      প্রত্যাখ্যান
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Scheduled Sessions Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-black" />
                <h2 className="text-base font-bold font-headline text-black">নির্ধারিত সেশনসমূহ</h2>
              </div>
              <Link href="/admin/sessions" className="text-xs font-semibold text-black hover:underline">
                ক্যালেন্ডার
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black font-mono">সেশন ১৬১</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-[11px] font-bold">
                    লাইভ সেশন
                  </span>
                </div>
                <h3 className="text-sm font-bold text-black leading-snug">
                  টেকসই সাপ্লাই চেইন ও কোয়ালিটি কন্ট্রোল
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>আগামীকাল, সন্ধ্যা ৭:৩০ মি.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black font-mono">সেশন ১৬২</span>
                  <span className="text-[11px] text-black font-bold font-mono bg-[#E2E361]/20 px-2 py-0.5 rounded-full border border-[#E2E361]">আসন্ন</span>
                </div>
                <h3 className="text-sm font-bold text-black leading-snug">
                  ডিজিটাল বিপণন ও ব্র্যান্ডিং কৌশল
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>২৮ মে, রাত ৮:০০ টা</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Comments Moderation */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-black" />
                <h2 className="text-base font-bold font-headline text-black">সাম্প্রতিক মন্তব্য</h2>
              </div>
              <Link href="/admin/moderation" className="text-xs font-semibold text-black hover:underline">
                মডারেশন তালিকা
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black">{comment.author}</span>
                    <span className="text-[11px] text-gray-500 font-mono">{comment.time_ago}</span>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-normal">
                    &ldquo;{comment.content}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-[11px] font-semibold text-gray-700 font-mono">
                      {comment.session_title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApproveComment(comment.id)}
                        className="p-1 rounded-md bg-mint border border-mint text-black hover:bg-[#72eab0] transition-colors"
                        title="অনুমোদন করুন"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 rounded-md bg-[#FF49D2]/15 border border-[#FF49D2] text-black hover:bg-[#FF49D2]/25 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
