import React from "react";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { MemberNavbar } from "@/components/shared/MemberNavbar";
import { MemberLeftSidebar, MemberMobileBottomNav } from "@/components/shared/MemberSidebar";
import { MemberRightAside } from "@/components/shared/MemberRightAside";
import { SavedListClient } from "./SavedListClient";

export const metadata: Metadata = {
  title: "সংরক্ষিত সেশনসমূহ | নিজের বলার মতো একটা গল্প",
  description: "আপনার সংরক্ষিত প্রিয় সেশন ও দিকনির্দেশনা সমাহার।",
};

export default async function SavedPage() {
  const user = await getCurrentUser();

  return (
    <>
      <MemberNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 pt-16 bg-background font-bangla min-h-screen">
        {/* Left Sidebar */}
        <MemberLeftSidebar />

        {/* Central Saved Column */}
        <main className="flex-1 max-w-[840px] mx-auto w-full py-6 pb-20 lg:pb-8 min-h-[calc(100vh-4rem)]">
          <SavedListClient />
        </main>

        {/* Right Aside */}
        <MemberRightAside />
      </div>

      {/* Mobile Bottom Navigation */}
      <MemberMobileBottomNav />
    </>
  );
}
