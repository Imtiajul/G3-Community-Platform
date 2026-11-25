import React from "react";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { AdminOverviewClient, AdminAnalyticsData, VerificationApplicant } from "./AdminOverviewClient";

export const metadata: Metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড | নিজের বলার মতো একটা গল্প",
  description: "কমিউনিটি প্ল্যাটফর্ম পরিচালনা ও সামগ্রিক কার্যক্রম পর্যবেক্ষণ।",
};

async function getAdminOverviewData(): Promise<{
  analytics?: AdminAnalyticsData;
  applicants?: VerificationApplicant[];
}> {
  const token = await getAccessToken();
  if (!token) return {};

  let analytics: AdminAnalyticsData | undefined;
  let applicants: VerificationApplicant[] | undefined;

  try {
    const analyticsRes = await fetch(`${env.DJANGO_INTERNAL_API_URL}/admin/analytics/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (analyticsRes.ok) {
      analytics = await analyticsRes.json();
    }
  } catch {
    // Graceful fallback
  }

  try {
    const verRes = await fetch(
      `${env.DJANGO_INTERNAL_API_URL}/accounts/staff/verification-requests/?status=pending`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (verRes.ok) {
      const verData = await verRes.json();
      const results = verData.results || verData;
      if (Array.isArray(results) && results.length > 0) {
        applicants = results.map((item: any) => ({
          id: item.id,
          name: item.user?.full_name || item.user?.first_name || "আবেদনকারী",
          initials: (item.user?.first_name?.[0] || item.user?.full_name?.[0] || "আ"),
          batch: item.batch_number || item.batch || 1,
          reg_no: item.registration_no || "REG-PENDING",
          email: item.user?.email || "",
          district: "বাংলাদেশ",
          track: item.batch_name || "উদ্যোক্তা তৈরি ও নৈতিক শিক্ষা",
          matched: item.roster_match ?? true,
        }));
      }
    }
  } catch {
    // Graceful fallback
  }

  return { analytics, applicants };
}

export default async function AdminOverviewPage() {
  const { analytics, applicants } = await getAdminOverviewData();

  return (
    <AdminOverviewClient
      initialAnalytics={analytics}
      initialApplicants={applicants}
    />
  );
}
