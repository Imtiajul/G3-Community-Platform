import React from "react";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "পরিসংখ্যান ও অ্যানালিটিক্স | নিজের বলার মতো একটা গল্প",
  description: "প্ল্যাটফর্মের প্রবৃদ্ধি, সেশন এনগেজমেন্ট এবং ব্যাচ বিশ্লেষণের মেট্রিক্স।",
};

async function getAnalyticsData() {
  const token = await getAccessToken();
  if (!token) return undefined;

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/admin/analytics/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful
  }

  return undefined;
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsData();

  return <AnalyticsClient initialAnalytics={analytics} />;
}
