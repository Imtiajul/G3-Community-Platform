import React from "react";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { MemberNavbar } from "@/components/shared/MemberNavbar";
import { MemberLeftSidebar, MemberMobileBottomNav } from "@/components/shared/MemberSidebar";
import { MemberRightAside } from "@/components/shared/MemberRightAside";
import { SavedListClient, SavedSessionItem } from "./SavedListClient";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "সংরক্ষিত সেশনসমূহ | নিজের বলার মতো একটা গল্প",
  description: "আপনার সংরক্ষিত প্রিয় সেশন ও দিকনির্দেশনা সমাহার।",
};

async function getSavedSessions(): Promise<SavedSessionItem[] | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/me/bookmarks/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.results || data;
      if (Array.isArray(results) && results.length > 0) {
        return results.map((item: any) => ({
          id: item.id || item.slug,
          slug: item.slug,
          title: item.title,
          excerpt:
            item.excerpt ||
            (item.content ? item.content.slice(0, 150) + "..." : "সেশনের বিস্তারিত আলোচনা ও দিকনির্দেশনা..."),
          batch: item.batch_number || item.batch || 24,
          session_number: item.session_number || 1,
          tag:
            Array.isArray(item.tags) && item.tags.length > 0
              ? typeof item.tags[0] === "string"
                ? item.tags[0]
                : item.tags[0].name
              : "উদ্যোগ ও মূল্যবোধ",
          saved_date: formatDateBn(item.date || item.created_at || new Date()),
          speaker: "ইকবাল বাহার জাহিদ",
        }));
      }
    }
  } catch {
    // Fallback handled by client component defaults
  }
  return undefined;
}

export default async function SavedPage() {
  const user = await getCurrentUser();
  const initialSessions = await getSavedSessions();

  return (
    <>
      <MemberNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 pt-16 bg-white font-bangla min-h-screen">
        {/* Left Sidebar */}
        <MemberLeftSidebar />

        {/* Central Saved Column */}
        <main className="flex-1 max-w-[840px] mx-auto w-full py-6 pb-20 lg:pb-8 min-h-[calc(100vh-4rem)]">
          <SavedListClient initialSessions={initialSessions} />
        </main>

        {/* Right Aside */}
        <MemberRightAside />
      </div>

      {/* Mobile Bottom Navigation */}
      <MemberMobileBottomNav />
    </>
  );
}
