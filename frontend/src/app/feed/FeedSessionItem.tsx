"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import {
  Clock,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  ArrowRight,
  Send,
} from "lucide-react";

export interface FeedSessionItemProps {
  session: {
    id: string;
    slug: string;
    title: string;
    batch_number: number;
    session_number: number;
    date: string;
    content?: string;
    excerpt?: string;
    tags?: string[] | { name: string }[];
    like_count?: number;
    comment_count?: number;
    bookmark_count?: number;
    is_liked_by_me?: boolean;
    is_bookmarked_by_me?: boolean;
    latest_comment?: {
      author_first_name?: string;
      excerpt?: string;
      created_at?: string;
    } | null;
  };
  currentUser?: {
    first_name?: string;
    full_name?: string;
  } | null;
  isFeatured?: boolean;
}

export function FeedSessionItem({
  session,
  currentUser,
  isFeatured = false,
}: FeedSessionItemProps) {
  const [isLiked, setIsLiked] = useState(session.is_liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(session.like_count ?? 0);
  const [isBookmarked, setIsBookmarked] = useState(session.is_bookmarked_by_me ?? false);
  const [commentCount, setCommentCount] = useState(session.comment_count ?? 0);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [latestComment, setLatestComment] = useState(session.latest_comment);

  const handleToggleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch("/api/bff/interactions/like", {
        method: nextState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ slug: session.slug }),
      });
      if (!res.ok) {
        setIsLiked(!nextState);
        setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
        toast.error("লাইক করতে সমস্যা হয়েছে।");
      }
    } catch {
      setIsLiked(!nextState);
      setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleToggleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    toast.success(nextState ? "সেশনটি সংরক্ষিত হয়েছে।" : "সংরক্ষণ তালিকা থেকে সরানো হয়েছে।");

    try {
      const res = await fetch("/api/bff/interactions/bookmark", {
        method: nextState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ slug: session.slug, session_id: session.id }),
      });
      if (!res.ok) {
        setIsBookmarked(!nextState);
      }
    } catch {
      setIsBookmarked(!nextState);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/sessions/${session.slug}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("সেশনের লিংক কপি করা হয়েছে!");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const content = commentInput.trim();
    setCommentInput("");

    try {
      const res = await fetch("/api/bff/interactions/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ slug: session.slug, content }),
      });

      if (res.ok) {
        setCommentCount((prev) => prev + 1);
        setLatestComment({
          author_first_name: currentUser?.first_name || "আমি",
          excerpt: content,
          created_at: new Date().toISOString(),
        });
        toast.success("মন্তব্য সফলভাবে প্রকাশিত হয়েছে।");
      } else {
        toast.error("মন্তব্য প্রকাশে ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, পুনরায় চেষ্টা করুন।");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isFeatured) {
    return (
      <article className="relative bg-white border border-[#e5e7eb] rounded-xl p-6 overflow-hidden transition-all hover:border-gray-300">
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-mint" />
        <div className="flex items-center justify-between gap-2 mb-3 pl-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] text-xs font-bold">
              আজকের সেশন
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-xs font-bold">
              ব্যাচ {banglaNumber(session.batch_number)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-gray-700 text-xs font-medium">
              সেশন {banglaNumber(session.session_number)}
            </span>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {formatDateBn(session.date)}
          </span>
        </div>

        <div className="pl-3">
          <h2 className="text-lg sm:text-xl font-bold font-headline text-black hover:text-black transition-colors mb-2">
            <Link href={`/sessions/${session.slug}`}>{session.title}</Link>
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3 font-normal">
            {session.excerpt ||
              session.content?.slice(0, 160) ||
              "ব্যবসার ভিত্তি কেবল মূলধনে গঠিত হয় না, বরং প্রতিটি পদক্ষেপে সততার প্রতিফলনই গ্রাহকের মনে স্থায়ী জায়গা নিশ্চিত করে।"}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 bg-white border-t border-[#e5e7eb] -mx-6 -mb-6 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] flex items-center justify-center font-bold text-sm">
                ই
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black">ইকবাল বাহার জাহিদ</span>
                <span className="text-[11px] text-gray-500 font-mono">প্রতিষ্ঠাতা ও মেন্টর</span>
              </div>
            </div>
            <Link
              href={`/sessions/${session.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mint hover:bg-[#72eab0] text-black text-xs font-bold border border-mint transition-all"
            >
              <span>পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white border border-[#e5e7eb] rounded-xl p-6 flex flex-col gap-4 hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#63DB9A]/20 border border-[#63DB9A] flex items-center justify-center font-bold text-sm text-black shrink-0">
            ইব
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/sessions/${session.slug}`}
                className="text-base sm:text-lg font-bold font-headline text-black hover:underline"
              >
                {session.title}
              </Link>
              <span className="material-symbols-outlined text-black bg-[#63DB9A]/20 rounded-full text-[16px] border border-[#63DB9A] p-0.5">
                verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5 font-mono">
              <span className="px-2 py-0.5 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] font-bold text-[11px]">
                ব্যাচ {banglaNumber(session.batch_number)}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-gray-700 text-[11px]">
                সেশন {banglaNumber(session.session_number)}
              </span>
              <span>•</span>
              <span>{formatDateBn(session.date)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="text-gray-500 hover:text-black hover:bg-gray-100 p-2 rounded-lg transition-colors border border-transparent hover:border-[#e5e7eb]"
          title="শেয়ার করুন"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-700 font-normal leading-relaxed">
        {session.excerpt ||
          session.content?.slice(0, 200) ||
          "কোনো উদ্যোগই ঝুঁকিমুক্ত নয়। কিন্তু ঝুঁকি মানে অন্ধের মতো এগিয়ে যাওয়া নয়, বরং সম্ভাব্য প্রতিটি প্রতিকূলতার আগাম বিশ্লেষণ করে বিকল্প পথ তৈরি রাখা।"}
      </p>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between py-2.5 bg-[#f9fafb] border border-[#e5e7eb] px-4 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isLiked
                ? "bg-mint text-black border-mint"
                : "bg-white text-gray-700 border-[#e5e7eb] hover:bg-gray-50 hover:text-black"
            }`}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${isLiked ? "fill-current text-black" : "text-gray-600"}`}
            />
            <span>{banglaNumber(likeCount)} সমমনা</span>
          </button>
          <Link
            href={`/sessions/${session.slug}#comments-section`}
            className="flex items-center gap-1.5 text-gray-700 hover:text-black bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-xs font-semibold transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
            <span>{banglaNumber(commentCount)} মন্তব্য</span>
          </Link>
        </div>
        <div className="flex items-center gap-1 text-black">
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-lg transition-colors border ${
              isBookmarked
                ? "bg-[#FF49D2]/15 border-[#FF49D2] text-black"
                : "bg-white hover:bg-gray-50 border-[#e5e7eb] text-gray-600 hover:text-black"
            }`}
            title="সংরক্ষণ করুন"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current text-black" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Latest Comment Thread Preview if present */}
      {latestComment && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-start gap-3 bg-[#f9fafb] border border-[#e5e7eb] p-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#E2E361]/20 border border-[#E2E361] flex items-center justify-center font-bold text-xs shrink-0 text-black">
              {latestComment.author_first_name?.[0] || "স"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black">
                    {latestComment.author_first_name || "সহপাঠী"}
                  </span>
                  <span className="text-[10px] text-black font-mono font-bold bg-[#E2E361]/20 px-1.5 py-0.2 rounded-full border border-[#E2E361]">
                    সহপাঠী
                  </span>
                </div>
                {latestComment.created_at && (
                  <span className="text-[11px] text-gray-500 font-mono">
                    {formatDateBn(latestComment.created_at)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed font-normal">
                {latestComment.excerpt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inline Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex items-center gap-2 mt-1">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs shrink-0 font-bold">
          {currentUser?.first_name?.[0] || "আ"}
        </div>
        <div className="flex-1 flex items-center bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-3 py-1 focus-within:border-mint focus-within:ring-1 focus-within:ring-mint focus-within:bg-white transition-all">
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="w-full bg-transparent py-1 text-black placeholder:text-gray-400 text-xs font-normal focus:outline-none"
            placeholder="আপনার গঠনমূলক মন্তব্য লিখুন..."
            disabled={isSubmittingComment}
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !commentInput.trim()}
            className="shrink-0 p-1.5 text-black bg-mint hover:bg-[#72eab0] border border-mint rounded-md transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </article>
  );
}
