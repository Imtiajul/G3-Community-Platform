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
      // Simulate/call BFF session save
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
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/sessions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সেশন তালিকায় ফিরুন</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-medium border border-border">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>
              {isEditMode
                ? `সেশন সম্পাদনা: সেশন ${banglaNumber(formData.session_number)}`
                : "নতুন সেশন রচনা"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>স্বয়ংক্রিয় ড্রাফট সক্রিয়</span>
          </div>
          <button
            type="button"
            onClick={() => setEditorTab((prev) => (prev === "write" ? "preview" : "write"))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{editorTab === "write" ? "লাইভ ভিউ" : "এডিটরে ফিরুন"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Editor & Content (8 cols) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          {/* Session Title Card */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-2">
            <label
              htmlFor="session-title-input"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between"
            >
              <span>
                সেশন শিরোনাম <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                বাংলা ইউনিকোড সমর্থিত
              </span>
            </label>
            <input
              id="session-title-input"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="সেশনের স্পষ্ট ও অনুপ্রেরণামূলক শিরোনাম লিখুন..."
              className="w-full bg-transparent text-xl sm:text-2xl font-bold text-foreground placeholder:text-muted-foreground/50 outline-none leading-snug py-1"
            />
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono pt-1">
              <span>স্থায়ী লিংক:</span>
              <span className="text-primary truncate">
                /sessions/batch-{formData.batch}/session-{formData.session_number}
              </span>
            </div>
          </div>

          {/* Markdown Workspace */}
          <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="bg-secondary/40 px-4 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center p-1 bg-card border border-border rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    editorTab === "write"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  লিখুন (Write)
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    editorTab === "preview"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  প্রিভিউ (Preview)
                </button>
              </div>

              {/* Formatting buttons */}
              {editorTab === "write" && (
                <div className="flex items-center flex-wrap gap-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + " **বোল্ড টেক্সট** " }))
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"
                    title="বোল্ড"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + " *ইটালিক টেক্সট* " }))
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"
                    title="ইটালিক"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n### উপ-শিরোনাম\n" }))
                    }
                    className="px-2 h-8 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-foreground text-xs font-bold transition-colors"
                    title="শিরোনাম"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n> উদ্ধৃতি বার্তা\n" }))
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"
                    title="উদ্ধৃতি"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n- তালিকা আইটেম\n" }))
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"
                    title="বুলেট তালিকা"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n১. ক্রমিক আইটেম\n" }))
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"
                    title="সংখ্যাযুক্ত তালিকা"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, content: p.content + "\n---\n" }))
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"
                    title="ডিভাইডার দাগ"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Writing / Preview Surface */}
            <div className="p-6 min-h-[460px] flex flex-col">
              {editorTab === "write" ? (
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                  placeholder="আপনার সেশনের মূল বক্তব্য, দিকনির্দেশনা ও গল্পসমূহ এখানে বিস্তারিত আকারে লিখুন..."
                  className="w-full flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed min-h-[420px] font-bangla"
                />
              ) : (
                <div className="prose prose-bangla max-w-none text-foreground leading-relaxed">
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {formData.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-secondary/30 px-6 py-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-emerald-700 font-medium">✓ খসড়া স্বয়ংক্রিয়ভাবে সংরক্ষিত</span>
              <div className="flex items-center gap-3 font-mono">
                <span>
                  পড়ার সময়: <strong>{banglaNumber(readingTimeMin)} মিনিট</strong>
                </span>
                <span>|</span>
                <span>
                  শব্দ: <strong>{banglaNumber(wordCount)}</strong>
                </span>
                <span>|</span>
                <span>
                  অক্ষর: <strong>{banglaNumber(charCount)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Mentor Audio Attachment Card */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    মেন্টরের অডিও বা সহায়ক বার্তা (ঐচ্ছিক)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    সেশনের সাথে যুক্ত করার জন্য অডিও পডকাস্ট বা নির্দেশনামূলক ফাইল
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.info("অডিও আপলোড কার্যকারিতা সংযুক্ত")}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ফাইল যুক্ত করুন</span>
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-secondary/30 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-semibold text-foreground truncate">
                  session-162-mentor-briefing-iqbal-bahar.mp3
                </span>
                <span className="text-muted-foreground shrink-0">১৪.২ MB • দৈর্ঘ্য: ১৮:৪০ মিনিট</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings & Publishing Controls (4 cols) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          {/* 1. Publication Status Widget */}
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-3">
            <span className="text-sm font-bold text-foreground">প্রকাশনা স্ট্যাটাস</span>
            <div className="grid grid-cols-3 gap-2 p-1 bg-secondary/40 border border-border rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: "draft" }))}
                className={`py-2 rounded-md text-center transition-all ${
                  formData.status === "draft"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                খসড়া
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: "scheduled" }))}
                className={`py-2 rounded-md text-center transition-all ${
                  formData.status === "scheduled"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                শিডিউল
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: "published" }))}
                className={`py-2 rounded-md text-center transition-all ${
                  formData.status === "published"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                প্রকাশিত
              </button>
            </div>
          </div>

          {/* 2. Schedule Date & Time */}
          {formData.status === "scheduled" && (
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-3">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>শিডিউল ও প্রকাশের সময়</span>
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, scheduled_date: e.target.value }))
                    }
                    className="w-full h-9 px-2 bg-secondary/40 border border-border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">সময়</label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, scheduled_time: e.target.value }))
                    }
                    className="w-full h-9 px-2 bg-secondary/40 border border-border rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Batch & Session Number */}
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-3">
            <span className="text-sm font-bold text-foreground">ব্যাচ ও সেশন নম্বর</span>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">ব্যাচ নির্বাচন</label>
                <select
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, batch: Number(e.target.value) }))
                  }
                  aria-label="ব্যাচ নম্বর নির্বাচন"
                  className="w-full h-9 px-3 bg-secondary/40 border border-border rounded-lg outline-none cursor-pointer"
                >
                  <option value={24}>ব্যাচ ২৪ (বর্তমান চলমান)</option>
                  <option value={23}>ব্যাচ ২৩</option>
                  <option value={25}>ব্যাচ ২৫</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">সেশন নম্বর</label>
                <input
                  type="number"
                  value={formData.session_number}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, session_number: Number(e.target.value) }))
                  }
                  className="w-full h-9 px-3 bg-secondary/40 border border-border rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Tags Multi-Select */}
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">ট্যাগ ও ক্যাটাগরি</span>
              <span className="text-xs text-muted-foreground">
                {banglaNumber(formData.tags.length)}টি যুক্ত
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs text-foreground font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
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
                placeholder="+ ট্যাগ লিখুন..."
                className="flex-1 h-9 px-3 bg-secondary/40 border border-border rounded-lg text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 h-9 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90"
              >
                যুক্ত
              </button>
            </div>
          </div>

          {/* 5. Access Scope */}
          <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-3">
            <span className="text-sm font-bold text-foreground">অ্যাক্সেস পরিধি</span>
            <div className="flex flex-col gap-2 text-xs">
              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.visibility === "public"}
                  onChange={() => setFormData((p) => ({ ...p, visibility: "public" }))}
                  className="w-4 h-4 accent-teal-600"
                />
                <div>
                  <span className="font-semibold text-foreground block">
                    সবার জন্য উন্মুক্ত (Public)
                  </span>
                  <span className="text-muted-foreground">অতিথিরাও পড়তে পারবেন</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border cursor-pointer">
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
                  <span className="font-semibold text-foreground block">
                    শুধু নিবন্ধিত সদস্য (Members only)
                  </span>
                  <span className="text-muted-foreground">লগইন আবশ্যক</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR: Publishing Action Controls */}
      <div className="fixed bottom-0 left-72 right-0 h-16 bg-card border-t border-border px-8 flex items-center justify-between z-40 shadow-sm font-bangla">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Save className="w-4 h-4 text-primary" />
          <span>সকল পরিবর্তন ড্রাফটে স্বয়ংক্রিয়ভাবে সিঙ্ক হচ্ছে</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all"
          >
            খসড়া সংরক্ষণ
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl bg-foreground text-background hover:opacity-95 text-xs font-semibold transition-all shadow-sm"
          >
            {formData.status === "scheduled" ? "শিডিউল নিশ্চিত করুন" : "প্রকাশ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
