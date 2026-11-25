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
      <main className="w-full pt-16 flex-grow flex items-center justify-center font-bangla min-h-[75vh] px-4 bg-white">
        <div className="max-w-md w-full bg-white border border-[#e5e7eb] rounded-2xl p-8 sm:p-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#63DB9A]/20 border border-[#63DB9A] flex items-center justify-center mx-auto mb-6 text-black font-extrabold text-3xl font-headline">
            ৪০৪
          </div>
          <h1 className="text-2xl font-extrabold text-black mb-2 font-headline">
            পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed font-bangla font-normal">
            আপনি যে পৃষ্ঠাটি খুঁজছেন তা মুছে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ রয়েছে।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider gap-2 bg-mint text-black border border-mint rounded-lg hover:bg-[#72eab0]">
              <Link href="/">
                <Home className="w-4 h-4" />
                <span>মূল পাতায় ফিরুন</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto font-semibold text-xs uppercase tracking-wider gap-2 border border-[#e5e7eb] bg-white text-black rounded-lg hover:bg-gray-50">
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
