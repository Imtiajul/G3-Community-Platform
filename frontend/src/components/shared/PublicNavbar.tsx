"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Search, User as UserIcon, Menu, X } from "lucide-react";

export function PublicNavbar() {
  const pathname = usePathname();
  const user = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="material-symbols-outlined text-foreground text-[24px] group-hover:scale-105 transition-transform">
            auto_stories
          </span>
          <span className="font-bangla text-base sm:text-lg font-bold text-foreground tracking-tight">
            নিজের বলার মতো একটা গল্প
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          <Link
            href="/"
            className={`font-bangla text-sm font-medium transition-colors ${
              pathname === "/" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            হোম
          </Link>
          <Link
            href="/sessions"
            className={`font-bangla text-sm font-medium transition-colors ${
              pathname.startsWith("/sessions") ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            সেশনসমূহ
          </Link>
          {user && (
            <>
              <Link
                href="/feed"
                className={`font-bangla text-sm font-medium transition-colors ${
                  pathname === "/feed" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ফিড
              </Link>
              <Link
                href="/saved"
                className={`font-bangla text-sm font-medium transition-colors ${
                  pathname === "/saved" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                সংরক্ষিত
              </Link>
              <Link
                href="/my-notes"
                className={`font-bangla text-sm font-medium transition-colors ${
                  pathname === "/my-notes" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                আমার নোটস
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
                {user.first_name?.[0] || user.full_name?.[0] || "স"}
              </div>
              <span className="hidden sm:inline font-bangla">{user.first_name || user.full_name || "প্রোফাইল"}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="font-bangla text-sm text-foreground/80 hover:text-foreground font-medium px-3 py-2 transition-colors"
              >
                লগইন
              </Link>
              <Button asChild size="sm" className="font-bangla font-semibold">
                <Link href="/register">যুক্ত হোন</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden p-2 text-foreground rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-3 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium font-bangla text-foreground hover:text-primary"
          >
            হোম
          </Link>
          <Link
            href="/sessions"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium font-bangla text-foreground hover:text-primary"
          >
            সেশনসমূহ
          </Link>
          {user ? (
            <>
              <Link
                href="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium font-bangla text-foreground hover:text-primary"
              >
                ফিড
              </Link>
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium font-bangla text-foreground hover:text-primary"
              >
                সংরক্ষিত
              </Link>
              <Link
                href="/my-notes"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium font-bangla text-foreground hover:text-primary"
              >
                আমার নোটস
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium font-bangla text-foreground hover:text-primary"
              >
                প্রোফাইল ও সেটিংস
              </Link>
            </>
          ) : (
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium font-bangla text-center border border-border rounded-lg"
              >
                লগইন করুন
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium font-bangla text-center bg-foreground text-background rounded-lg font-bold"
              >
                বিনামূল্যে নিবন্ধন
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
