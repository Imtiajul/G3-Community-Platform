import { NextResponse } from "next/server";
import { getRefreshToken, getAccessToken, clearAuthCookies } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function POST() {
  const token = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (token && refreshToken) {
    try {
      await fetch(`${env.DJANGO_INTERNAL_API_URL}/accounts/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch {
      // Ignore network errors on backend logout
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ success: true });
}
