"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ThumbsUp, Bookmark, Link as LinkIcon, Lock, Check } from "lucide-react";
import { banglaNumber } from "@/lib/utils";
import { toast } from "sonner";

interface SessionInteractionsProps {
  slug: string;
  initialLikesCount: number;
  initialIsLiked?: boolean;
  initialIsBookmarked?: boolean;
}

export function SessionInteractions({
  slug,
  initialLikesCount,
  initialIsLiked = false,
  initialIsBookmarked = false,
}: SessionInteractionsProps) {
  const user = useUser();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    if (!user) {
      setGuestModalOpen(true);
      return;
    }

    // Optimistic toggle
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : prev - 1));

    try {
      const res = await fetch("/api/bff/interactions/like", {
        method: nextState ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        // Revert on error
        setIsLiked(!nextState);
        setLikesCount((prev) => (nextState ? prev - 1 : prev + 1));
        toast.error("লাইক আপডেট করা যায়নি।");
      }
    } catch {
      setIsLiked(!nextState);
      setLikesCount((prev) => (nextState ? prev - 1 : prev + 1));
      toast.error("সার্ভারে সমস্যা হয়েছে।");
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      setGuestModalOpen(true);
      return;
    }

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    toast.success(nextState ? "সেশনটি সংরক্ষণ করা হয়েছে।" : "সংরক্ষণ বাতিল করা হয়েছে।");

    try {
      const res = await fetch("/api/bff/interactions/bookmark", {
        method: nextState ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        setIsBookmarked(!nextState);
        toast.error("সংরক্ষণ করা সম্ভব হয়নি।");
      }
    } catch {
      setIsBookmarked(!nextState);
      toast.error("সার্ভারে সমস্যা হয়েছে।");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("সেশনের লিংক কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
        {/* Like and Bookmark action buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className="flex items-center gap-1.5 text-xs font-bangla font-semibold"
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{banglaNumber(likesCount)}</span>
          </Button>

          <Button
            type="button"
            variant={isBookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
            className="flex items-center gap-1.5 text-xs font-bangla font-semibold"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            <span>{isBookmarked ? "সংরক্ষিত" : "সংরক্ষণ করুন"}</span>
          </Button>
        </div>

        {/* Share link button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 text-xs font-bangla"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
          <span>{copied ? "কপি সম্পন্ন!" : "লিংক কপি করুন"}</span>
        </Button>
      </div>

      {/* Stitch Faithful Guest Auth Prompt Modal */}
      <Dialog open={guestModalOpen} onOpenChange={setGuestModalOpen}>
        <DialogContent className="sm:max-w-md font-bangla">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold">লগইন প্রয়োজন</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              লাইক প্রদান, মন্তব্য বা ব্যক্তিগত নোট সংরক্ষণ করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2.5 pt-3">
            <Button asChild className="w-full font-bold">
              <Link href={`/login?next=/sessions/${slug}`}>লগইন করুন</Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-medium">
              <Link href={`/register?next=/sessions/${slug}`}>বিনামূল্যে যুক্ত হোন</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
