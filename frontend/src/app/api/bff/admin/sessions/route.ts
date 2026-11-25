import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/community/sessions/?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({ results: [] }));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/community/sessions/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
