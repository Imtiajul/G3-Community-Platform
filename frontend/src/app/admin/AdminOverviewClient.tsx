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
  Calendar,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  Mic,
  Check,
  X,
  Radio,
  Trash2,
} from "lucide-react";

interface VerificationApplicant {
  id: number;
  name: string;
  initials: string;
  batch: number;
  reg_no: string;
  email: string;
  district: string;
  track: string;
  matched: boolean;
}

const INITIAL_APPLICANTS: VerificationApplicant[] = [
  {
    id: 1,
    name: "ফারহানা হক",
    initials: "ফা",
    batch: 24,
    reg_no: "REG-24-9872",
    email: "farhana.h@example.com",
    district: "সিলেট",
    track: "ই-কমার্স উদ্যোগ",
    matched: true,
  },
  {
    id: 2,
    name: "কাজী কামরুল হাসান",
    initials: "কা",
    batch: 25,
    reg_no: "REG-25-1102",
    email: "kamrul.hasan@example.com",
    district: "চট্টগ্রাম",
    track: "কৃষি প্রক্রিয়াজাতকরণ",
    matched: true,
  },
  {
    id: 3,
    name: "তানভীর আহমেদ",
    initials: "তা",
    batch: 24,
    reg_no: "REG-24-3419",
    email: "tanvir.ahmed@example.com",
    district: "রাজশাহী",
    track: "হস্তশিল্প ও পোশাক",
    matched: false,
  },
  {
    id: 4,
    name: "মাহমুদুল হাসান",
    initials: "মা",
    batch: 23,
    reg_no: "REG-23-8841",
    email: "mahmud.hasan@example.com",
    district: "ঢাকা",
    track: "প্রযুক্তি সেবা",
    matched: true,
  },
];

interface CommentItem {
  id: number;
  author: string;
  time_ago: string;
  content: string;
  session_title: string;
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 1,
    author: "সুমাইয়া আখতার",
    time_ago: "৫ মিনিট আগে",
    content: "আজকের সেশনটি অত্যন্ত সময়োপযোগী ছিল। স্থানীয় পর্যায়ে পণ্যের প্যাকিং উন্নত করার বিষয়ে পরিষ্কার ধারণা পেলাম।",
    session_title: "সেশন ১৬০",
  },
  {
    id: 2,
    author: "রাশেদুল করিম",
    time_ago: "১৮ মিনিট আগে",
    content: "আমি কি এই সেশনের প্রেজেন্টেশন স্লাইডগুলো সংগ্রহ করতে পারব? আমাদের দলের অন্যদের সাথে শেয়ার করতে চাই।",
    session_title: "প্রশ্নোত্তর",
  },
];

export function AdminOverviewClient() {
  const [applicants, setApplicants] = useState<VerificationApplicant[]>(INITIAL_APPLICANTS);
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);

  const handleApproveApplicant = (id: number, name: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    toast.success(`${name}-এর আবেদন সফলভাবে অনুমোদিত হয়েছে`);
  };

  const handleRejectApplicant = (id: number, name: string) => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    toast.error(`${name}-এর আবেদন প্রত্যাখ্যান করা হয়েছে`);
  };

  const handleApproveComment = (id: number) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success("মন্তব্যটি অনুমোদিত হয়েছে");
  };

  const handleDeleteComment = (id: number) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success("মন্তব্যটি মুছে ফেলা হয়েছে");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Bar / Page Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              স্বাগতম, অ্যাডমিন প্যানেল
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              লাইভ সিস্টেম
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            প্ল্যাটফর্মের সার্বিক কার্যক্রম ও সদস্য ব্যবস্থাপনার সংক্ষিপ্ত চিত্র
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border rounded-xl text-muted-foreground text-xs font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            <span>আজকের তারিখ: {formatDateBn(new Date())}</span>
          </div>
          <Link
            href="/admin/sessions/new"
            className="inline-flex items-center gap-2 bg-foreground text-background hover:opacity-95 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন সেশন প্রকাশ করুন</span>
          </Link>
        </div>
      </section>

      {/* Metric Statistics: 6-Card Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Stat 1 */}
        <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between hover:border-foreground/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">মোট ব্যবহারকারী</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
              ১২,৪৮০
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+১২% গত মাসে</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between hover:border-foreground/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">যাচাইকৃত সদস্য</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
              ৯,৪৫০
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+৮% বৃদ্ধি</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between hover:border-foreground/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">মোট সেশন</span>
            <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
              ১৬০টি
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+৪টি নতুন</span>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between hover:border-foreground/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">মোট লাইক</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
              ৪৮,৯২০
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+১৫.৪%</span>
            </div>
          </div>
        </div>

        {/* Stat 5 */}
        <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between hover:border-foreground/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">মোট মন্তব্য</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
              ১৮,৩৪০
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+৯.২%</span>
            </div>
          </div>
        </div>

        {/* Stat 6 */}
        <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between hover:border-foreground/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">সংরক্ষিত সংখ্যা</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
              ৬,২১০
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
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
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  গত ৩০ দিনের সদস্য ও কার্যক্রম
                </h2>
                <p className="text-xs text-muted-foreground">
                  দৈনিক সক্রিয় ব্যবহারকারী ও নতুন নিবন্ধনের তুলনামূলক গ্রাফ
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span className="text-muted-foreground">নতুন নিবন্ধন (+৮৪০)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">সক্রিয় অংশগ্রহণ (+২৩%)</span>
                </div>
              </div>
            </div>

            {/* Inline SVG Chart matching Stitch exactly */}
            <div className="w-full relative overflow-hidden pt-2 pb-4">
              <svg
                className="w-full h-56 text-teal-600 overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 760 220"
              >
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="760"
                  y1="40"
                  y2="40"
                />
                <line
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="760"
                  y1="95"
                  y2="95"
                />
                <line
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="760"
                  y1="150"
                  y2="150"
                />
                <line stroke="#CBD5E1" strokeWidth="1" x1="0" x2="760" y1="200" y2="200" />

                {/* Area fill */}
                <path
                  d="M 0,170 C 80,165 140,140 210,120 C 280,100 350,130 420,85 C 490,40 560,70 630,45 C 690,25 730,30 760,20 L 760,200 L 0,200 Z"
                  fill="url(#primaryGradient)"
                />
                {/* Smooth Curve */}
                <path
                  d="M 0,170 C 80,165 140,140 210,120 C 280,100 350,130 420,85 C 490,40 560,70 630,45 C 690,25 730,30 760,20"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                {/* Secondary Curve */}
                <path
                  d="M 0,185 C 70,180 150,165 220,155 C 300,145 370,160 440,130 C 510,100 580,115 650,95 C 700,80 735,75 760,70"
                  fill="none"
                  stroke="#F59E0B"
                  strokeDasharray="6 4"
                  strokeOpacity="0.8"
                  strokeWidth="2"
                />
                {/* Highlight Nodes */}
                <circle className="fill-card stroke-teal-600" cx="210" cy="120" r="4.5" strokeWidth="2" />
                <circle className="fill-card stroke-teal-600" cx="420" cy="85" r="4.5" strokeWidth="2" />
                <circle className="fill-teal-600 stroke-card" cx="630" cy="45" r="5" strokeWidth="2" />
                <circle className="fill-card stroke-teal-600" cx="760" cy="20" r="4.5" strokeWidth="2" />
              </svg>

              {/* Bangla Time Axis */}
              <div className="flex justify-between items-center pt-3 text-muted-foreground text-xs">
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
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  যাচাইয়ের অপেক্ষায়
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold">
                  {banglaNumber(applicants.length)} জন
                </span>
              </div>

              <Link
                href="/admin/verification"
                className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>সব আবেদন দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="p-4 rounded-xl border border-border hover:border-foreground/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center shrink-0 text-sm">
                      {applicant.initials}
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {applicant.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px] font-medium border border-border">
                          ব্যাচ {banglaNumber(applicant.batch)}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {applicant.reg_no}
                        </span>
                        {applicant.matched ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            রোস্টারে মিলেছে
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold">
                            মিলেনি
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {applicant.email} • {applicant.district} • {applicant.track}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApproveApplicant(applicant.id, applicant.name)}
                      className="px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-90 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>অনুমোদন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectApplicant(applicant.id, applicant.name)}
                      className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-semibold transition-colors"
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
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">নির্ধারিত সেশনসমূহ</h2>
              </div>
              <Link href="/admin/sessions" className="text-xs font-semibold text-primary hover:underline">
                ক্যালেন্ডার
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-lg bg-secondary/30 border border-border flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">সেশন ১৬১</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-semibold">
                    লাইভ সেশন
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  টেকসই সাপ্লাই চেইন ও কোয়ালিটি কন্ট্রোল
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>আগামীকাল, সন্ধ্যা ৭:৩০ মি.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-secondary/30 border border-border flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">সেশন ১৬২</span>
                  <span className="text-[11px] text-muted-foreground font-medium">আসন্ন</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  ডিজিটাল বিপণন ও ব্র্যান্ডিং কৌশল
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>২৮ মে, রাত ৮:০০ টা</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Comments Moderation */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-base font-bold text-foreground">সাম্প্রতিক মন্তব্য</h2>
              </div>
              <Link href="/admin/moderation" className="text-xs font-semibold text-primary hover:underline">
                মডারেশন তালিকা
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg bg-secondary/30 border border-border flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{comment.author}</span>
                    <span className="text-[11px] text-muted-foreground">{comment.time_ago}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    &ldquo;{comment.content}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="px-2 py-0.5 rounded bg-secondary text-[11px] font-medium text-foreground">
                      {comment.session_title}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleApproveComment(comment.id)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="অনুমোদন করুন"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"
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
