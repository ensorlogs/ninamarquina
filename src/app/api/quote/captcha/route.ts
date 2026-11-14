import { NextResponse } from "next/server";
import { newChallenge } from "@/lib/captcha";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export function GET(request: Request) {
  if (!rateLimit(`captcha:${clientIp(request)}`, 30)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const { question, token } = newChallenge();
  return NextResponse.json({ question, token }, { headers: { "Cache-Control": "no-store" } });
}
