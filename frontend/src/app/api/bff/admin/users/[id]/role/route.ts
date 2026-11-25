import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/env";

interface Params {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "অননুমোদিত।" }, { status: 401 });
  }

  const { role } = await request.json().catch(() => ({}));
  const endpoint =
    role === "moderator"
      ? `${env.DJANGO_INTERNAL_API_URL}/admin/users/${params.id}/assign-moderator/`
      : `${env.DJANGO_INTERNAL_API_URL}/admin/users/${params.id}/revoke-moderator/`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
