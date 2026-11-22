"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z
  .object({
    first_name: z.string().min(2, "প্রথম নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
    last_name: z.string().min(2, "শেষ নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
    email: z.string().email("সঠিক ইমেইল ঠিকানা প্রদান করুন"),
    password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে"),
    confirm_password: z.string().min(8, "পাসওয়ার্ড নিশ্চিত করুন"),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: "কমিউনিটি নিয়মাবলী ও শর্তাবলীতে সম্মতি প্রদান আবশ্যক",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "পাসওয়ার্ড দুটি মিলছে না",
    path: ["confirm_password"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      terms_accepted: false,
    },
  });

  const termsAccepted = watch("terms_accepted");

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bff/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          terms_accepted: values.terms_accepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.detail ||
          data.email?.[0] ||
          "নিবন্ধন সম্পন্ন করা যায়নি। তথ্য পুনরায় যাচাই করুন।"
        );
        return;
      }

      toast.success("নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার ইমেইল যাচাই করুন।");
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch {
      setErrorMessage("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। কিছুক্ষণ পর চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-bangla text-foreground flex flex-col justify-between p-4 sm:p-6">
      <header className="w-full pt-6 pb-4">
        <div className="max-w-md mx-auto text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              নিজের বলার মতো একটা গল্প
            </span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            নতুন সদস্য নিবন্ধন
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            বিনা ফিতে যুক্ত হোন দেশের সবচেয়ে বড় মূল্যবোধের প্ল্যাটফর্মে
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-900 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium leading-snug">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="first_name">
                প্রথম নাম
              </label>
              <Input
                id="first_name"
                placeholder="যেমন: তানভীর"
                {...register("first_name")}
                className={errors.first_name ? "border-red-500" : ""}
                required
              />
              {errors.first_name && (
                <p className="text-[11px] text-red-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="last_name">
                শেষ নাম
              </label>
              <Input
                id="last_name"
                placeholder="যেমন: আহমেদ"
                {...register("last_name")}
                className={errors.last_name ? "border-red-500" : ""}
                required
              />
              {errors.last_name && (
                <p className="text-[11px] text-red-600 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="email">
              ইমেইল ঠিকানা
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
              required
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="password">
              পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
              required
            />
            {errors.password && (
              <p className="text-[11px] text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="confirm_password">
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              {...register("confirm_password")}
              className={errors.confirm_password ? "border-red-500" : ""}
              required
            />
            {errors.confirm_password && (
              <p className="text-[11px] text-red-600 mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <Checkbox
              id="terms_accepted"
              checked={termsAccepted}
              onCheckedChange={(checked) => setValue("terms_accepted", Boolean(checked))}
            />
            <label
              htmlFor="terms_accepted"
              className="text-xs text-muted-foreground leading-snug cursor-pointer select-none"
            >
              আমি প্ল্যাটফর্মের{" "}
              <span className="text-foreground font-semibold underline">কমিউনিটি নীতিমালা</span> ও{" "}
              <span className="text-foreground font-semibold underline">আচরণবিধি</span> মেনে চলার অঙ্গীকার করছি।
            </label>
          </div>
          {errors.terms_accepted && (
            <p className="text-[11px] text-red-600">{errors.terms_accepted.message}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-bold shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "নিবন্ধন সম্পন্ন হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="text-foreground font-bold hover:underline">
              লগইন করুন
            </Link>
          </p>
        </div>
      </main>

      <div className="max-w-md w-full mx-auto my-4 px-4 py-2 bg-card border border-border rounded-xl flex items-center justify-between text-xs text-muted-foreground shadow-sm">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>সম্পূর্ণ অবাণিজ্যিক ও বিনামূল্যে</span>
        </div>
        <span>২৪তম ব্যাচ চলমান</span>
      </div>

      <footer className="w-full py-4 text-center text-xs text-muted-foreground">
        © ২০২৪–২০২৬ নিজের বলার মতো একটা গল্প ফাউন্ডেশন
      </footer>
    </div>
  );
}
