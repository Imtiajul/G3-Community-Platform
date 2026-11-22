"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, RotateCcw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "আপনার ইমেইল ঠিকানায়";
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResending(true);
    try {
      const res = await fetch("/api/bff/auth/verification/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      toast.success("যাচাইকরণ লিংক পুনরায় পাঠানো হয়েছে!");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("লিংক পাঠানো সম্ভব হয়নি। অনুগ্রহ করে একটু পর চেষ্টা করুন।");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-bangla text-foreground flex flex-col justify-between p-4 sm:p-6">
      <header className="w-full pt-6 pb-4">
        <div className="max-w-md mx-auto text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground shadow-sm">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              নিজের বলার মতো একটা গল্প
            </span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-6 text-foreground shadow-sm">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          ইমেইল যাচাই করুন
        </h1>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          আমরা <span className="font-semibold text-foreground">{email}</span> ঠিকানায় একটি যাচাইকরণ লিংক পাঠিয়েছি। আপনার ইনবক্স চেক করে লিংকে ক্লিক করুন।
        </p>

        <div className="bg-secondary/60 border border-border rounded-lg p-3 text-xs text-muted-foreground mb-6 leading-relaxed">
          ⚠️ ইনবক্সে লিংক না পেলে আপনার স্প্যাম (Spam) বা প্রমোশন (Promotions) ফোল্ডারটি চেক করুন।
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            disabled={resending || cooldown > 0}
            onClick={handleResend}
            className="w-full font-medium text-xs sm:text-sm gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {cooldown > 0
                ? `${cooldown} সেকেন্ড পর পুনরায় চেষ্টা করুন`
                : resending
                ? "পাঠানো হচ্ছে..."
                : "যাচাইকরণ লিংক পুনরায় পাঠান"}
            </span>
          </Button>

          <Button asChild className="w-full font-bold">
            <Link href="/login">লগইন পেজে যান</Link>
          </Button>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-muted-foreground">
        © ২০২৪–২০২৬ নিজের বলার মতো একটা গল্প ফাউন্ডেশন
      </footer>
    </div>
  );
}
