"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useUser } from "@/lib/auth/context";

export function AdminHeader() {
  const user = useUser();

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white border-b border-[#e5e7eb] z-40 px-6 sm:px-8 flex items-center justify-between font-bangla">
      <div className="relative w-80 md:w-96">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          placeholder="অনুসন্ধান করুন..."
          className="w-full h-9 pl-10 pr-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-xs text-black placeholder:text-gray-400 outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white transition-all font-normal"
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:text-black border border-transparent hover:border-[#e5e7eb] hover:bg-gray-50 transition-all"
          title="বিজ্ঞপ্তি"
        >
          <Bell className="w-4 h-4 text-black" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-neon border-2 border-white" />
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-[#e5e7eb]">
          <div className="w-8 h-8 rounded-full bg-[#63DB9A]/20 border border-[#63DB9A] text-black flex items-center justify-center font-bold text-xs">
            {user?.first_name ? user.first_name[0] : "অ্যা"}
          </div>
          <span className="hidden sm:inline text-xs font-bold text-black">
            {user?.first_name || "অ্যাডমিন"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </div>
      </div>
    </header>
  );
}
