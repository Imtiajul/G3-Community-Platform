"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Search,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  FileEdit,
  Heart,
  MessageSquare,
  Edit,
  Copy,
  Trash2,
  FilterX,
  ChevronDown,
} from "lucide-react";

export interface SessionRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  batch: number;
  session_number: number;
  date_formatted: string;
  time_formatted: string;
  status: "published" | "scheduled" | "draft";
  likes_count: number;
  comments_count: number;
}

const INITIAL_SESSIONS: SessionRow[] = [
  {
    id: 1,
    slug: "honesty-commitment-and-customer-trust",
    title: "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জনের মূলনীতি",
    excerpt: "মূল্যবোধ ও নৈতিক ব্যবসার মাধ্যমে দীর্ঘমেয়াদে গ্রাহকের সন্তুষ্টি বজায় রাখার বাস্তবিক রূপরেখা।",
    batch: 24,
    session_number: 161,
    date_formatted: "২৬ মে, ২০২৪",
    time_formatted: "সন্ধ্যা ৭:০০ মি.",
    status: "published",
    likes_count: 124,
    comments_count: 48,
  },
  {
    id: 2,
    slug: "sustainable-supply-chain-and-quality-control",
    title: "টেকসই সাপ্লাই চেইন ও কোয়ালিটি কন্ট্রোল",
    excerpt: "কাঁচামাল সংগ্রহ, পরিবহন লজিস্টিকস এবং পণ্যের মান নিয়ন্ত্রণের কার্যকর কৌশলপত্র।",
    batch: 24,
    session_number: 162,
    date_formatted: "২৭ মে, ২০২৪",
    time_formatted: "সন্ধ্যা ৭:৩০ মি.",
    status: "scheduled",
    likes_count: 0,
    comments_count: 0,
  },
  {
    id: 3,
    slug: "digital-marketing-zero-capital",
    title: "ডিজিটাল বিপণন ও ব্র্যান্ডিং কৌশল: শূন্য পুঁজিতে প্রচার",
    excerpt: "সোশ্যাল মিডিয়া অর্গানিক রিচ বৃদ্ধি ও দেশীয় গ্রাহক সম্পৃক্ততার বাস্তবমুখী রূপরেখা।",
    batch: 24,
    session_number: 163,
    date_formatted: "২৫ মে, ২০২৪",
    time_formatted: "দুপুর ২:১৫ মি.",
    status: "draft",
    likes_count: 0,
    comments_count: 0,
  },
  {
    id: 4,
    slug: "market-validation-and-first-100-customers",
    title: "বাজার যাচাই এবং প্রথম ১০০ জন বিশ্বস্ত গ্রাহক তৈরির বাস্তব কৌশল",
    excerpt: "পাইলট সেলস পরিচালনা এবং পণ্য ফিডব্যাকের ভিত্তিতে উন্নয়ন প্রক্রিয়ার ধাপসমূহ।",
    batch: 24,
    session_number: 160,
    date_formatted: "২৩ মে, ২০২৪",
    time_formatted: "রাত ৮:০০ মি.",
    status: "published",
    likes_count: 320,
    comments_count: 76,
  },
  {
    id: 5,
    slug: "effective-cashflow-and-financial-discipline",
    title: "কার্যকর ক্যাশফ্লো ও আর্থিক শৃঙ্খলা রক্ষা করার উপায়",
    excerpt: "ক্ষুদ্র উদ্যোগে ব্যক্তিগত ও ব্যবসায়িক তহবিল পৃথক রাখা এবং মুনাফা পুনর্বিনিয়োগ।",
    batch: 24,
    session_number: 159,
    date_formatted: "২০ মে, ২০২৪",
    time_formatted: "সন্ধ্যা ৭:৩০ মি.",
    status: "published",
    likes_count: 210,
    comments_count: 42,
  },
];

export function SessionsManagerClient() {
  const [sessions, setSessions] = useState<SessionRow[]>(INITIAL_SESSIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleDuplicate = (session: SessionRow) => {
    const newSession: SessionRow = {
      ...session,
      id: Date.now(),
      title: `${session.title} (কপি)`,
      slug: `${session.slug}-copy`,
      status: "draft",
      session_number: session.session_number + 1,
      likes_count: 0,
      comments_count: 0,
    };
    setSessions((prev) => [newSession, ...prev]);
    toast.success("সেশনটি অনুলিপি করা হয়েছে");
  };

  const handleDelete = (id: number) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    toast.success("সেশনটি মুছে ফেলা হয়েছে");
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSessions.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = "ID,SessionNo,Batch,Title,Status,Likes,Comments\n";
    const rows = sessions
      .map(
        (s) =>
          `"${s.id}","${s.session_number}","${s.batch}","${s.title}","${s.status}","${s.likes_count}","${s.comments_count}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("সেশন তালিকা CSV ডাউনলোড সম্পন্ন");
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch =
      batchFilter === "all" || s.batch.toString() === batchFilter;

    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesBatch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Ambient Subtlety & Action Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              সেশনসমূহ
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
              মোট {banglaNumber(sessions.length)}টি সেশন
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            কমিউনিটির শিক্ষণ সেশনসমূহ পরিচালনা, সম্পাদনা, প্রকাশনা ক্যালেন্ডার ও শিক্ষার্থী সংশ্লিষ্টতা পর্যবেক্ষণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card hover:bg-secondary text-foreground text-xs font-semibold transition-all border border-border shadow-sm"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>এক্সপোর্ট (CSV)</span>
          </button>
          <Link
            href="/admin/sessions/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-95 text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন সেশন লিখুন</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">সক্রিয় ও প্রকাশিত</span>
            <span className="text-xl font-bold text-foreground mt-1">১৫২টি</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              ৯৫% সমাপ্তি হার
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">শিডিউলকৃত সেশন</span>
            <span className="text-xl font-bold text-foreground mt-1">৫টি</span>
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-0.5 mt-0.5">
              আগামী ৩ দিনে
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">খসড়া সংরক্ষিত</span>
            <span className="text-xl font-bold text-foreground mt-1">৩টি</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">অসম্পূর্ণ কনটেন্ট</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center">
            <FileEdit className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">মোট মিথস্ক্রিয়া (মাসিক)</span>
            <span className="text-xl font-bold text-foreground mt-1">৪৮,৩২০</span>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
              লাইক ও প্রতিক্রিয়া
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-card rounded-2xl p-4 border border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="সেশন শিরোনাম, সারসংক্ষেপ বা কি-ওয়ার্ড দিয়ে খুঁজুন..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/40 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:bg-card focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            aria-label="ব্যাচ নির্বাচন"
            className="h-10 px-3.5 rounded-xl bg-card border border-border text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="all">সব ব্যাচ (সকল)</option>
            <option value="24">ব্যাচ ২৪ (চলমান)</option>
            <option value="23">ব্যাচ ২৩</option>
            <option value="22">ব্যাচ ২২</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="স্ট্যাটাস নির্বাচন"
            className="h-10 px-3.5 rounded-xl bg-card border border-border text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="published">প্রকাশিত (Published)</option>
            <option value="scheduled">শিডিউলকৃত (Scheduled)</option>
            <option value="draft">খসড়া (Draft)</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setBatchFilter("all");
              setStatusFilter("all");
            }}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
            title="ফিল্টার রিসেট করুন"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Contextual) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs font-medium">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">
              {banglaNumber(selectedIds.length)}টি সেশন নির্বাচিত
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSessions((prev) =>
                  prev.filter((s) => !selectedIds.includes(s.id))
                );
                setSelectedIds([]);
                toast.success("নির্বাচিত সেশনগুলো মুছে ফেলা হয়েছে");
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>মুছুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Sessions Data Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground text-xs font-semibold border-b border-border select-none">
                <th className="py-3.5 pl-5 pr-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredSessions.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="সব নির্বাচন করুন"
                    className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-semibold">শিরোনাম ও সারসংক্ষেপ</th>
                <th className="py-3.5 px-3 font-semibold text-center whitespace-nowrap">ব্যাচ</th>
                <th className="py-3.5 px-3 font-semibold text-center whitespace-nowrap">সেশন নং</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">তারিখ / সময়সূচী</th>
                <th className="py-3.5 px-4 font-semibold text-center whitespace-nowrap">স্ট্যাটাস</th>
                <th className="py-3.5 px-3 font-semibold text-center whitespace-nowrap">লাইক</th>
                <th className="py-3.5 px-3 font-semibold text-center whitespace-nowrap">মন্তব্য</th>
                <th className="py-3.5 pl-3 pr-5 font-semibold text-right whitespace-nowrap">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="py-4 pl-5 pr-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(session.id)}
                      onChange={() => toggleSelectOne(session.id)}
                      aria-label={`${session.title} নির্বাচন করুন`}
                      className="w-4 h-4 rounded accent-teal-600 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col min-w-[280px] max-w-md">
                      <Link
                        href={`/admin/sessions/${session.slug}/edit`}
                        className="font-bold text-foreground hover:text-primary transition-colors text-sm line-clamp-1"
                      >
                        {session.title}
                      </Link>
                      <span className="text-muted-foreground line-clamp-1 mt-0.5 text-xs">
                        {session.excerpt}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-medium border border-border">
                      ব্যাচ {banglaNumber(session.batch)}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center whitespace-nowrap font-bold text-foreground">
                    সেশন {banglaNumber(session.session_number)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {session.date_formatted}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {session.time_formatted}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {session.status === "published" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        প্রকাশিত
                      </span>
                    )}
                    {session.status === "scheduled" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        শিডিউলকৃত
                      </span>
                    )}
                    {session.status === "draft" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border font-semibold">
                        খসড়া
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-center whitespace-nowrap text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>{banglaNumber(session.likes_count)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center whitespace-nowrap text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>{banglaNumber(session.comments_count)}</span>
                    </div>
                  </td>
                  <td className="py-4 pl-3 pr-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/sessions/${session.slug}/edit`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="সম্পাদনা"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(session)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="অনুলিপি (Duplicate)"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(session.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
