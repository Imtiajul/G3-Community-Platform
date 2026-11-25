import React from "react";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { SessionsManagerClient, SessionRow } from "./SessionsManagerClient";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "সেশনস ম্যানেজার | নিজের বলার মতো একটা গল্প",
  description: "সেশনসমূহের প্রকাশনা তালিকা, শিডিউল ও ড্রাফট পরিচালনা।",
};

async function getAdminSessions(): Promise<SessionRow[] | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/community/sessions/`, {
      headers: { Authorization: `Bearer ${token}` },
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
            (item.content ? item.content.slice(0, 120) + "..." : "সেশনের বিস্তারিত বিবরণ..."),
          batch: item.batch_number || item.batch || 1,
          session_number: item.session_number || 1,
          date_formatted: formatDateBn(item.date || item.created_at || new Date()),
          time_formatted: "সন্ধ্যা ৭:৩০ মি.",
          status: item.status || "published",
          likes_count: item.like_count ?? 0,
          comments_count: item.comment_count ?? 0,
        }));
      }
    }
  } catch {
    // Graceful fallback
  }

  return undefined;
}

export default async function AdminSessionsPage() {
  const initialSessions = await getAdminSessions();

  return <SessionsManagerClient initialSessions={initialSessions} />;
}
