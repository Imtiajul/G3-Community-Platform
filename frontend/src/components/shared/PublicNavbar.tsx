"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function PublicNavbar() {
  const pathname = usePathname();
  const user = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e7eb]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="material-symbols-outlined text-black text-[22px] bg-mint border border-[#e5e7eb] p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            auto_stories
          </span>
          <span className="font-headline text-base sm:text-lg font-bold text-black tracking-tight">
            নিজের বলার মতো একটা গল্প
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          <Link
            href="/"
            className={`font-bangla text-sm font-bold transition-all ${
              pathname === "/"
                ? "text-black border-b-2 border-mint pb-0.5"
                : "text-black hover:bg-lime/30 px-2.5 py-1 rounded-lg"
            }`}
          >
            হোম
          </Link>
          <Link
            href="/sessions"
            className={`font-bangla text-sm font-bold transition-all ${
              pathname.startsWith("/sessions")
                ? "text-black border-b-2 border-mint pb-0.5"
                : "text-black hover:bg-lime/30 px-2.5 py-1 rounded-lg"
            }`}
          >
            সেশনসমূহ
          </Link>
          {user && (
            <>
              <Link
                href="/feed"
                className={`font-bangla text-sm font-bold transition-all ${
                  pathname === "/feed"
                    ? "text-black border-b-2 border-mint pb-0.5"
                    : "text-black hover:bg-lime/30 px-2.5 py-1 rounded-lg"
                }`}
              >
                ফিড
              </Link>
              <Link
                href="/saved"
                className={`font-bangla text-sm font-bold transition-all ${
                  pathname === "/saved"
                    ? "text-black border-b-2 border-mint pb-0.5"
                    : "text-black hover:bg-lime/30 px-2.5 py-1 rounded-lg"
                }`}
              >
                সংরক্ষিত
              </Link>
            </>
          )}
        </nav>

        {/* Auth CTA / User Section */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/feed"
                className="text-xs font-bold font-mono px-3 py-1.5 rounded-lg bg-lime/20 border border-lime text-black"
              >
                ব্যাচ {user.batch || 24}
              </Link>
              <Button asChild size="sm" variant="default" className="font-bold">
                <Link href="/profile">প্রোফাইল</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="font-label-md text-sm font-semibold text-black hover:text-[#005c55] transition-colors tracking-wide px-2 py-1"
              >
                লগইন
              </Link>
              <Button asChild size="default" variant="primary" className="font-bold h-10 px-5 rounded-lg">
                <Link href="/register">নিবন্ধন করুন</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[#e5e7eb] text-black hover:bg-lime/30 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#e5e7eb] px-4 pt-3 pb-5 space-y-3 font-bangla animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-black py-2 px-3 rounded-lg hover:bg-lime/30"
          >
            হোম
          </Link>
          <Link
            href="/sessions"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-black py-2 px-3 rounded-lg hover:bg-lime/30"
          >
            সেশনসমূহ
          </Link>
          {user ? (
            <>
              <Link
                href="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-black py-2 px-3 rounded-lg hover:bg-lime/30"
              >
                ফিড
              </Link>
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-black py-2 px-3 rounded-lg hover:bg-lime/30"
              >
                সংরক্ষিত
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-black py-2 px-3 rounded-lg bg-mint"
              >
                আমার প্রোফাইল
              </Link>
            </>
          ) : (
            <div className="pt-2 border-t border-[#e5e7eb] flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full justify-center font-bold">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  লগইন
                </Link>
              </Button>
              <Button asChild variant="primary" className="w-full justify-center font-bold">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  বিনামূল্যে নিবন্ধন করুন
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
