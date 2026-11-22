"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useUser } from "@/lib/auth/context";

export function AdminHeader() {
  const user = useUser();

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-card/95 backdrop-blur-md border-b border-border z-40 px-6 sm:px-8 flex items-center justify-between font-bangla">
      <div className="relative w-80 md:w-96">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          placeholder="অনুসন্ধান করুন..."
          className="w-full h-9 pl-10 pr-4 bg-secondary/50 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:bg-card transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="বিজ্ঞপ্তি"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-card" />
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.first_name ? user.first_name[0] : "অ্যা"}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-foreground">
            {user?.first_name || "অ্যাডমিন"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
