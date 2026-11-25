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
  id: number | string;
  type: "announcement" | "verification" | "session" | "comment" | string;
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

export function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications?: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications && initialNotifications.length > 0
      ? initialNotifications
      : INITIAL_NOTIFICATIONS
  );
  const [filter, setFilter] = useState<"all" | "unread" | "announcement">("all");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: number | string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await fetch(`/api/bff/notifications/${id}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
    } catch {
      // Graceful
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে");

    try {
      await fetch("/api/bff/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
    } catch {
      // Graceful
    }
  };

  const handleDelete = (id: number | string) => {
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
        return <Megaphone className="w-5 h-5 text-black" />;
      case "verification":
        return <CheckCircle2 className="w-5 h-5 text-black" />;
      case "session":
        return <BookOpen className="w-5 h-5 text-black" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-black" />;
      default:
        return <Bell className="w-5 h-5 text-black" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-bangla">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
              আপডেট ও বার্তা
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-headline">
              বিজ্ঞপ্তি
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FF49D2]/15 text-black border border-[#FF49D2]">
                {banglaNumber(unreadCount)}টি নতুন
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-mint bg-mint text-xs font-mono font-bold text-black uppercase tracking-wider hover:bg-[#72eab0] transition-all self-start sm:self-auto"
          >
            <Check className="w-4 h-4 text-black stroke-[2.5]" />
            <span>সব পঠিত চিহ্নিত করুন</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] pb-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
            filter === "all"
              ? "bg-mint text-black border-mint"
              : "border-[#e5e7eb] text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          সব ({banglaNumber(notifications.length)})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
            filter === "unread"
              ? "bg-mint text-black border-mint"
              : "border-[#e5e7eb] text-gray-600 hover:text-black hover:bg-gray-50"
          }`}
        >
          অপঠিত ({banglaNumber(unreadCount)})
        </button>
        <button
          type="button"
          onClick={() => setFilter("announcement")}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
            filter === "announcement"
              ? "bg-mint text-black border-mint"
              : "border-[#e5e7eb] text-gray-600 hover:text-black hover:bg-gray-50"
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
              className={`p-4 sm:p-5 rounded-xl border transition-all flex items-start gap-4 cursor-pointer hover:border-gray-300 ${
                item.is_read
                  ? "bg-white border-[#e5e7eb]"
                  : "bg-white border-l-4 border-l-mint border-t border-r border-b border-[#e5e7eb]"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  item.type === "announcement"
                    ? "bg-[#E2E361]/20 border-[#E2E361]"
                    : item.type === "verification"
                    ? "bg-[#63DB9A]/20 border-[#63DB9A]"
                    : item.type === "session"
                    ? "bg-[#f9fafb] border-[#e5e7eb]"
                    : "bg-[#FF49D2]/15 border-[#FF49D2]"
                }`}
              >
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-black font-headline leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 font-mono font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.created_at}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="w-7 h-7 rounded-lg border border-[#e5e7eb] bg-white hover:bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center transition-colors ml-1"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed font-normal">
                  {item.description}
                </p>

                {item.link && (
                  <div className="mt-3">
                    <Link
                      href={item.link}
                      className="text-xs font-bold font-mono text-black hover:underline inline-flex items-center gap-1 uppercase"
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
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#63DB9A]/20 text-black border border-[#63DB9A]">
            <Bell className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-bold text-black mb-1 font-headline">কোনো বিজ্ঞপ্তি নেই</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed font-normal">
            আপনার কাছে এই মুহূর্তে কোনো নতুন নোটিফিকেশন বা বার্তা নেই। নতুন সেশন বা ঘোষণা এলে এখানে দেখতে পাবেন।
          </p>
        </div>
      )}
    </div>
  );
}
