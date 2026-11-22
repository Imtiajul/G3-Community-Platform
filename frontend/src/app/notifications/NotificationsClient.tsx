"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  BookOpen,
  MessageSquare,
  Check,
  Trash2,
  Clock,
} from "lucide-react";

export interface NotificationItem {
  id: number;
  type: "announcement" | "verification" | "session" | "comment";
  title: string;
  description: string;
  created_at: string;
  is_read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "announcement",
    title: "আগামী শুক্রবার বিশেষ মিটআপ ও প্রশ্নোত্তর পর্ব",
    description: "রাত ৯:০০ টায় জুম প্ল্যাটফর্মে অনুষ্ঠিত হবে। সকল ব্যাচের শিক্ষার্থীরা অংশগ্রহণ করতে পারবেন।",
    created_at: "১০ মিনিট আগে",
    is_read: false,
    link: "/feed",
  },
  {
    id: 2,
    type: "session",
    title: "নতুন সেশন প্রকাশিত হয়েছে: সেশন ১২",
    description: "ব্যবসায় সততা, প্রতিশ্রুতি এবং গ্রাহকের বিশ্বাস অর্জনের মূলনীতি শীর্ষক নতুন সেশনটি এখন উন্মুক্ত।",
    created_at: "২ ঘন্টা আগে",
    is_read: false,
    link: "/sessions/honesty-commitment-and-customer-trust",
  },
  {
    id: 3,
    type: "verification",
    title: "আপনার সদস্যপদ ভেরিফিকেশন অনুমোদিত হয়েছে",
    description: "অভিনন্দন! আপনার ব্যাচ ও রেজিস্ট্রেশন নম্বর সফলভাবে যাচাই করা হয়েছে। আপনি এখন যাচাইকৃত সদস্য।",
    created_at: "১ দিন আগে",
    is_read: true,
    link: "/profile",
  },
  {
    id: 4,
    type: "comment",
    title: "আপনার মন্তব্যে নতুন উত্তর এসেছে",
    description: "সেশন ১১-এ আপনার প্রশ্নের একটি গঠনমূলক উত্তর দেওয়া হয়েছে।",
    created_at: "৩ দিন আগে",
    is_read: true,
    link: "/sessions/market-validation-and-first-100-customers#comments",
  },
];

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "announcement">("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে");
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("নোটিফিকেশন মুছে ফেলা হয়েছে");
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "announcement") return n.type === "announcement";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="w-5 h-5 text-indigo-600" />;
      case "verification":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "session":
        return <BookOpen className="w-5 h-5 text-teal-600" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              আপডেট ও বার্তা
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              বিজ্ঞপ্তি
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                {banglaNumber(unreadCount)}টি নতুন
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary transition-colors self-start sm:self-auto shadow-sm"
          >
            <Check className="w-3.5 h-3.5 text-primary" />
            <span>সব পঠিত চিহ্নিত করুন</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "all"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          সব ({banglaNumber(notifications.length)})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "unread"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          অপঠিত ({banglaNumber(unreadCount)})
        </button>
        <button
          type="button"
          onClick={() => setFilter("announcement")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "announcement"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ঘোষণা
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={`p-4 sm:p-5 rounded-xl border transition-all flex items-start gap-4 shadow-sm cursor-pointer ${
                item.is_read
                  ? "bg-card border-border hover:border-foreground/20"
                  : "bg-teal-50/20 border-teal-200/80 hover:border-teal-300"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  item.type === "announcement"
                    ? "bg-indigo-50 border-indigo-200"
                    : item.type === "verification"
                    ? "bg-emerald-50 border-emerald-200"
                    : item.type === "session"
                    ? "bg-teal-50 border-teal-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm sm:text-base font-bold text-foreground leading-snug ${
                      !item.is_read ? "text-primary" : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.created_at}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors ml-1"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {item.description}
                </p>

                {item.link && (
                  <div className="mt-3">
                    <Link
                      href={item.link}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>বিস্তারিত দেখুন</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-12 border border-border flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-secondary text-muted-foreground border border-border">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">কোনো বিজ্ঞপ্তি নেই</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
            আপনার কাছে এই মুহূর্তে কোনো নতুন নোটিফিকেশন বা বার্তা নেই। নতুন সেশন বা ঘোষণা এলে এখানে দেখতে পাবেন।
          </p>
        </div>
      )}
    </div>
  );
}
