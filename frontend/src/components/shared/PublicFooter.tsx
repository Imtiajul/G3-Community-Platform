import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="w-full bg-background border-t border-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Logo & Philosophy */}
          <div className="flex flex-col gap-1.5 max-w-md">
            <span className="font-bangla text-base font-bold text-foreground">
              নিজের বলার মতো একটা গল্প ফাউন্ডেশন
            </span>
            <p className="font-bangla text-sm text-muted-foreground leading-relaxed">
              সততা, মানবিক মূল্যবোধ ও উদ্যোক্তা তৈরির একটি উন্মুক্ত ও অবাণিজ্যিক পাঠশালা।
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-bangla text-sm text-muted-foreground">
            <Link href="/sessions" className="hover:text-foreground transition-colors">
              সেশন আর্কাইভ
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              সদস্য প্রবেশ
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              নিবন্ধন
            </Link>
            <span className="text-border">|</span>
            <span className="text-xs text-muted-foreground">
              ৬৪ জেলা ও প্রবাসী ভাইবোনদের জন্য উন্মুক্ত
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between font-bangla text-xs text-muted-foreground gap-3">
          <span>© ২০২৪–২০২৬ নিজের বলার মতো একটা গল্প ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।</span>
          <span>বিনম্র ও মানবিক বাংলাদেশ গড়ার প্রত্যয়</span>
        </div>
      </div>
    </footer>
  );
}
