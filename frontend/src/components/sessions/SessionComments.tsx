"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import { Lock, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface CommentItem {
  id: string;
  author_name: string;
  author_batch?: number;
  content: string;
  created_at: string;
}

interface SessionCommentsProps {
  slug: string;
  initialComments: CommentItem[];
}

export function SessionComments({ slug, initialComments }: SessionCommentsProps) {
  const user = useUser();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      toast.error("মন্তব্য করার পূর্বে লগইন করুন।");
      return;
    }

    setSubmitting(true);
    const newComment: CommentItem = {
      id: String(Date.now()),
      author_name: user.full_name || user.first_name || "সদস্য",
      author_batch: user.batch ?? undefined,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setComments((prev) => [newComment, ...prev]);
    setCommentText("");

    try {
      const res = await fetch("/api/bff/interactions/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: newComment.content }),
      });
      if (!res.ok) {
        toast.error("মন্তব্য প্রকাশ করা যায়নি।");
      } else {
        toast.success("আপনার গঠনমূলক মন্তব্য যুক্ত হয়েছে।");
      }
    } catch {
      toast.error("সার্ভারে ত্রুটি হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-border font-bangla" id="comments-section">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span>আলোচনা ও গঠনমূলক মন্তব্য ({banglaNumber(comments.length)})</span>
        </h3>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          নিয়ম মেনে ইতিবাচক মতবিনিময় করুন
        </span>
      </div>

      {/* Comment Input Box */}
      {user ? (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-card border border-border shadow-sm mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
              {user.first_name?.[0] || "আ"}
            </div>
            <span>{user.full_name || user.first_name} হিসেবে মন্তব্য লিখছেন</span>
          </div>

          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="আপনার গঠনমূলক অভিজ্ঞতা ও মতামত শেয়ার করুন..."
            rows={3}
            className="w-full text-sm"
            required
          />

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={submitting} className="font-bold gap-1.5">
              <span>{submitting ? "পাঠানো হচ্ছে..." : "মন্তব্য প্রকাশ করুন"}</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-xl bg-secondary/50 border border-border mb-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground">আলোচনায় অংশ নিতে লগইন করুন</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              সহপাঠীদের সাথে মতবিনিময় করতে অ্যাকাউন্টে প্রবেশ আবশ্যক।
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Button asChild size="sm" className="font-semibold text-xs">
              <Link href={`/login?next=/sessions/${slug}`}>লগইন করুন</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href={`/register?next=/sessions/${slug}`}>বিনামূল্যে নিবন্ধন</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-full bg-secondary border border-border text-foreground flex items-center justify-center font-bold text-sm shrink-0">
              {comment.author_name[0] || "স"}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{comment.author_name}</span>
                  {comment.author_batch && (
                    <span className="px-2 py-0.2 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
                      ব্যাচ {banglaNumber(comment.author_batch)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDateBn(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mt-1">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
