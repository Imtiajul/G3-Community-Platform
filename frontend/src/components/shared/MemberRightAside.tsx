import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function MemberRightAside() {
  return (
    <aside className="hidden xl:block w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 border-l border-[#e5e7eb] pl-4 bg-white font-bangla">
      <div className="flex flex-col gap-6">
        {/* Announcements Module */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-neon text-[20px]">
                campaign
              </span>
              <h3 className="text-base font-bold font-headline text-black">ঘোষণা</h3>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-lime/20 border border-lime text-black text-xs font-bold">
              ৪টি নতুন
            </span>
          </div>

          {/* Pinned Announcement */}
          <div className="p-3 rounded-lg bg-white border border-[#e5e7eb] mb-3 relative hover:bg-lime/10 transition-all">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="inline-flex items-center gap-1 text-black text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px] text-neon">push_pin</span>
                <span>বিশেষ অধিবেশন</span>
              </span>
              <span className="text-[11px] text-black font-bold font-mono bg-lime/30 px-1.5 py-0.5 rounded border border-lime">
                ১৭ মে
              </span>
            </div>
            <h4 className="text-xs font-bold text-black hover:underline cursor-pointer leading-snug">
              আগামী শুক্রবারের বিশেষ লাইভ কর্মশালা ও প্রশ্নোত্তর পর্ব
            </h4>
            <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
              সন্ধ্যা ৭:৩০ মিনিটে জুমে অনুষ্ঠিত হবে। প্রস্তুত থাকুন আপনার উদ্যোক্তা জীবনের বাস্তব সমস্যা নিয়ে।
            </p>
          </div>

          {/* Regular Announcements */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#e5e7eb]">
            <div className="py-1.5 px-1 rounded-lg hover:bg-lime/20 transition-colors">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-neutral-600 font-mono">১৫ মে, ২০২৪</span>
                <span className="w-2 h-2 rounded-full bg-neon" />
              </div>
              <Link
                href="/notifications"
                className="text-xs text-black font-bold hover:underline line-clamp-2 leading-snug"
              >
                সেশন নোট সাবমিট করার সময়সীমা বৃদ্ধি করা হলো
              </Link>
            </div>
            <div className="py-1.5 px-1 rounded-lg hover:bg-lime/20 transition-colors">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-neutral-600 font-mono">১২ মে, ২০২৪</span>
              </div>
              <Link
                href="/notifications"
                className="text-xs text-black font-bold hover:underline line-clamp-2 leading-snug"
              >
                নতুন লাইব্রেরি রিসোর্স: পণ্য প্যাকেজিং ও ব্র্যান্ডিং ম্যানুয়াল
              </Link>
            </div>
          </div>

          <Link
            href="/notifications"
            className="mt-3 pt-2 border-t border-[#e5e7eb] flex items-center justify-center gap-1 text-xs text-black bg-mint hover:bg-mint/90 py-2 rounded-lg font-bold border border-mint transition-all"
          >
            <span>সকল ঘোষণা দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Editorial Quote Card */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-xl relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-black mb-2">
            <span className="material-symbols-outlined text-[18px] text-neon bg-neon/15 p-1 rounded border border-neon">
              format_quote
            </span>
            <h3 className="text-sm font-bold font-headline text-black">আজকের ভাবনা</h3>
          </div>
          <p className="text-xs text-black italic leading-relaxed font-medium">
            “ভালো মানুষ হওয়াটাই সবচেয়ে বড় উদ্যোক্তা হওয়া। সততাই টেকসই সাফল্যের একমাত্র পথ।”
          </p>
          <span className="block text-xs text-black mt-2 text-right font-mono font-bold">
            — ইকবাল বাহার জাহিদ
          </span>
        </div>

        {/* Quick Resource Shortcuts */}
        <div className="bg-white border border-[#e5e7eb] p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-bold text-black uppercase tracking-wider mb-2 px-1">
            গুরুত্বপূর্ণ লিংক
          </span>
          <Link
            href="/sessions"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-lime/30 border border-transparent hover:border-[#e5e7eb] text-black text-xs font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>৯০ দিনের সেশন সিলেবাস</span>
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <a
            href="https://facebook.com/groups/nijerbolarmotogolpo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-lime/30 border border-transparent hover:border-[#e5e7eb] text-black text-xs font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              <span>কমিউনিটি আচরণবিধি</span>
            </span>
            <ChevronRight className="w-4 h-4" />
          </a>
          <Link
            href="/profile"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-lime/30 border border-transparent hover:border-[#e5e7eb] text-black text-xs font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              <span>সহায়তা কেন্দ্র ও হেল্পডেস্ক</span>
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
