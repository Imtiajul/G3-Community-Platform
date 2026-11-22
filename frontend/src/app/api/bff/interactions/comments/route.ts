import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ detail: "Slug আবশ্যক।" }, { status: 400 });
  }

  const token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/sessions/${slug}/comments/`, {
    headers,
    cache: "no-store",
  });

  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  const { slug, content, parent } = await request.json();
  if (!slug || !content) {
    return NextResponse.json({ detail: "মন্তব্য প্রদান করুন।" }, { status: 400 });
  }

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/sessions/${slug}/comments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, parent: parent || null }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
