import "server-only";
import { cache } from "react";
import { getAccessToken, getRefreshToken, setAuthCookies, clearAuthCookies } from "./session";
import { env } from "@/lib/env";
import type { User } from "./types";

/**
 * Request-memoized server helper to fetch currently logged-in user.
 * Automatically performs token refresh if token expired.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  let token = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!token && !refreshToken) {
    return null;
  }

  // Attempt to fetch with current access token
  if (token) {
    try {
      const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/accounts/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          profile_picture_url: data.profile_picture_url,
          role: data.role || "member",
          email_verified: Boolean(data.email_verified),
          batch: data.batch,
          registration_no: data.registration_no,
          verification_status: data.verification_status || "unverified",
          is_staff: data.role === "admin" || data.role === "moderator",
        };
      }
    } catch {
      // Network error or invalid token
    }
  }

  // If access token failed/expired and refresh token is present, attempt single-flight refresh
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${env.DJANGO_INTERNAL_API_URL}/accounts/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
        cache: "no-store",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.access;
        const newRefreshToken = refreshData.refresh || refreshToken;

        await setAuthCookies(newAccessToken, newRefreshToken);

        // Retry /accounts/me/ with new token
        const retryRes = await fetch(`${env.DJANGO_INTERNAL_API_URL}/accounts/me/`, {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
          cache: "no-store",
        });

        if (retryRes.ok) {
          const data = await retryRes.json();
          return {
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            profile_picture_url: data.profile_picture_url,
            role: data.role || "member",
            email_verified: Boolean(data.email_verified),
            batch: data.batch,
            registration_no: data.registration_no,
            verification_status: data.verification_status || "unverified",
            is_staff: data.role === "admin" || data.role === "moderator",
          };
        }
      } else {
        await clearAuthCookies();
      }
    } catch {
      await clearAuthCookies();
    }
  }

  return null;
});
