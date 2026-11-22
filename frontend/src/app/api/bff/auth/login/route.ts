import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক।" },
        { status: 400 }
      );
    }

    const response = await fetch(`${env.DJANGO_INTERNAL_API_URL}/accounts/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড যাচাই করুন।" },
        { status: response.status }
      );
    }

    // Set secure HttpOnly cookies
    if (data.access) {
      await setAuthCookies(data.access, data.refresh);
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { detail: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
