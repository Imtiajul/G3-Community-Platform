import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="w-full bg-white border-t border-[#e5e7eb] py-8 mt-12 font-bangla">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2 text-black font-medium">
          <span className="material-symbols-outlined text-[18px] text-black">verified</span>
          <span className="text-xs tracking-wide font-semibold">
            নৈতিক নেতৃত্ব ও উদ্যোক্তা তৈরির উন্মুক্ত কর্মশালা প্ল্যাটফর্ম
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-600 font-medium">
          <Link href="/sessions" className="hover:text-black hover:underline">
            সেশনসমূহ
          </Link>
          <span>•</span>
          <Link href="/login" className="hover:text-black hover:underline">
            প্রবেশ
          </Link>
          <span>•</span>
          <span>© নিজের বলার মতো একটা গল্প ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।</span>
        </div>
      </div>
    </footer>
  );
}
