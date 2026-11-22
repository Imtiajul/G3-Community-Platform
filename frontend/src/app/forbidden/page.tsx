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
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 sm:p-10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6 text-destructive">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            আপনার প্রবেশাধিকার নেই (৪০৩)
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            এই অংশে প্রবেশের জন্য প্রয়োজনীয় অনুমতি বা ভেরিফিকেশন স্ট্যাটাস আপনার অ্যাকাউন্টে নেই।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="w-full sm:w-auto font-bold gap-2">
              <Link href="/feed">
                <ArrowLeft className="w-4 h-4" />
                <span>ফিডে ফিরুন</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto font-medium">
              <Link href="/profile">প্রোফাইল যাচাই অবস্থা</Link>
            </Button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
