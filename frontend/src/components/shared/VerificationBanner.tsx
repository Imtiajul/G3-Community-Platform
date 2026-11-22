"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth/context";
import { ShieldAlert, Clock, XCircle, ArrowRight, X } from "lucide-react";

export function VerificationBanner() {
  const user = useUser();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.verification_status === "verified" || dismissed) {
    return null;
  }

  return (
    <div className="w-full font-bangla mb-4">
      {/* 1. Unverified State */}
      {user.verification_status === "unverified" && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border-l-4 border-amber-500 border-t border-r border-b border-border rounded-lg shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
              আপনার সদস্যপদ এখনো যাচাইকৃত নয়। সেশনে মন্তব্য ও লাইক করতে প্রোফাইলে ব্যাচ ও রেজিস্ট্রেশন নম্বর যুক্ত করে আবেদন করুন।
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-foreground hover:bg-neutral-800 text-background text-xs font-bold transition-colors"
            >
              <span>আবেদন করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
              aria-label="ব্যানার বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Pending State */}
      {user.verification_status === "pending" && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-secondary/80 border-l-4 border-foreground border-t border-r border-b border-border rounded-lg shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Clock className="w-5 h-5 text-foreground shrink-0 animate-pulse" />
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-xs sm:text-sm font-medium text-foreground">
                আপনার আবেদন পর্যালোচনায় আছে —
              </span>
              <span className="text-xs text-muted-foreground truncate">
                অ্যাডমিন বা মডারেটর শীঘ্রই পর্যালোচনা সম্পন্ন করবেন।
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-card text-foreground text-xs font-bold border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>প্রক্রিয়াধীন</span>
            </span>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
              aria-label="ব্যানার বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Rejected State */}
      {user.verification_status === "rejected" && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border-l-4 border-red-600 border-t border-r border-b border-border rounded-lg shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
              আপনার ভেরিফিকেশন আবেদন বাতিল হয়েছে। তথ্য সংশোধন করে পুনরায় আবেদন করুন।
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
            >
              <span>সংশোধন করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
              aria-label="ব্যানার বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
