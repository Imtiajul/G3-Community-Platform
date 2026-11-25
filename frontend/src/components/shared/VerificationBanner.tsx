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
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-[#e5e7eb] border-l-4 border-l-[#E2E361] rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="material-symbols-outlined text-[18px] text-black bg-[#E2E361]/20 p-1.5 rounded-lg border border-[#E2E361] shrink-0">
              shield_person
            </span>
            <span className="text-xs sm:text-sm font-bold text-black truncate">
              আপনার সদস্যপদ এখনো যাচাইকৃত নয়। সেশনে মন্তব্য ও লাইক করতে প্রোফাইলে ব্যাচ ও রেজিস্ট্রেশন নম্বর যুক্ত করে আবেদন করুন।
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint hover:bg-[#72eab0] text-black text-xs font-bold border border-mint transition-all"
            >
              <span>আবেদন করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="ব্যানার বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Pending State */}
      {user.verification_status === "pending" && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-[#e5e7eb] border-l-4 border-l-[#63DB9A] rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="material-symbols-outlined text-[18px] text-black bg-[#63DB9A]/20 p-1.5 rounded-lg border border-[#63DB9A] shrink-0 animate-spin">
              sync
            </span>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-black">
                আপনার আবেদন পর্যালোচনায় আছে —
              </span>
              <span className="text-xs text-gray-600 truncate">
                অ্যাডমিন বা মডারেটর শীঘ্রই পর্যালোচনা সম্পন্ন করবেন।
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E2E361]/20 text-black text-xs font-bold border border-[#E2E361]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2E361] animate-pulse" />
              <span>প্রক্রিয়াধীন</span>
            </span>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="ব্যানার বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Rejected State */}
      {user.verification_status === "rejected" && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-[#e5e7eb] border-l-4 border-l-[#FF49D2] rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="material-symbols-outlined text-[18px] text-black bg-[#FF49D2]/15 p-1.5 rounded-lg border border-[#FF49D2] shrink-0">
              error
            </span>
            <span className="text-xs sm:text-sm font-bold text-black truncate">
              আপনার ভেরিফিকেশন আবেদন বাতিল হয়েছে। তথ্য সংশোধন করে পুনরায় আবেদন করুন।
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon hover:bg-[#ff69da] text-black text-xs font-bold border border-neon transition-all"
            >
              <span>সংশোধন করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
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
