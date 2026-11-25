"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sanitizeRedirectPath } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, X, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
  password: z.string().min(1, "পাসওয়ার্ড আবশ্যক"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = sanitizeRedirectPath(searchParams.get("next"), "/feed");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bff/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.detail || "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
        return;
      }

      toast.success("লগইন সফল হয়েছে। স্বাগতম!");
      router.push(nextUrl);
      router.refresh();
    } catch {
      setErrorMessage("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। কিছুক্ষণ পর চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-bangla text-foreground flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="w-full pt-6 pb-4">
        <div className="max-w-md mx-auto text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 rounded-lg bg-mint border border-mint flex items-center justify-center text-dark group-hover:scale-105 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground font-space-grotesk">
              নিজের বলার মতো একটা গল্প
            </span>
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md mx-auto bg-[#eff9f2] border border-[#e5e7eb] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-space-grotesk">
            আপনার অ্যাকাউন্টে প্রবেশ করুন
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            নিয়মিত পাঠ, আত্মউন্নয়ন ও উদ্যোক্তা নেটওয়ার্কে যুক্ত থাকুন
          </p>
        </div>

        {/* Error Alert Box matching Stitch design */}
        {errorMessage && (
          <div className="mb-6 bg-neon/10 border border-neon text-dark rounded-lg p-3 flex items-start justify-between gap-2 shadow-sm transition-all">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-dark shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-semibold leading-snug">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-dark hover:text-black p-0.5"
              aria-label="বার্তা বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1.5 font-mono uppercase tracking-wider" htmlFor="email">
              ইমেইল ঠিকানা // EMAIL
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500 pr-10" : ""}
                required
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 font-semibold">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-foreground font-mono uppercase tracking-wider" htmlFor="password">
                পাসওয়ার্ড // PASSWORD
              </label>
              <Link
                href="/password-reset"
                className="text-xs text-foreground font-semibold hover:underline transition-colors"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                aria-label="পাসওয়ার্ড দেখুন বা লুকান"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 font-semibold">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-semibold rounded-lg flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "লগইন হচ্ছে..." : "লগইন"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full h-[1px] bg-[#e5e7eb]" />
          <span className="absolute px-3 bg-white text-xs font-mono font-medium text-neutral-400 uppercase">অথবা // OR</span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => toast.info("Google সাইন-ইন শীঘ্রই সক্রিয় হবে।")}
          className="w-full h-11 bg-white hover:bg-neutral-50 border border-[#e5e7eb] text-black font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-3 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>গুগল দিয়ে চালিয়ে যান</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            নতুন সদস্য?{" "}
            <Link
              href={`/register?next=${encodeURIComponent(nextUrl)}`}
              className="text-foreground font-semibold hover:underline"
            >
              একটি নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
      </main>

      {/* Trust Micro-Banner */}
      <div className="max-w-md w-full mx-auto my-4 px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl flex items-center justify-between text-xs text-neutral-600 shadow-sm font-mono">
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="w-4 h-4 text-dark" />
          <span>নিরাপদ ও এনক্রিপ্টেড সংযোগ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-mint border border-mint" />
          <span>ব্যাচ ২৪ নিবন্ধিত</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-muted-foreground">
        © ২০২৪–২০২৬ নিজের বলার মতো একটা গল্প ফাউন্ডেশন
      </footer>
    </div>
  );
}
