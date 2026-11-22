import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE } from "@/lib/auth/session";
import { sanitizeRedirectPath } from "@/lib/utils";

// Protected routes requiring authentication
const PROTECTED_PREFIXES = [
  "/feed",
  "/saved",
  "/my-notes",
  "/profile",
  "/notifications",
  "/admin",
];

// Auth-only routes (redirect away if already logged in)
const AUTH_PREFIXES = ["/login", "/register", "/password-reset"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isAuthenticated = Boolean(accessToken || refreshToken);

  // 1. Root redirect: If logged in, "/" redirects to "/feed"
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
    return NextResponse.next();
  }

  // 2. Auth routes: If logged in, redirect to next or /feed
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAuthRoute && isAuthenticated) {
    const rawNext = request.nextUrl.searchParams.get("next");
    const safeNext = sanitizeRedirectPath(rawNext, "/feed");
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  // 3. Protected routes: If not logged in, redirect to /login with sanitized next
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    const fullPath = `${pathname}${search}`;
    loginUrl.searchParams.set("next", sanitizeRedirectPath(fullPath, "/feed"));
    return NextResponse.redirect(loginUrl);
  }

  // 4. Token refresh attempt in middleware if access token expired but refresh token exists
  if (!accessToken && refreshToken) {
    try {
      const djangoUrl = process.env.DJANGO_INTERNAL_API_URL || "http://localhost:8000/api/v1";
      const refreshRes = await fetch(`${djangoUrl}/accounts/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const response = NextResponse.next();
        response.cookies.set(ACCESS_TOKEN_COOKIE, data.access, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: ACCESS_TOKEN_MAX_AGE,
          path: "/",
        });
        return response;
      }
    } catch {
      // Failed refresh, continue or redirect on protected
      if (isProtectedRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", sanitizeRedirectPath(pathname, "/feed"));
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/feed/:path*",
    "/saved/:path*",
    "/my-notes/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/password-reset/:path*",
  ],
};
