import React from "react";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { MemberNavbar } from "@/components/shared/MemberNavbar";
import { MemberLeftSidebar, MemberMobileBottomNav } from "@/components/shared/MemberSidebar";
import { MemberRightAside } from "@/components/shared/MemberRightAside";
import { MyNotesClient, SessionNoteItem } from "./MyNotesClient";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "আমার ব্যক্তিগত নোট | নিজের বলার মতো একটা গল্প",
  description: "সেশনের ব্যক্তিগত নোট এবং চিন্তাভাবনা লিখে রাখার নিরাপদ স্থান।",
};

async function getNotesData(): Promise<{
  sessionNotes?: SessionNoteItem[];
  generalNote?: string;
}> {
  const token = await getAccessToken();
  if (!token) return {};

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/me/notes/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      let sessionNotes: SessionNoteItem[] | undefined;
      let generalNote: string | undefined;

      if (Array.isArray(data.session_notes) && data.session_notes.length > 0) {
        sessionNotes = data.session_notes.map((n: any) => ({
          id: n.id,
          slug: n.session_slug,
          session_title: n.session_title,
          session_number: n.session_number || 1,
          content: n.content,
          updated_at: formatDateBn(n.updated_at || n.created_at || new Date()),
          tags: ["ব্যক্তিগত_নোট"],
          is_pinned: false,
        }));
      }

      if (Array.isArray(data.personal_notes) && data.personal_notes.length > 0) {
        generalNote = data.personal_notes[0].content;
      }

      return { sessionNotes, generalNote };
    }
  } catch {
    // Fallback handled by client component
  }

  return {};
}

export default async function MyNotesPage() {
  const user = await getCurrentUser();
  const { sessionNotes, generalNote } = await getNotesData();

  return (
    <>
      <MemberNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 pt-16 bg-white font-bangla min-h-screen">
        {/* Left Sidebar */}
        <MemberLeftSidebar />

        {/* Central Notes Column */}
        <main className="flex-1 max-w-[840px] mx-auto w-full py-6 pb-20 lg:pb-8 min-h-[calc(100vh-4rem)]">
          <MyNotesClient
            initialSessionNotes={sessionNotes}
            initialGeneralNote={generalNote}
          />
        </main>

        {/* Right Aside */}
        <MemberRightAside />
      </div>

      {/* Mobile Bottom Navigation */}
      <MemberMobileBottomNav />
    </>
  );
}
