import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  const { slug } = await request.json();
  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/sessions/${slug}/like/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  const { slug } = await request.json();
  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/sessions/${slug}/like/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
