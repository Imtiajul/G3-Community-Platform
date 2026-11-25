import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <>
      <PublicNavbar />
      <main className="w-full pt-16 flex-grow flex items-center justify-center font-bangla min-h-[75vh] px-4">
        <div className="max-w-md w-full bg-white border border-[#e5e7eb] rounded-xl p-8 sm:p-10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-xl bg-neon/15 border border-neon flex items-center justify-center mx-auto mb-6 text-dark shadow-sm">
            <ShieldAlert className="w-10 h-10 text-[#FF49D2]" />
          </div>
          <h1 className="text-2xl font-black text-dark mb-2 font-space-grotesk">
            আপনার প্রবেশাধিকার নেই (৪০৩)
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-bangla">
            এই অংশে প্রবেশের জন্য প্রয়োজনীয় অনুমতি বা ভেরিফিকেশন স্ট্যাটাস আপনার অ্যাকাউন্টে নেই।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="w-full sm:w-auto font-mono font-semibold text-xs uppercase tracking-wider gap-2 bg-mint text-black border border-mint rounded-lg shadow-sm hover:bg-[#72eab0]">
              <Link href="/feed">
                <ArrowLeft className="w-4 h-4" />
                <span>ফিডে ফিরুন</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto font-mono font-semibold text-xs uppercase tracking-wider border border-[#e5e7eb] bg-white text-black rounded-lg shadow-sm hover:bg-neutral-50">
              <Link href="/profile">প্রোফাইল যাচাই অবস্থা</Link>
            </Button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
