import { REVALIDATE_KEY } from "@/lib/recipes";
import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

// This API route can be called to manually trigger revalidation
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  // Check for a valid secret to prevent unauthorized revalidations
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  await kv.set(REVALIDATE_KEY, true); // Set the revalidate flag in KV store

  // Revalidate the home page
  revalidatePath("/");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
