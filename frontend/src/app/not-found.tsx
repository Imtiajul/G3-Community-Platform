import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <PublicNavbar />
      <main className="w-full pt-16 flex-grow flex items-center justify-center font-bangla min-h-[75vh] px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 sm:p-10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-6 text-foreground font-extrabold text-2xl">
            ৪০৪
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            আপনি যে পৃষ্ঠাটি খুঁজছেন তা মুছে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ রয়েছে।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="w-full sm:w-auto font-bold gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                <span>মূল পাতায় ফিরুন</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto font-medium gap-2">
              <Link href="/sessions">
                <ArrowLeft className="w-4 h-4" />
                <span>সেশন তালিকা</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
