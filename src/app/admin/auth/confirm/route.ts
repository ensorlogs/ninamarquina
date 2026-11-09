import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { homeFor } from "@/lib/portal-auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = (request.nextUrl.searchParams.get("type") ?? "magiclink") as EmailOtpType;
  if (token_hash) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    const home = !error && (await homeFor(data.user?.email));
    if (home) return NextResponse.redirect(new URL(home, request.url));
  }
  return NextResponse.redirect(new URL("/acceso?error=link", request.url));
}
