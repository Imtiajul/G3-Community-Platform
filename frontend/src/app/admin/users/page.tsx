import React from "react";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { UserManagementClient, UserRow } from "./UserManagementClient";
import { formatDateBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ব্যবহারকারী ব্যবস্থাপনা | নিজের বলার মতো একটা গল্প",
  description: "সদস্য তালিকা, রোল ম্যানেজমেন্ট এবং অনুমতি প্রশাসন।",
};

async function getAdminUsers(): Promise<UserRow[] | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;

  try {
    const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/admin/users/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.results || data;
      if (Array.isArray(results) && results.length > 0) {
        return results.map((item: any) => ({
          id: item.id,
          name: item.full_name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || item.email,
          email: item.email,
          role: item.role || "member",
          batch: item.batch_number || item.batch || 1,
          reg_no: item.registration_no || "REG-NONE",
          verification_status: item.verification_status || "unverified",
          joined_date: formatDateBn(item.date_joined || new Date()),
        }));
      }
    }
  } catch {
    // Graceful fallback
  }

  return undefined;
}

export default async function AdminUsersPage() {
  const initialUsers = await getAdminUsers();

  return <UserManagementClient initialUsers={initialUsers} />;
}
