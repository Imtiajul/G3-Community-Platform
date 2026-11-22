"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Check,
  UserX,
  Search,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";

export interface ReportedComment {
  id: number;
  comment_text: string;
  author_name: string;
  author_batch: number;
  session_title: string;
  session_slug: string;
  report_reason: string;
  reported_by: string;
  report_count: number;
  created_at: string;
}

const INITIAL_REPORTED_COMMENTS: ReportedComment[] = [
  {
    id: 1,
    comment_text:
      "ঘরে বসে প্রতিদিন ২০০০ টাকা আয় করুন! কোনো অভিজ্ঞতা ছাড়াই কাজের সুযোগ পেতে এই লিংকে যোগাযোগ করুন: bit.ly/spam-link",
    author_name: "অজ্ঞাত ব্যবহারকারী",
    author_batch: 25,
    session_title: "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জনের মূলনীতি",
    session_slug: "honesty-commitment-and-customer-trust",
    report_reason: "অনাকাঙ্ক্ষিত বিজ্ঞাপন ও স্প্যাম লিংক",
    reported_by: "মাসুদ রানা (ব্যাচ ২৪) সহ আরও ৩ জন",
    report_count: 4,
    created_at: "২০ মিনিট আগে",
  },
  {
    id: 2,
    comment_text:
      "এটা কোনো কাজের কথা না, উদ্যোক্তা হতে হলে শুধু টাকা লাগে, আর কিছু না। এখানে সময় নষ্ট না করে অন্য কিছু করুন।",
    author_name: "রাকিব হাসান",
    author_batch: 24,
    session_title: "বাজার যাচাই এবং প্রথম ১০০ জন বিশ্বস্ত গ্রাহক তৈরির বাস্তব কৌশল",
    session_slug: "market-validation-and-first-100-customers",
    report_reason: "কমিউনিটি নির্দেশিকা বিরোধী ও নেতিবাচক আচরণ",
    reported_by: "নাজমুল হাসান (মডারেটর)",
    report_count: 2,
    created_at: "২ ঘন্টা আগে",
  },
  {
    id: 3,
    comment_text:
      "ভাই এই পণ্যের দাম কত? সরাসরি ইনবক্সে যোগাযোগ করুন অথবা ফোন দিন ০১৭১১-XXXXXX",
    author_name: "সাইফুল ইসলাম",
    author_batch: 23,
    session_title: "টেকসই সাপ্লাই চেইন ও কোয়ালিটি কন্ট্রোল",
    session_slug: "sustainable-supply-chain-and-quality-control",
    report_reason: "সেশনের আলোচনার সাথে অপ্রাসঙ্গিক ক্রয়-বিক্রয় বার্তা",
    reported_by: "ইকবাল বাহার",
    report_count: 1,
    created_at: "গতকাল",
  },
];

export function ModerationDeskClient() {
  const [reports, setReports] = useState<ReportedComment[]>(INITIAL_REPORTED_COMMENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = (id: number) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("মন্তব্যটি পর্যালোচনা শেষে অনুমোদন করা হয়েছে এবং রিপোর্ট খারিজ হয়েছে");
  };

  const handleDelete = (id: number) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.error("মন্তব্যটি অপসারণ করা হয়েছে");
  };

  const handleSoftBan = (id: number, author: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.warning(`${author}-কে সাময়িকভাবে মিউট করা হয়েছে`);
  };

  const filtered = reports.filter(
    (r) =>
      !searchQuery.trim() ||
      r.comment_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.report_reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-bangla">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              <span>নিরাপত্তা ও মডারেশন</span>
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              রিপোর্টকৃত মন্তব্য মডারেশন
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              {banglaNumber(reports.length)}টি পর্যালোচনা বাকি
            </span>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="মন্তব্য বা অভিযোগ খুঁজুন..."
            className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-xl text-xs placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Reports Queue */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((report) => (
            <article
              key={report.id}
              className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm hover:border-foreground/30 transition-all"
            >
              {/* Top Warning Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-rose-50/70 border border-rose-200/80 rounded-lg text-xs">
                <div className="flex items-center gap-2 text-rose-900 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>অভিযোগের ধরন: {report.report_reason}</span>
                </div>
                <div className="flex items-center gap-3 text-rose-800">
                  <span className="font-bold bg-rose-200/80 px-2 py-0.5 rounded">
                    {banglaNumber(report.report_count)}টি রিপোর্ট
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    প্রতিবেদক: {report.reported_by}
                  </span>
                </div>
              </div>

              {/* Author & Context info */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">
                    {report.author_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary border border-border font-medium text-muted-foreground">
                    ব্যাচ {banglaNumber(report.author_batch)}
                  </span>
                </div>
                <span className="text-muted-foreground flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {report.created_at}
                </span>
              </div>

              {/* Comment Content */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border text-foreground text-sm leading-relaxed font-bangla">
                &ldquo;{report.comment_text}&rdquo;
              </div>

              {/* Context Session Link & Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <span>সেশন:</span>
                  <Link
                    href={`/sessions/${report.session_slug}`}
                    className="font-semibold text-primary hover:underline truncate"
                  >
                    {report.session_title}
                  </Link>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSoftBan(report.id, report.author_name)}
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>মিউট করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(report.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছে ফেলুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(report.id)}
                    className="px-4 py-1.5 rounded-lg bg-foreground text-background hover:opacity-90 font-semibold flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>অনুমোদন ও রিপোর্ট খারিজ</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-12 border border-border flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            কোনো অমীমাংসিত রিপোর্ট নেই
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
            সকল রিপোর্টকৃত মন্তব্য পর্যালোচনা করা হয়েছে। প্ল্যাটফর্মের পরিবেশ সম্পূর্ণ পরিষ্কার ও সুশৃঙ্খল।
          </p>
        </div>
      )}
    </div>
  );
}
