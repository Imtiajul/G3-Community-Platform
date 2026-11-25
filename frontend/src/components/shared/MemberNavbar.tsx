"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth/context";
import { Search, Bell } from "lucide-react";

export function MemberNavbar() {
  const pathname = usePathname();
  const user = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] font-bangla">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/feed" className="flex items-center gap-2.5 text-black hover:opacity-85 transition-opacity">
            <span className="material-symbols-outlined text-black text-[24px] bg-mint border border-[#e5e7eb] p-1.5 rounded-lg">
              auto_stories
            </span>
            <span className="text-base sm:text-lg font-bold font-headline text-black tracking-tight">
              নিজের বলার মতো একটা গল্প
            </span>
          </Link>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <form action="/sessions" method="GET" className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-neutral-500 pointer-events-none" />
            <input
              name="q"
              type="text"
              placeholder="অনুসন্ধান করুন... (যেমন: সেশন, উদ্যোক্তা, ভাবনা)"
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e7eb] text-black placeholder:text-neutral-500 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mint transition-all"
            />
          </form>
        </div>

        {/* Right Icons: Notifications, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/notifications"
            className="relative p-2 text-black hover:bg-lime/30 border border-transparent hover:border-[#e5e7eb] rounded-full transition-all"
            aria-label="বিজ্ঞপ্তি"
          >
            <Bell className="w-5 h-5 text-black" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-neon rounded-full ring-2 ring-white" />
          </Link>

          <Link href="/profile" className="flex items-center gap-2 pl-1 group">
            <div className="relative flex items-center">
              <div className="w-8 h-8 rounded-full bg-black text-white border border-[#e5e7eb] flex items-center justify-center font-bold text-xs">
                {user?.first_name?.[0] || user?.full_name?.[0] || "স"}
              </div>
              {user?.verification_status === "verified" && (
                <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-black bg-mint border border-[#e5e7eb] rounded-full text-[13px]">
                  verified
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-black group-hover:underline">
              {user?.first_name || "প্রোফাইল"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
