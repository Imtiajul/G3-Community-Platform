import React from "react";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { MemberNavbar } from "@/components/shared/MemberNavbar";
import { MemberLeftSidebar, MemberMobileBottomNav } from "@/components/shared/MemberSidebar";
import { MemberRightAside } from "@/components/shared/MemberRightAside";
import { NotificationsClient, NotificationItem } from "./NotificationsClient";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "বিজ্ঞপ্তি ও নোটিফিকেশন | নিজের বলার মতো একটা গল্প",
  description: "কমিউনিটির সর্বশেষ আপডেট, সেশন ঘোষণা এবং বার্তা।",
};

async function getNotifications(): Promise<NotificationItem[] | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/notifications/`, {
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
          id: item.id,
          type: item.type || "announcement",
          title: item.title,
          description: item.message || item.description || "",
          created_at: formatDateBn(item.created_at || new Date()),
          is_read: item.is_read ?? false,
          link: item.url || "/feed",
        }));
      }
    }
  } catch {
    // Fallback handled by client component
  }

  return undefined;
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const initialNotifications = await getNotifications();

  return (
    <>
      <MemberNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 pt-16 bg-white font-bangla min-h-screen">
        {/* Left Sidebar */}
        <MemberLeftSidebar />

        {/* Central Notifications Column */}
        <main className="flex-1 max-w-[760px] mx-auto w-full py-6 pb-20 lg:pb-8 min-h-[calc(100vh-4rem)]">
          <NotificationsClient initialNotifications={initialNotifications} />
        </main>

        {/* Right Aside */}
        <MemberRightAside />
      </div>

      {/* Mobile Bottom Navigation */}
      <MemberMobileBottomNav />
    </>
  );
}
