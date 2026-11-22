"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth/context";
import { Search, Bell, Menu, X } from "lucide-react";

export function MemberNavbar() {
  const pathname = usePathname();
  const user = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm font-bangla">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/feed" className="flex items-center gap-2.5 text-foreground hover:opacity-85 transition-opacity">
            <span className="material-symbols-outlined text-foreground text-[24px]">
              auto_stories
            </span>
            <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              নিজের বলার মতো একটা গল্প
            </span>
          </Link>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <form action="/sessions" method="GET" className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              name="q"
              type="text"
              placeholder="অনুসন্ধান করুন... (যেমন: সেশন, উদ্যোক্তা, ভাবনা)"
              className="w-full pl-9 pr-4 py-2 bg-card border border-border text-foreground placeholder:text-muted-foreground rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          </form>
        </div>

        {/* Right Icons: Notifications, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/notifications"
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            aria-label="বিজ্ঞপ্তি"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          </Link>

          <Link href="/profile" className="flex items-center gap-2 pl-1 group">
            <div className="relative flex items-center">
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
                {user?.first_name?.[0] || user?.full_name?.[0] || "স"}
              </div>
              {user?.verification_status === "verified" && (
                <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-foreground bg-background rounded-full text-[14px]">
                  verified
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-foreground group-hover:underline">
              {user?.first_name || "প্রোফাইল"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
