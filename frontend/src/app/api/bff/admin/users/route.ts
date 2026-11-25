import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/admin/users/?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({ results: [] }));
  return NextResponse.json(data, { status: res.status });
}
