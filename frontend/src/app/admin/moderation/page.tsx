import React from "react";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { ModerationDeskClient, ReportedComment } from "./ModerationDeskClient";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "মন্তব্য মডারেশন | নিজের বলার মতো একটা গল্প",
  description: "কমিউনিটি নির্দেশিকা পরিপন্থী রিপোর্টকৃত মন্তব্যের নিষ্পত্তি ও নিয়ন্ত্রণ।",
};

async function getCommentReports(): Promise<ReportedComment[] | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/staff/comment-reports/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.results || data;
      if (Array.isArray(results) && results.length > 0) {
        return results.map((item: any) => ({
          id: item.id,
          comment_text: item.comment?.content || "রিপোর্টকৃত মন্তব্য সামগ্রী",
          author_name: item.comment?.author_name || "সদস্য",
          author_batch: item.comment?.author_batch || 1,
          session_title: item.comment?.session_title || "সেশন আলোচনা",
          session_slug: item.comment?.session_slug || "session-discussion",
          report_reason: item.reason || "কমিউনিটি নির্দেশিকা পরিপন্থী আচরণ",
          reported_by: item.reporter_name || "সতর্ক সদস্য",
          report_count: item.report_count || 1,
          created_at: formatDateBn(item.created_at || new Date()),
        }));
      }
    }
  } catch {
    // Graceful fallback
  }

  return undefined;
}

export default async function AdminModerationPage() {
  const initialReports = await getCommentReports();

  return <ModerationDeskClient initialReports={initialReports} />;
}
