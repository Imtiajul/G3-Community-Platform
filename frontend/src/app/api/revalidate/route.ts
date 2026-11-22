import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!secret) {
    return NextResponse.json({ message: "Secret token is required" }, { status: 401 });
  }

  // Constant-time comparison to prevent timing attacks
  const secretBuffer = Buffer.from(secret);
  const expectedBuffer = Buffer.from(env.NEXTJS_REVALIDATE_SECRET);

  if (
    secretBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(secretBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { slug, path, tag } = body;

    if (slug) {
      revalidatePath(`/sessions/${slug}`);
      revalidateTag(`session-${slug}`);
    }
    if (path) {
      revalidatePath(path);
    }
    if (tag) {
      revalidateTag(tag);
    }

    // Always revalidate sessions directory and landing
    revalidatePath("/sessions");
    revalidatePath("/");
    revalidateTag("sessions");
    revalidateTag("landing");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 }
    );
  }
}
