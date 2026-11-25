"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  Calendar,
  Clock,
  Mic,
  Plus,
  X,
  Image as ImageIcon,
  Link2,
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  Code,
  Minus,
  Save,
  Radio,
  FileCheck,
} from "lucide-react";

export interface SessionFormData {
  id?: number;
  slug?: string;
  title: string;
  content: string;
  batch: number;
  session_number: number;
  status: "draft" | "scheduled" | "published";
  scheduled_date: string;
  scheduled_time: string;
  tags: string[];
  is_featured: boolean;
  visibility: "public" | "members_only";
  seo_title: string;
  meta_description: string;
}

interface Props {
  initialData?: SessionFormData;
  isEditMode?: boolean;
}

const DEFAULT_INITIAL_DATA: SessionFormData = {
  title: "সততা, ধৈর্য এবং মূল্যবোধের উপর প্রতিষ্ঠিত দীর্ঘস্থায়ী ব্যবসায়িক মডেল",
  content: `প্রিয় উদ্যোক্তা ভাই ও বোনেরা,

আজকের ১৬২তম সেশনের মূল প্রতিপাদ্য হলো—"ব্যবসার দীর্ঘমেয়াদি স্থায়িত্ব এবং মানবিক মূল্যবোধের সংমিশ্রণ"।

একটি প্রতিষ্ঠান শুধু মুনাফা অর্জনের মাধ্যম নয়; এটি মানুষের বিশ্বাস ও আস্থার প্রতীক। আমরা যখন কোনো উদ্যোগ শুরু করি, তখন প্রাথমিক পর্যায়ে টিকে থাকাটাই প্রধান চ্যালেঞ্জ হয়ে দাঁড়ায়। কিন্তু সেই টিকে থাকার লড়াইয়ে অনেকেই আপস করে ফেলেন সততা এবং সেবার মানের সাথে।

### মূল শিক্ষণীয় বিষয়সমূহ:
১. পণ্যের কোয়ালিটি কন্ট্রোল কখনোই পরিস্থিতির চাপে নামিয়ে আনবেন না।
২. সরবরাহকারী এবং ক্রেতার সাথে স্বচ্ছ যোগাযোগ রক্ষা করা।
৩. সাময়িক লাভের চেয়ে গ্রাহকের সন্তুষ্টিকে দীর্ঘমেয়াদে প্রাধান্য দেওয়া।

মনে রাখবেন, বড় উদ্যোক্তা হওয়ার আগে একজন ভালো মানুষ হওয়া জরুরি। আপনার কর্মপরিকল্পনা এমন হওয়া চাই যেন তা সমাজ ও দেশের অর্থনীতিতে ইতিবাচক প্রভাব ফেলে।`,
  batch: 24,
  session_number: 162,
  status: "draft",
  scheduled_date: "২০২৪-০৫-২৮",
  scheduled_time: "২০:০০",
  tags: ["ব্যবসায়িক সততা", "সাপ্লাই চেইন", "কোয়ালিটি কন্ট্রোল"],
  is_featured: true,
  visibility: "public",
  seo_title: "ব্যবসায়িক সততা ও মূল্যবোধ - সেশন ১৬২ | নিজের বলার মতো একটা গল্প",
  meta_description:
    "উদ্যোক্তা জীবনের দীর্ঘস্থায়ী সাফল্যের মূল চালিকাশক্তি হলো সততা এবং মূল্যবোধ। ইকবাল বাহার জাহিদের তত্ত্বাবধানে পরিচালিত সেশন ১৬২ এর বিস্তারিত পাঠ।",
};

export function SessionEditorForm({
  initialData = DEFAULT_INITIAL_DATA,
  isEditMode = false,
}: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<SessionFormData>(initialData);
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [newTagInput, setNewTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Word & character stats
  const charCount = formData.content.length;
  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 120));

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success("খসড়া সফলভাবে সংরক্ষণ করা হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      toast.error("দয়া করে সেশনের শিরোনাম লিখুন");
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success(
        formData.status === "scheduled"
          ? "সেশন সফলভাবে শিডিউল করা হয়েছে"
          : "সেশন সফলভাবে প্রকাশিত হয়েছে!"
      );
      router.push("/admin/sessions");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-24 font-bangla">
      {/* Top Breadcrumb & Status Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/sessions"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>সেশন তালিকায় ফিরুন</span>
          </Link>
          <span className="text-gray-300">/</span>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#63DB9A]/20 text-black text-xs font-mono font-bold border border-[#63DB9A]">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span>
              {isEditMode
                ? `সেশন সম্পাদনা: সেশন ${banglaNumber(formData.session_number)}`
                : "নতুন সেশন রচনা"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-gray-600 font-mono text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-mint" />
            <span>স্বয়ংক্রিয় ড্রাফট সক্রিয়</span>
          </div>
          <button
            type="button"
            onClick={() => setEditorTab((prev) => (prev === "write" ? "preview" : "write"))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] bg-white text-xs font-mono font-semibold text-gray-700 hover:text-black hover:bg-gray-50 transition-all"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>{editorTab === "write" ? "লাইভ ভিউ" : "এডিটরে ফিরুন"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Editor & Content (8 cols) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          {/* Session Title Card */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-2">
            <label
              htmlFor="session-title-input"
              className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between"
            >
              <span>
                সেশন শিরোনাম <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-gray-500 font-bangla">
                বাংলা ইউনিকোড সমর্থিত
              </span>
            </label>
            <input
              id="session-title-input"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="সেশনের স্পষ্ট ও অনুপ্রেরণামূলক শিরোনাম লিখুন..."
              className="w-full bg-transparent text-xl sm:text-2xl font-bold text-black placeholder:text-gray-300 outline-none leading-snug py-1 font-headline"
            />
            <div className="flex items-center gap-2 text-gray-500 text-xs font-mono pt-1">
              <span className="font-semibold text-black">স্থায়ী লিংক:</span>
              <span className="text-gray-700 font-normal truncate">
                /sessions/batch-{formData.batch}/session-{formData.session_number}
              </span>
            </div>
          </div>

          {/* Markdown Workspace */}
          <div className="rounded-xl bg-white border border-[#e5e7eb] overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center p-1 bg-white border border-[#e5e7eb] rounded-lg text-xs font-mono font-semibold">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    editorTab === "write"
                      ? "bg-mint text-black font-bold"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  লিখুন (Write)
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    editorTab === "preview"
                      ? "bg-mint text-black font-bold"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  প্রিভিউ (Preview)
                </button>
              </div>

              {/* Formatting buttons */}
              {editorTab === "write" && (
                <div className="flex items-center flex-wrap gap-1 text-black">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + " **বোল্ড টেক্সট** " }))
                    }
                    className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="বোল্ড"
                  >
                    <Bold className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + " *ইটালিক টেক্সট* " }))
                    }
                    className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="ইটালিক"
                  >
                    <Italic className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n### উপ-শিরোনাম\n" }))
                    }
                    className="px-2 h-8 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-gray-50 text-xs font-mono font-bold transition-colors text-gray-700"
                    title="হেডিং"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n> উদ্ধৃতি বাক্য...\n" }))
                    }
                    className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="উদ্ধৃতি"
                  >
                    <Quote className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n- তালিকা ১\n- তালিকা ২\n" }))
                    }
                    className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="বুলেট তালিকা"
                  >
                    <List className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n1. প্রথম ধাপ\n2. দ্বিতীয় ধাপ\n" }))
                    }
                    className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="ক্রমিক তালিকা"
                  >
                    <ListOrdered className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n```\nকোড বা উদাহরণ\n```\n" }))
                    }
                    className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="কোড ব্লক"
                  >
                    <Code className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Editor Workspace */}
            {editorTab === "write" ? (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="এখানে বিস্তারিত শিক্ষণ সেশন রচনা করুন (মার্কডাউন সমর্থন করে)..."
                rows={18}
                className="w-full p-6 bg-white text-black font-bangla text-base leading-relaxed outline-none resize-y min-h-[380px] font-normal"
              />
            ) : (
              <div className="p-6 bg-white min-h-[380px] font-bangla prose prose-neutral max-w-none">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {formData.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Word & Reading Meta Footer */}
            <div className="px-4 py-2.5 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center justify-between text-xs text-gray-500 font-mono">
              <div className="flex items-center gap-4">
                <span>শব্দ সংখ্যা: {banglaNumber(wordCount)}</span>
                <span>অক্ষর: {banglaNumber(charCount)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-black">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>আনুমানিক পাঠ সময়: {banglaNumber(readingTimeMin)} মিনিট</span>
              </div>
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-black font-headline">সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO)</h2>
                <p className="text-xs text-gray-500 font-normal">
                  গুগল অনুসন্ধান ও সামাজিক যোগাযোগ মাধ্যমে সেশনটি কীভাবে উপস্থাপিত হবে
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-gray-700 uppercase">
                  মেটা শিরোনাম (SEO Title)
                </label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData((p) => ({ ...p, seo_title: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-xs text-black outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white font-normal"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-gray-700 uppercase">
                  মেটা বিবরণ (Meta Description)
                </label>
                <textarea
                  rows={3}
                  value={formData.meta_description}
                  onChange={(e) => setFormData((p) => ({ ...p, meta_description: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-xs text-black outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white font-normal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings & Metadata (4 cols) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          {/* Status Capsule Card */}
          <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-gray-700 uppercase">প্রকাশনা অবস্থা (Status)</span>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: "draft" }))}
                className={`py-2 rounded-md transition-all ${
                  formData.status === "draft"
                    ? "bg-mint text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                খসড়া
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: "scheduled" }))}
                className={`py-2 rounded-md transition-all ${
                  formData.status === "scheduled"
                    ? "bg-[#E2E361] text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                শিডিউল
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: "published" }))}
                className={`py-2 rounded-md transition-all ${
                  formData.status === "published"
                    ? "bg-mint text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                প্রকাশিত
              </button>
            </div>
          </div>

          {/* Batch & Session Number */}
          <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-gray-700 uppercase">ব্যাচ ও ক্রমবিন্যাস</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-gray-500">ব্যাচ নম্বর</label>
                <input
                  type="number"
                  value={formData.batch}
                  onChange={(e) => setFormData((p) => ({ ...p, batch: Number(e.target.value) }))}
                  className="w-full h-9 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg outline-none font-bold text-black focus:border-mint"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-gray-500">সেশন নম্বর</label>
                <input
                  type="number"
                  value={formData.session_number}
                  onChange={(e) => setFormData((p) => ({ ...p, session_number: Number(e.target.value) }))}
                  className="w-full h-9 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg outline-none font-bold text-black focus:border-mint"
                />
              </div>
            </div>
          </div>

          {/* Publishing Schedule */}
          <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-gray-700 uppercase">সময়সূচী (Schedule)</span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData((p) => ({ ...p, scheduled_date: e.target.value }))}
                  className="w-full h-9 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg font-mono font-semibold text-black outline-none focus:border-mint text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData((p) => ({ ...p, scheduled_time: e.target.value }))}
                  className="w-full h-9 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg font-mono font-semibold text-black outline-none focus:border-mint text-xs"
                />
              </div>
            </div>
          </div>

          {/* Topic Tags */}
          <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-gray-700 uppercase">বিষয়ভিত্তিক ট্যাগ (Tags)</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] text-xs font-mono font-bold"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="নতুন ট্যাগ লিখুন..."
                className="flex-1 h-9 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-xs outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white transition-all font-normal"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 h-9 rounded-lg border border-mint bg-mint hover:bg-[#72eab0] text-black text-xs font-bold uppercase transition-all"
              >
                যুক্ত
              </button>
            </div>
          </div>

          {/* Visibility Options */}
          <div className="p-5 rounded-xl bg-white border border-[#e5e7eb] flex flex-col gap-3 text-xs">
            <span className="font-mono font-bold text-gray-700 uppercase">দৃশ্যমানতা (Visibility)</span>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] cursor-pointer hover:bg-white transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.visibility === "public"}
                  onChange={() => setFormData((p) => ({ ...p, visibility: "public" }))}
                  className="w-4 h-4 accent-teal-600"
                />
                <div>
                  <span className="font-bold text-black block">
                    সবার জন্য উন্মুক্ত (Public)
                  </span>
                  <span className="text-gray-500 font-bangla font-normal">অতিথিরাও পড়তে পারবেন</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] cursor-pointer hover:bg-white transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.visibility === "members_only"}
                  onChange={() =>
                    setFormData((p) => ({ ...p, visibility: "members_only" }))
                  }
                  className="w-4 h-4 accent-teal-600"
                />
                <div>
                  <span className="font-bold text-black block">
                    শুধু নিবন্ধিত সদস্য (Members only)
                  </span>
                  <span className="text-gray-500 font-bangla font-normal">লগইন আবশ্যক</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR: Publishing Action Controls */}
      <div className="fixed bottom-0 left-72 right-0 h-16 bg-white border-t border-[#e5e7eb] px-8 flex items-center justify-between z-40 font-bangla">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono font-semibold">
          <Save className="w-4 h-4 text-gray-400" />
          <span>সকল পরিবর্তন ড্রাফটে স্বয়ংক্রিয়ভাবে সিঙ্ক হচ্ছে</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-[#e5e7eb] bg-white hover:bg-gray-50 text-xs font-mono font-bold text-gray-700 hover:text-black uppercase transition-all"
          >
            খসড়া সংরক্ষণ
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg border border-mint bg-mint hover:bg-[#72eab0] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            {formData.status === "scheduled" ? "শিডিউল নিশ্চিত করুন" : "প্রকাশ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
