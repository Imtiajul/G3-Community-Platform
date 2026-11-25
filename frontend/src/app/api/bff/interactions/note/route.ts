import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ detail: "Slug আবশ্যক।" }, { status: 400 });
  }

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/sessions/${slug}/note/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const { slug, content } = await request.json().catch(() => ({}));
  if (!slug) {
    return NextResponse.json({ detail: "Slug আবশ্যক।" }, { status: 400 });
  }

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/sessions/${slug}/note/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = body.slug;
  if (!slug) {
    return NextResponse.json({ detail: "Slug আবশ্যক।" }, { status: 400 });
  }

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/interactions/sessions/${slug}/note/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return NextResponse.json({ success: res.ok }, { status: res.status });
}
