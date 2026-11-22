"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Bookmark,
  BookmarkX,
  Search,
  X,
  ArrowRight,
  Mic,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export interface SavedSessionItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  batch: number;
  session_number: number;
  tag: string;
  saved_date: string;
  speaker: string;
}

const INITIAL_SAVED_SESSIONS: SavedSessionItem[] = [
  {
    id: 1,
    slug: "honesty-commitment-and-customer-trust",
    title: "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জনের মূলনীতি",
    excerpt:
      "একটি সফল উদ্যোগ শুধু মূলধন বা বিপণন কৌশলের ওপর দাঁড়িয়ে থাকে না। ব্যবসায় দীর্ঘমেয়াদে টিকে থাকার একমাত্র ভিত্তি হলো সততা ও মানবিক মূল্যবোধ। গ্রাহকের বিশ্বাস অর্জন করতে হলে প্রতিটি পদক্ষেপে স্বচ্ছতা রক্ষা করা অনিবার্য...",
    batch: 24,
    session_number: 12,
    tag: "মূল্যবোধ ও সততা",
    saved_date: "১৪ মে, ২০২৪",
    speaker: "ইকবাল বাহার জাহিদ",
  },
  {
    id: 2,
    slug: "market-validation-and-first-100-customers",
    title: "বাজার যাচাই এবং প্রথম ১০০ জন বিশ্বস্ত গ্রাহক তৈরির বাস্তব কৌশল",
    excerpt:
      "বড় বিজ্ঞাপনী বাজেট ছাড়াই সততা ও আন্তরিক সেবার মাধ্যমে প্রথম গ্রাহকদের স্থায়ী শুভানুধ্যায়ীতে রূপান্তরের কার্যকর পদ্ধতি। পণ্যের গুণগত মান নিশ্চিত করে তাদের মতামতকে প্রাধান্য দেওয়ার মাধ্যমে দীর্ঘস্থায়ী সংযোগ স্থাপন...",
    batch: 24,
    session_number: 11,
    tag: "গ্রাহক সেবা",
    saved_date: "১২ মে, ২০২৪",
    speaker: "ইকবাল বাহার জাহিদ",
  },
  {
    id: 3,
    slug: "leadership-and-team-management-crisis-decisions",
    title: "নেতৃত্ব ও টিম ম্যানেজমেন্ট: সংকটকালে সঠিক সিদ্ধান্ত গ্রহণের সাহস",
    excerpt:
      "কঠিন পরিস্থিতিতে প্রতিকূলতাকে সম্ভাবনা হিসেবে দেখা এবং দলের সদস্যদের মানসিক শক্তি ও আত্মবিশ্বাস অটুট রাখার কৌশল। একজন প্রকৃত নেতার সবচেয়ে বড় গুণ হলো যেকোনো পরিস্থিতিতে স্থির থেকে দায়িত্ব গ্রহণ করা...",
    batch: 23,
    session_number: 50,
    tag: "নেতৃত্ব",
    saved_date: "০২ মে, ২০২৪",
    speaker: "ইকবাল বাহার জাহিদ",
  },
  {
    id: 4,
    slug: "pricing-and-cashflow-management-rules",
    title: "মূল্য নির্ধারণ ও ক্যাশফ্লো ঠিক রাখার নিয়ম",
    excerpt:
      "মার্জিন ২০% এর নিচে নামানো যাবে না। কাঁচামালের ব্যাকআপ সোর্স অন্তত দুইটি প্রস্তুত রাখা জরুরি। প্রতিদিনের ক্যাশ ইন ও ক্যাশ আউট এক্সেলে রিয়েলটাইম এন্ট্রি দেওয়ার অভ্যাস চালু রাখতে হবে...",
    batch: 24,
    session_number: 8,
    tag: "ফিন্যান্স",
    saved_date: "২৮ এপ্রিল, ২০২৪",
    speaker: "ইকবাল বাহার জাহিদ",
  },
];

export function SavedListClient({
  initialSessions = INITIAL_SAVED_SESSIONS,
}: {
  initialSessions?: SavedSessionItem[];
}) {
  const [sessions, setSessions] = useState<SavedSessionItem[]>(initialSessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const handleRemoveBookmark = async (session: SavedSessionItem) => {
    // Optimistically remove
    setSessions((prev) => prev.filter((s) => s.id !== session.id));

    toast("সেশনটি তালিকা থেকে সরানো হয়েছে", {
      action: {
        label: "পূর্বাবস্থায় ফেরান",
        onClick: () => {
          setSessions((prev) => [session, ...prev]);
        },
      },
    });

    try {
      await fetch("/api/bff/interactions/bookmark", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ session_id: session.id }),
      });
    } catch {
      // Backend sync error handled gracefully
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tag.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;
    if (activeFilter === "batch-24") return s.batch === 24;
    if (activeFilter === "batch-23") return s.batch === 23;
    if (activeFilter === "important") return s.session_number >= 10;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Editorial Header & Controls */}
      <div className="flex flex-col gap-6 mb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                ব্যক্তিগত সংগ্রহশালা
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              <span className="text-xs text-muted-foreground">নোটবুক</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                সংরক্ষিত
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
                মোট {banglaNumber(sessions.length)}টি সংরক্ষিত সেশন
              </span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সংরক্ষিত সেশন খুঁজুন..."
              className="w-full h-10 pl-10 pr-9 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="অনুসন্ধান মুছুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeFilter === "all"
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-secondary border-border"
              }`}
            >
              সব ({banglaNumber(sessions.length)})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("batch-24")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeFilter === "batch-24"
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-secondary border-border"
              }`}
            >
              ব্যাচ ২৪
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("batch-23")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeFilter === "batch-23"
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-secondary border-border"
              }`}
            >
              ব্যাচ ২৩
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("important")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeFilter === "important"
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-secondary border-border"
              }`}
            >
              গুরুত্বপূর্ণ
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>সর্বশেষ সংরক্ষিত আগে</span>
          </div>
        </div>
      </div>

      {/* Cards List or Empty State */}
      {filteredSessions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredSessions.map((session) => (
            <article
              key={session.id}
              className="group bg-card rounded-xl p-6 border border-border transition-all relative flex flex-col gap-4 hover:border-foreground/30 shadow-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
                    ব্যাচ {banglaNumber(session.batch)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                    সেশন {banglaNumber(session.session_number)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
                    {session.tag}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveBookmark(session)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive px-2.5 py-1 rounded-lg transition-all text-xs font-medium"
                  title="সংরক্ষণ বাতিল করুন"
                >
                  <BookmarkX className="w-4 h-4 text-rose-500" />
                  <span className="hidden sm:inline">বুকমার্ক সরান</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Link href={`/sessions/${session.slug}`}>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors cursor-pointer leading-snug">
                    {session.title}
                  </h2>
                </Link>
                <p className="text-[15px] sm:text-[16px] text-muted-foreground leading-relaxed">
                  {session.excerpt}
                </p>
              </div>

              <div className="pt-3 mt-1 flex items-center justify-between flex-wrap gap-3 bg-secondary/50 px-4 py-2.5 rounded-lg border border-border">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Bookmark className="w-3.5 h-3.5 text-primary" />
                    <span>সংরক্ষিত: {session.saved_date}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">পরামর্শক:</span>
                    <span className="font-semibold">{session.speaker}</span>
                  </div>
                </div>

                <Link
                  href={`/sessions/${session.slug}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-semibold transition-all group-hover:translate-x-0.5"
                >
                  <span>সেশন পড়ুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-10 md:p-14 border border-border flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Bookmark className="w-8 h-8 text-emerald-700" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            কোনো সংরক্ষিত সেশন নেই
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            পছন্দের সেশনগুলো পরে পড়ার জন্য বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন। প্রয়োজনীয় দিকনির্দেশনা ও নোটস আপনার হাতের কাছেই সাজানো থাকবে।
          </p>
          <Link
            href="/sessions"
            className="h-10 px-5 rounded-xl text-sm font-semibold border border-border bg-foreground text-background hover:opacity-95 transition-all inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>সেশন দেখুন</span>
          </Link>
        </div>
      )}
    </div>
  );
}
