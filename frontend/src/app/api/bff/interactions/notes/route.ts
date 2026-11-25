import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/me/notes/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({ session_notes: [], personal_notes: [] }));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/personal-notes/`, {
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

export async function DELETE(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ detail: "নোট আইডি আবশ্যক।" }, { status: 400 });
  }

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/personal-notes/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
