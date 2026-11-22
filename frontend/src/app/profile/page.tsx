"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/auth/context";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { banglaNumber } from "@/lib/utils";
import {
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Clock,
  XCircle,
  KeyRound,
  Bell,
  LogOut,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const user = useUser();

  const [batch, setBatch] = useState(user?.batch ? String(user.batch) : "");
  const [registrationNo, setRegistrationNo] = useState(user?.registration_no || "");
  const [applying, setApplying] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState("");

  const isFieldsLocked = user?.verification_status === "pending" || user?.verification_status === "verified";
  const canApply = Boolean(batch.trim() && registrationNo.trim()) && !isFieldsLocked;

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canApply) return;

    setApplying(true);
    try {
      const res = await fetch("/api/bff/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: parseInt(batch, 10),
          registration_no: registrationNo.trim(),
        }),
      });

      if (res.ok) {
        toast.success("ভেরিফিকেশনের জন্য আবেদন সফলভাবে জমা দেওয়া হয়েছে!");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.detail || "আবেদন জমা দেওয়া যায়নি।");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setApplying(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/bff/auth/logout", { method: "POST" });
      toast.success("লগআউট সফল হয়েছে।");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("লগআউট করা সম্ভব হয়নি।");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("নতুন পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    setChangingPassword("loading");
    try {
      const res = await fetch("/api/bff/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("বর্তমান পাসওয়ার্ড সঠিক নয়।");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setChangingPassword("");
    }
  };

  return (
    <>
      <PublicNavbar />
      <main className="w-full pt-16 bg-background flex-grow font-bangla min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
          {/* Profile Overview Card */}
          <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xl text-foreground shrink-0 shadow-sm">
                {user?.first_name?.[0] || user?.full_name?.[0] || "স"}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {user?.full_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "সদস্য"}
                  </h1>
                  {user?.verification_status === "verified" && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]" title="যাচাইকৃত">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-foreground border border-border">
                    {user?.role === "admin" ? "অ্যাডমিন" : user?.role === "moderator" ? "মডারেটর" : "সাধারণ সদস্য"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? "লগআউট হচ্ছে..." : "লগআউট"}</span>
              </Button>
            </div>
          </section>

          {/* Verification Status & Application Box */}
          <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">সদস্যপদ যাচাইকরণ (Verification)</h2>
              </div>

              {/* Status Badge */}
              {user?.verification_status === "verified" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>যাচাইকৃত সদস্য</span>
                </span>
              )}
              {user?.verification_status === "pending" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>পর্যালোচনাধীন</span>
                </span>
              )}
              {user?.verification_status === "rejected" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>প্রত্যাখ্যাত</span>
                </span>
              )}
              {user?.verification_status === "unverified" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-semibold border border-border">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>অযাচাইকৃত</span>
                </span>
              )}
            </div>

            {/* Rejection notice if rejected */}
            {user?.verification_status === "rejected" && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 leading-relaxed">
                <span className="font-bold">বাতিলের কারণ: </span>
                প্রদত্ত রেজিস্ট্রেশন নম্বর ও ব্যাচ তালিকার সাথে মেলেনি। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় আবেদন করুন।
              </div>
            )}

            {isFieldsLocked && (
              <p className="text-xs text-muted-foreground mb-4">
                🔒 আপনার আবেদন পর্যালোচনায় অথবা অনুমোদিত থাকায় ব্যাচ ও রেজিস্ট্রেশন নম্বর পরিবর্তন লক করা আছে।
              </p>
            )}

            <form onSubmit={handleApplyVerification} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="batch">
                    আপনার ব্যাচ নম্বর
                  </label>
                  <Input
                    id="batch"
                    type="number"
                    placeholder="যেমন: ২৪"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    disabled={isFieldsLocked}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="registrationNo">
                    রেজিস্ট্রেশন নম্বর
                  </label>
                  <Input
                    id="registrationNo"
                    placeholder="যেমন: REG-24-1045"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    disabled={isFieldsLocked}
                    required
                  />
                </div>
              </div>

              {!isFieldsLocked && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={!canApply || applying}
                    className="font-bold text-xs"
                  >
                    {applying ? "জমা হচ্ছে..." : "যাচাইকরণের জন্য আবেদন করুন"}
                  </Button>
                </div>
              )}
            </form>
          </section>

          {/* Password Change Box */}
          <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">পাসওয়ার্ড পরিবর্তন</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="oldPassword">
                  বর্তমান পাসওয়ার্ড
                </label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="newPassword">
                  নতুন পাসওয়ার্ড
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="confirmNewPassword">
                  নতুন পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={Boolean(changingPassword)}
                className="font-bold text-xs"
              >
                {changingPassword ? "সংরক্ষণ হচ্ছে..." : "পাসওয়ার্ড হালনাগাদ করুন"}
              </Button>
            </form>
          </section>

          {/* Notification Preferences */}
          <section className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">বিজ্ঞপ্তি পছন্দসমূহ</h2>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">নতুন সেশন ইমেইল বিজ্ঞপ্তি</h3>
                  <p className="text-xs text-muted-foreground">প্রতিটি নতুন সেশন প্রকাশিত হলে ইমেইল পান</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">মন্তব্য ও প্রতিক্রিয়ার বিজ্ঞপ্তি</h3>
                  <p className="text-xs text-muted-foreground">আপনার মন্তব্যের উত্তর আসলে বিজ্ঞপ্তি পান</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
