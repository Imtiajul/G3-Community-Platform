"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth/context";

const navItems = [
  {
    name: "ফিড",
    href: "/feed",
    icon: "dynamic_feed",
  },
  {
    name: "সেশনসমূহ",
    href: "/sessions",
    icon: "school",
  },
  {
    name: "সংরক্ষিত",
    href: "/saved",
    icon: "bookmark",
  },
  {
    name: "আমার নোটস",
    href: "/my-notes",
    icon: "edit_note",
  },
  {
    name: "প্রোফাইল",
    href: "/profile",
    icon: "account_circle",
  },
];

export function MemberLeftSidebar() {
  const pathname = usePathname();
  const user = useUser();

  return (
    <aside className="hidden lg:block w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 border-r border-[#e5e7eb] pr-4 font-bangla">
      <nav className="flex flex-col gap-1.5" aria-label="Sidebar Navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-mint text-black font-bold border border-[#e5e7eb]"
                  : "text-black hover:bg-lime/30 hover:border-[#e5e7eb] border border-transparent font-medium"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-black">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Staff Area shortcut if user is staff/admin */}
        {user?.is_staff && (
          <div className="pt-4 mt-4 border-t border-[#e5e7eb]">
            <span className="text-[11px] uppercase font-bold text-black px-3 mb-2 block tracking-wider">
              অ্যাডমিন পোর্টাল
            </span>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-neon text-black font-bold border border-[#e5e7eb]"
                  : "text-black hover:bg-lime/30 hover:border-[#e5e7eb] border border-transparent font-medium"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-black">
                admin_panel_settings
              </span>
              <span>ড্যাশবোর্ড</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}

export function MemberMobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[#e5e7eb] z-50 flex items-center justify-around px-2 font-bangla">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive
                ? "text-black font-bold bg-mint px-3 py-1 rounded-lg border border-[#e5e7eb]"
                : "text-black hover:text-black hover:bg-lime/20 px-2 py-1 rounded-lg"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
