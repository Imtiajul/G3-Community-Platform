import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function MemberRightAside() {
  return (
    <aside className="hidden xl:block w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 border-l border-border pl-4 bg-background font-bangla">
      <div className="flex flex-col gap-6">
        {/* Announcements Module */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-foreground text-[20px]">
                campaign
              </span>
              <h3 className="text-base font-bold text-foreground">ঘোষণা</h3>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-foreground text-background text-xs font-bold">
              নতুন
            </span>
          </div>

          {/* Pinned Announcement */}
          <div className="p-3 rounded-lg bg-secondary border border-border mb-3 relative hover:border-foreground transition-all">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="inline-flex items-center gap-1 text-foreground text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px]">push_pin</span>
                <span>বিশেষ অধিবেশন</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">শুক্রবার</span>
            </div>
            <h4 className="text-xs font-bold text-foreground hover:underline cursor-pointer leading-snug">
              আগামী শুক্রবারের বিশেষ লাইভ কর্মশালা ও প্রশ্নোত্তর পর্ব
            </h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              সন্ধ্যা ৭:৩০ মিনিটে জুমে অনুষ্ঠিত হবে। প্রস্তুত থাকুন আপনার উদ্যোক্তা জীবনের বাস্তব সমস্যা নিয়ে।
            </p>
          </div>

          {/* Regular Announcements */}
          <div className="flex flex-col gap-2 pt-1 border-t border-border">
            <div className="py-1.5 px-1 rounded-md hover:bg-secondary transition-colors">
              <span className="text-[11px] text-muted-foreground font-mono block mb-0.5">১৫ মে, ২০২৪</span>
              <Link href="/notifications" className="text-xs text-foreground hover:underline line-clamp-2 leading-snug">
                সেশন নোট সাবমিট করার সময়সীমা বৃদ্ধি করা হলো
              </Link>
            </div>
            <div className="py-1.5 px-1 rounded-md hover:bg-secondary transition-colors">
              <span className="text-[11px] text-muted-foreground font-mono block mb-0.5">১২ মে, ২০২৪</span>
              <Link href="/notifications" className="text-xs text-foreground hover:underline line-clamp-2 leading-snug">
                নতুন লাইব্রেরি রিসোর্স: পণ্য প্যাকেজিং ও ব্র্যান্ডিং ম্যানুয়াল
              </Link>
            </div>
          </div>

          <Link
            href="/notifications"
            className="mt-3 pt-2 border-t border-border flex items-center justify-center gap-1 text-xs text-foreground font-bold hover:underline transition-colors"
          >
            <span>সকল ঘোষণা দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Editorial Quote Card */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-foreground mb-2">
            <span className="material-symbols-outlined text-[18px]">format_quote</span>
            <h3 className="text-sm font-bold text-foreground">আজকের ভাবনা</h3>
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            “ভালো মানুষ হওয়াটাই সবচেয়ে বড় উদ্যোক্তা হওয়া। সততাই টেকসই সাফল্যের একমাত্র পথ।”
          </p>
          <span className="block text-xs text-foreground mt-2 text-right font-medium">
            — ইকবাল বাহার জাহিদ
          </span>
        </div>

        {/* Quick Resource Shortcuts */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            গুরুত্বপূর্ণ লিংক
          </span>
          <Link
            href="/sessions"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary text-foreground text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-foreground text-[18px]">menu_book</span>
              <span>৯০ দিনের সেশন সিলেবাস</span>
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link
            href="/sessions"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary text-foreground text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-foreground text-[18px]">gavel</span>
              <span>কমিউনিটি আচরণবিধি</span>
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link
            href="/sessions"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary text-foreground text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-foreground text-[18px]">support_agent</span>
              <span>সহায়তা কেন্দ্র ও হেল্পডেস্ক</span>
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
