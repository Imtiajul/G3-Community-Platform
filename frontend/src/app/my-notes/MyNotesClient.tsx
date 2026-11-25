"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  FileText,
  Search,
  BookOpen,
  Pin,
  Trash2,
  Copy,
  Check,
  CheckCheck,
  Lock,
  ArrowRight,
  Edit,
  Quote,
  Lightbulb,
  Plus,
  Bold,
  Italic,
  List,
  CheckSquare,
} from "lucide-react";

export interface SessionNoteItem {
  id: number | string;
  session_id?: number | string;
  slug: string;
  session_title: string;
  batch?: number;
  session_number: number;
  content: string;
  updated_at: string;
  tags?: string[];
  is_pinned?: boolean;
}

const INITIAL_SESSION_NOTES: SessionNoteItem[] = [
  {
    id: 1,
    session_id: 12,
    slug: "honesty-commitment-and-customer-trust",
    session_title: "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জন",
    batch: 24,
    session_number: 12,
    content:
      "সততার সাথে প্রতিশ্রুতি রক্ষার বিষয়টি আমাদের টিম মিটিংয়ে আলোচনা করতে হবে। বিশেষ করে সাপ্লাই চেইন ডেলিভারি টাইমিং নিয়ে কোনো অবহেলা নয়। ইকবাল বাহার স্যারের মূল বার্তা: 'কথা দিয়ে কথা রাখা হলো উদ্যোক্তার সবচেয়ে বড় মূলধন।'",
    updated_at: "আজ, সকাল ১০:৪৫",
    tags: ["নৈতিকতা", "কাস্টমার_রিলেশন", "অ্যাকশন_প্ল্যান"],
    is_pinned: true,
  },
  {
    id: 2,
    session_id: 11,
    slug: "market-validation-and-first-100-customers",
    session_title: "বাজার যাচাই এবং প্রথম ১০০ জন বিশ্বস্ত গ্রাহক তৈরি",
    batch: 24,
    session_number: 11,
    content:
      "প্রথম ২০ জন গ্রাহককে সরাসরি ফোন করে ফিডব্যাক নেওয়ার পরিকল্পনা করতে হবে। লয়ালটি বোনাস অফার করা যেতে পারে। প্রোডাক্টের ত্রুটি লুকিয়ে না রেখে গ্রাহকের কাছ থেকে পরামর্শ হিসেবে নেওয়া শিখতে হবে।",
    updated_at: "গতকাল",
    tags: ["মার্কেট_রিসার্চ", "লয়ালটি"],
    is_pinned: false,
  },
  {
    id: 3,
    session_id: 8,
    slug: "pricing-and-cashflow-management-rules",
    session_title: "মূল্য নির্ধারণ ও ক্যাশফ্লো ঠিক রাখার নিয়ম",
    batch: 24,
    session_number: 8,
    content:
      "মার্জিন ২০% এর নিচে নামানো যাবে না। কাঁচামালের ব্যাকআপ সোর্স অন্তত দুইটি প্রস্তুত রাখা জরুরি। প্রতিদিনের ক্যাশ ইন ও ক্যাশ আউট এক্সেলে রিয়েলটাইম এন্ট্রি দেওয়ার অভ্যাস চালু রাখতে হবে।",
    updated_at: "০৫ মে, ২০২৪",
    tags: ["ফিন্যান্স", "ক্যাশফ্লো"],
    is_pinned: false,
  },
  {
    id: 4,
    session_id: 5,
    slug: "effective-networking-and-communication",
    session_title: "কার্যকর নেটওয়ার্কিং এবং বিনয়ী যোগাযোগ কৌশল",
    batch: 24,
    session_number: 5,
    content:
      "শুধুমাত্র প্রয়োজনের সময় কারও সাথে যোগাযোগ না করে, নিঃস্বার্থভাবে সম্পর্ক রক্ষা করতে হবে। সামাজিক মাধ্যমে অন্যের সাফল্যে সাধুবাদ জানানো এবং ইতিবাচক মন্তব্য করা একজন ভালো মানুষের পরিচয়।",
    updated_at: "২৮ এপ্রিল, ২০২৪",
    tags: ["নেটওয়ার্কিং", "বিনয়"],
    is_pinned: false,
  },
];

export function MyNotesClient({
  initialSessionNotes,
  initialGeneralNote,
}: {
  initialSessionNotes?: SessionNoteItem[];
  initialGeneralNote?: string;
}) {
  const [activeTab, setActiveTab] = useState<"sessions" | "general">("sessions");
  const [sessionNotes, setSessionNotes] = useState<SessionNoteItem[]>(
    initialSessionNotes && initialSessionNotes.length > 0
      ? initialSessionNotes
      : INITIAL_SESSION_NOTES
  );
  const [generalNote, setGeneralNote] = useState(
    initialGeneralNote ||
      "আমার লক্ষ্য: প্রতিদিন অন্তত একটি নতুন ধারণা বাস্তবায়নের পদক্ষেপ নেব।\nগ্রাহকদের সমস্যা সমাধানে আরো বেশি সক্রিয় হব। সততার সাথে ব্যবসা পরিচালনা করব এবং কখনোই মূল্যবোধ বিসর্জন দেব না।"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"recent" | "asc" | "desc">("recent");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState("আজ, সকাল ১১:১৫");

  const handleTogglePin = (id: number | string) => {
    setSessionNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, is_pinned: !note.is_pinned } : note
      )
    );
    toast.success("নোটের পিন স্ট্যাটাস পরিবর্তন হয়েছে");
  };

  const handleDeleteSessionNote = (id: number | string) => {
    const noteToDelete = sessionNotes.find((n) => n.id === id);
    setSessionNotes((prev) => prev.filter((n) => n.id !== id));

    toast("নোটটি মুছে ফেলা হয়েছে", {
      action: {
        label: "ফেরান",
        onClick: () => {
          if (noteToDelete) {
            setSessionNotes((prev) => [noteToDelete, ...prev]);
          }
        },
      },
    });
  };

  const handleSaveGeneralNote = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/bff/interactions/personal-note", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ content: generalNote }),
      });
      setLastSavedTime("এইমাত্র");
      toast.success("সাধারণ নোটটি সফলভাবে সংরক্ষিত হয়েছে");
    } catch {
      toast.error("নোট সংরক্ষণ করতে সমস্যা হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyGeneralNote = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(generalNote);
      toast.success("নোটটি ক্লিপবোর্ডে কপি করা হয়েছে");
    }
  };

  const filteredNotes = sessionNotes
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.session_title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    })
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      if (sortOption === "asc") return a.session_number - b.session_number;
      if (sortOption === "desc") return b.session_number - a.session_number;
      return String(b.id).localeCompare(String(a.id));
    });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#E2E361]/20 border border-[#E2E361] text-black text-xs font-bold">
              <FileText className="w-4 h-4 text-black" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-mono">
              গোপনীয় নোটবুক // PRIVATE NOTES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight font-headline">
            আমার ব্যক্তিগত নোট
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl font-normal">
            সেশনের গুরুত্বপূর্ণ অংশ এবং আপনার নিজস্ব চিন্তাভাবনা লিখে রাখার গোপনীয় ডায়েরি।
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white border border-[#e5e7eb] px-4 py-2.5 rounded-xl self-start md:self-auto">
          <div className="flex flex-col text-right">
            <span className="text-xs text-gray-500 font-mono">মোট সংরক্ষিত নোট</span>
            <span className="text-xs font-bold text-black leading-tight px-2 py-0.5 rounded-full bg-[#E2E361]/20 border border-[#E2E361] font-mono mt-0.5">
              ০৫টি বিষয়
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#63DB9A]/20 border border-[#63DB9A] text-black flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-black" />
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto" role="tablist">
          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial border ${
              activeTab === "sessions"
                ? "bg-mint text-black border-mint"
                : "bg-white text-gray-600 hover:text-black border-[#e5e7eb]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>সেশনের নোট ({banglaNumber(sessionNotes.length)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial border ${
              activeTab === "general"
                ? "bg-mint text-black border-mint"
                : "bg-white text-gray-600 hover:text-black border-[#e5e7eb]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>সাধারণ নোট (১)</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 px-1.5">
          <div className="hidden sm:flex items-center gap-2 pr-2 text-xs text-gray-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-mint" />
            <span>সিঙ্ক করা সম্পন্ন</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-mint border border-mint text-black text-xs font-bold hover:bg-[#72eab0] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন নোট</span>
          </button>
        </div>
      </div>

      {/* SESSIONS VIEW */}
      {activeTab === "sessions" && (
        <section className="flex flex-col gap-6">
          {/* Search, Filter & Quick Count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#e5e7eb] p-3 rounded-xl">
            <div className="relative w-full sm:max-w-xs flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নোট খুঁজুন (যেমন: সততা, গ্রাহক)..."
                className="w-full h-10 pl-9 pr-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-xs text-black placeholder:text-gray-400 focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-mono font-bold text-gray-500 px-2">সাজান:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as "recent" | "asc" | "desc")}
                aria-label="নোট সাজানোর ধরন"
                className="h-10 px-3 bg-white border border-[#e5e7eb] text-black rounded-lg text-xs focus:outline-none focus:border-mint cursor-pointer font-semibold"
              >
                <option value="recent">সর্বশেষ সম্পাদিত</option>
                <option value="asc">সেশন নম্বর (ছোট থেকে বড়)</option>
                <option value="desc">সেশন নম্বর (বড় থেকে ছোট)</option>
              </select>
            </div>
          </div>

          {/* Note Cards List */}
          {filteredNotes.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className={`bg-white border border-[#e5e7eb] rounded-xl p-5 md:p-6 transition-all flex flex-col gap-3 group hover:border-gray-300 hover:-translate-y-0.5 ${
                    note.is_pinned ? "bg-[#63DB9A]/5 border-mint/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] font-mono font-bold text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        সেশন {banglaNumber(note.session_number)} • ব্যাচ {banglaNumber(note.batch || 24)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-mono">
                        সম্পাদনা: {note.updated_at}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(note.id)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                          note.is_pinned
                            ? "text-black bg-mint border-mint"
                            : "text-gray-400 hover:text-black hover:bg-gray-100 border-[#e5e7eb] bg-white"
                        }`}
                        title={note.is_pinned ? "পিন সরান" : "পিন করুন"}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSessionNote(note.id)}
                        className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-gray-400 hover:text-black hover:bg-[#FF49D2]/15 bg-white transition-all"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-black group-hover:underline transition-colors leading-snug font-headline">
                      {note.session_title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed font-normal">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {note.tags &&
                      note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-[#f9fafb] text-gray-700 text-xs font-mono font-medium border border-[#e5e7eb]"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>

                  <div className="pt-3 mt-1 flex items-center justify-between border-t border-[#e5e7eb]">
                    <Link
                      href={`/sessions/${note.slug}`}
                      className="inline-flex items-center gap-1.5 text-black hover:underline text-xs font-bold transition-colors"
                    >
                      <span>সেশনে যান ও পূর্ণ নোট দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href={`/sessions/${note.slug}#notes`}
                      className="inline-flex items-center gap-1 text-black hover:bg-gray-50 text-xs px-2.5 py-1 rounded-lg border border-[#e5e7eb] bg-white transition-all font-semibold"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>সম্পাদনা</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-[#e5e7eb]">
              <BookOpen className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-base font-bold text-black font-headline">কোনো নোট খুঁজে পাওয়া যায়নি</p>
              <p className="text-xs text-gray-500 mt-1">
                অন্য কোনো শব্দ দিয়ে অনুসন্ধান করে দেখুন।
              </p>
            </div>
          )}

          {/* Editorial Quote Banner */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e7eb] relative overflow-hidden flex flex-col md:flex-row items-center gap-5 mt-2">
            <div className="w-12 h-12 rounded-xl bg-[#E2E361]/20 text-black flex items-center justify-center shrink-0 border border-[#E2E361]">
              <Quote className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm sm:text-base text-gray-700 italic leading-relaxed">
                &ldquo;শেখার পর তা লিখে রাখা এবং প্রয়োগ করাই একজন ভালো উদ্যোক্তা হওয়ার প্রথম ভিত্তি।
                জ্ঞান যখন আচরণে রূপ নেয়, তখনই সাফল্য আসে।&rdquo;
              </p>
              <span className="text-xs text-black font-bold mt-1 block font-mono">
                — ইকবাল বাহার জাহিদ
              </span>
            </div>
          </div>
        </section>
      )}

      {/* GENERAL NOTE VIEW */}
      {activeTab === "general" && (
        <section className="flex flex-col gap-6">
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 md:p-8 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e5e7eb]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-mint" />
                  <h2 className="text-lg font-extrabold text-black font-headline">
                    সাধারণ নোট (দৈনিক চিন্তাভাবনা ও লক্ষ্য)
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  আপনার ব্যক্তিগত ভাবনা, ব্যবসায়িক প্ল্যান ও দৈনন্দিন লক্ষ্যগুলো এখানে মুক্তভাবে লিখুন।
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f9fafb] border border-[#e5e7eb] text-gray-700 text-xs self-start sm:self-auto font-mono font-medium">
                <Lock className="w-3.5 h-3.5 text-gray-500" />
                <span>🔒 শুধু আপনি দেখতে পারবেন</span>
              </span>
            </div>

            {/* Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-xs font-mono">
              <div className="flex items-center gap-2 text-black font-semibold">
                <CheckCheck className="w-4 h-4 text-mint" />
                <span>
                  {isSaving
                    ? "সংরক্ষণ করা হচ্ছে..."
                    : `স্বয়ংক্রিয়ভাবে সংরক্ষিত (${lastSavedTime})`}
                </span>
              </div>
              <div className="text-gray-600 font-medium">
                {banglaNumber(generalNote.length)} / {banglaNumber(5000)} অক্ষর
              </div>
            </div>

            {/* Quick Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-black">
              <button
                type="button"
                onClick={() => setGeneralNote((prev) => prev + " **বোল্ড টেক্সট** ")}
                className="w-8 h-8 rounded border border-transparent hover:border-[#e5e7eb] hover:bg-white flex items-center justify-center transition-all"
                title="বোল্ড"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGeneralNote((prev) => prev + " *ইটালিক টেক্সট* ")}
                className="w-8 h-8 rounded border border-transparent hover:border-[#e5e7eb] hover:bg-white flex items-center justify-center transition-all"
                title="ইটালিক"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGeneralNote((prev) => prev + "\n- তালিকা আইটেম")}
                className="w-8 h-8 rounded border border-transparent hover:border-[#e5e7eb] hover:bg-white flex items-center justify-center transition-all"
                title="তালিকা"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGeneralNote((prev) => prev + "\n> উদ্ধৃতি")}
                className="w-8 h-8 rounded border border-transparent hover:border-[#e5e7eb] hover:bg-white flex items-center justify-center transition-all"
                title="উদ্ধৃতি"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGeneralNote((prev) => prev + "\n- [ ] কাজ")}
                className="w-8 h-8 rounded border border-transparent hover:border-[#e5e7eb] hover:bg-white flex items-center justify-center transition-all"
                title="চেকলিস্ট"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <span className="text-[11px] text-gray-500 px-2 hidden sm:inline font-mono">
                স্বয়ংক্রিয় ড্রাফট সক্রিয়
              </span>
            </div>

            {/* Note Textarea */}
            <div className="relative w-full">
              <textarea
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                placeholder="আপনার মনের কথা, আগামীকালের লক্ষ্য বা ব্যবসায়িক পরিকল্পনা লিখুন..."
                rows={10}
                className="w-full p-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-black placeholder:text-gray-400 focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white leading-relaxed transition-all resize-y text-sm sm:text-base font-bangla"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("আপনি কি নিশ্চিতভাবে এই সাধারণ নোটটি মুছে ফেলতে চান?")) {
                    setGeneralNote("");
                    toast.success("নোট পরিষ্কার করা হয়েছে");
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 text-gray-600 hover:text-black hover:bg-[#FF49D2]/15 px-3.5 py-2 rounded-lg border border-[#e5e7eb] bg-white text-xs font-semibold transition-all self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>মুছে ফেলুন</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyGeneralNote}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#e5e7eb] text-black hover:bg-gray-50 text-xs font-semibold transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>কপি করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveGeneralNote}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-mint border border-mint text-black hover:bg-[#72eab0] text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? "সংরক্ষিত হচ্ছে..." : "নোট সেভ করুন"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Reflection Prompt Card */}
          <div className="bg-white border border-[#e5e7eb] p-6 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E2E361]/20 text-black flex items-center justify-center shrink-0 border border-[#E2E361]">
              <Lightbulb className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-black font-headline">সাপ্তাহিক আত্মসমীক্ষা প্রশ্ন</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed font-normal">
                &ldquo;এই সপ্তাহে আমি এমন কী কাজ করেছি যা একজন ভালো মানুষ এবং বিশ্বাসযোগ্য উদ্যোক্তা হিসেবে আমাকে এক ধাপ এগিয়ে নিয়েছে?&rdquo; — এই প্রশ্নের উত্তরটি সাধারণ নোটে টুকে রাখতে পারেন।
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
