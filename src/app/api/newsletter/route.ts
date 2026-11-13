import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientIp(request)}`, 5)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const { email, locale } = (await request.json().catch(() => ({}))) as { email?: string; locale?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);

  if (!apiKey || !listId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[newsletter] Brevo not configured; simulated subscription for", email);
      return NextResponse.json({ ok: true, simulated: true });
    }
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes: { LANGUAGE: locale === "en" ? "EN" : "ES" },
    }),
  });

  if (!res.ok && res.status !== 204) {
    console.error("[newsletter] Brevo error", res.status, await res.text());
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
