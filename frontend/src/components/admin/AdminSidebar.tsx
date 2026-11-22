"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  Users,
  ShieldAlert,
  BarChart3,
  ArrowLeft,
  MoreVertical,
  Layers,
} from "lucide-react";
import { useUser } from "@/lib/auth/context";

const NAV_ITEMS = [
  {
    name: "ড্যাশবোর্ড / একনজর",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "সেশনসমূহ",
    href: "/admin/sessions",
    icon: BookOpen,
  },
  {
    name: "যাচাইয়ের আবেদন",
    href: "/admin/verification",
    icon: UserCheck,
    badge: "১২",
  },
  {
    name: "ব্যবহারকারী",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "মডারেশন",
    href: "/admin/moderation",
    icon: ShieldAlert,
  },
  {
    name: "পরিসংখ্যান",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useUser();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col justify-between py-6 px-4 font-bangla select-none">
      <div className="flex flex-col gap-6">
        {/* Brand header */}
        <div className="px-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 text-white shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-foreground tracking-tight truncate leading-tight">
              নিজের বলার মতো
            </span>
            <span className="text-xs text-muted-foreground truncate font-medium">
              একটি গল্প • অ্যাডমিন
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-teal-400 text-teal-950"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border/60">
        <Link
          href="/feed"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল প্ল্যাটফর্মে ফিরুন</span>
        </Link>

        {/* Admin profile snippet */}
        <div className="p-3 rounded-xl bg-secondary/60 border border-border flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              {user?.first_name ? user.first_name[0] : "অ্যা"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {user?.first_name || "ইকবাল বাহার জাহিদ"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {user?.role === "admin" ? "প্রধান অ্যাডমিন" : "মডারেটর"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
            aria-label="অ্যাডমিন মেনু"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
