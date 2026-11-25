import React from "react";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { VerificationDeskClient, ApplicantDetail } from "./VerificationDeskClient";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "যাচাইয়ের আবেদন ডেক্স | নিজের বলার মতো একটা গল্প",
  description: "সদস্যদের প্রোফাইল যাচাইকরণ ও অনুমোদন প্রক্রিয়া পরিচালনা।",
};

async function getVerificationRequests(): Promise<ApplicantDetail[] | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;

  try {
    const res = await fetch(
      `${env.DJANGO_INTERNAL_API_URL}/accounts/staff/verification-requests/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      const results = data.results || data;
      if (Array.isArray(results) && results.length > 0) {
        return results.map((item: any) => ({
          id: item.id,
          name: item.user?.full_name || item.user?.first_name || "আবেদনকারী",
          initials: (item.user?.first_name?.[0] || item.user?.full_name?.[0] || "আ"),
          email: item.user?.email || "",
          phone: "০১৭১২-০০০০০০",
          batch: item.batch_number || item.batch || 1,
          reg_no: item.registration_no || "REG-PENDING",
          district: "বাংলাদেশ",
          profession: item.batch_name || "উদ্যোক্তা তৈরি ও নৈতিক শিক্ষা",
          submitted_at: formatDateBn(item.submitted_at || new Date()),
          matched_roster: item.roster_match ?? true,
          status: item.status || "pending",
        }));
      }
    }
  } catch {
    // Graceful fallback
  }

  return undefined;
}

export default async function AdminVerificationPage() {
  const initialApplicants = await getVerificationRequests();

  return <VerificationDeskClient initialApplicants={initialApplicants} />;
}
