import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_token } = body;

    if (!id_token) {
      return NextResponse.json(
        { detail: "Google ID টোকেন অনুপস্থিত।" },
        { status: 400 }
      );
    }

    const response = await fetch(`${env.DJANGO_INTERNAL_API_URL}/accounts/google/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "গুগল সাইন-ইন ব্যর্থ হয়েছে।" },
        { status: response.status }
      );
    }

    if (data.access) {
      await setAuthCookies(data.access, data.refresh);
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { detail: "সার্ভারে ত্রুটি হয়েছে।" },
      { status: 500 }
    );
  }
}
