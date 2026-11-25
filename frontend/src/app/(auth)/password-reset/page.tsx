"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const requestResetSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
});

const confirmResetSchema = z
  .object({
    password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে"),
    confirm_password: z.string().min(8, "পাসওয়ার্ড নিশ্চিত করুন"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "পাসওয়ার্ড দুটি মিলছে না",
    path: ["confirm_password"],
  });

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const isConfirmMode = Boolean(uid && token);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form for requesting reset
  const requestForm = useForm<{ email: string }>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  // Form for confirming new password
  const confirmForm = useForm<{ password: string; confirm_password: string }>({
    resolver: zodResolver(confirmResetSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  const handleRequestSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await fetch("/api/bff/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSubmitted(true);
      toast.success("পাসওয়ার্ড পুনরুদ্ধারের নির্দেশনা পাঠানো হয়েছে।");
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (values: { password: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/bff/auth/password-reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: values.password }),
      });
      if (res.ok) {
        toast.success("নতুন পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে।");
        router.push("/login");
      } else {
        toast.error("লিংকটির মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার আবেদন করুন।");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-bangla text-foreground flex flex-col justify-between p-4 sm:p-6">
      <header className="w-full pt-6 pb-4">
        <div className="max-w-md mx-auto text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 rounded-lg bg-mint border border-mint flex items-center justify-center text-dark shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground font-space-grotesk">
              নিজের বলার মতো একটা গল্প
            </span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto bg-white border border-[#e5e7eb] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="w-12 h-12 rounded-lg bg-lime border border-lime flex items-center justify-center mx-auto mb-4 text-dark shadow-sm">
          <KeyRound className="w-6 h-6 text-dark" />
        </div>

        {isConfirmMode ? (
          <div>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-space-grotesk">
                নতুন পাসওয়ার্ড নির্ধারণ
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড দিন
              </p>
            </div>

            <form onSubmit={confirmForm.handleSubmit(handleConfirmSubmit)} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1.5 font-mono uppercase tracking-wider" htmlFor="password">
                  নতুন পাসওয়ার্ড // NEW PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...confirmForm.register("password")}
                  required
                />
                {confirmForm.formState.errors.password && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    {confirmForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1.5 font-mono uppercase tracking-wider" htmlFor="confirm_password">
                  পাসওয়ার্ড নিশ্চিত করুন // CONFIRM
                </label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  {...confirmForm.register("confirm_password")}
                  required
                />
                {confirmForm.formState.errors.confirm_password && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    {confirmForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 font-semibold rounded-lg">
                {loading ? "সংরক্ষণ হচ্ছে..." : "নতুন পাসওয়ার্ড সংরক্ষণ করুন"}
              </Button>
            </form>
          </div>
        ) : submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-mint border border-mint flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-dark" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground font-space-grotesk">ইমেইল পাঠানো হয়েছে</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              যদি আপনার ইমেইলটি আমাদের সিস্টেমে নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেট করার একটি লিংক সেখানে পাঠানো হয়েছে।
            </p>
            <Button asChild variant="outline" className="w-full font-semibold rounded-lg">
              <Link href="/login">লগইন পেজে ফিরুন</Link>
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-space-grotesk">
                পাসওয়ার্ড পুনরুদ্ধার
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                আপনার নিবন্ধিত ইমেইল ঠিকানা দিলে আমরা পুনরুদ্ধারের লিংক পাঠাব
              </p>
            </div>

            <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1.5 font-mono uppercase tracking-wider" htmlFor="email">
                  ইমেইল ঠিকানা // EMAIL
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...requestForm.register("email")}
                  required
                />
                {requestForm.formState.errors.email && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    {requestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 font-semibold gap-2 rounded-lg">
                <span>{loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>লগইন পাতায় ফিরুন</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-4 text-center text-xs text-muted-foreground">
        © ২০২৪–২০২৬ নিজের বলার মতো একটা গল্প ফাউন্ডেশন
      </footer>
    </div>
  );
}
