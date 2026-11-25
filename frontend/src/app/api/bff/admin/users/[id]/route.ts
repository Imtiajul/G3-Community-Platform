import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

interface Params {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/admin/users/${params.id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const res = await fetch(`${env.DJANGO_INTERNAL_API_URL}/admin/users/${params.id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
