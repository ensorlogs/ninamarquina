import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { loginEmail } from "@/lib/emails";
import { site } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  const normalized = (email ?? "").trim().toLowerCase();
  // Always answer ok so the endpoint doesn't reveal which emails are admins
  if (!isAdminEmail(normalized)) return NextResponse.json({ ok: true });

  const supabase = supabaseAdmin();
  const apiKey = process.env.BREVO_API_KEY;
  if (!supabase || !apiKey) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { data, error } = await supabase.auth.admin.generateLink({ type: "magiclink", email: normalized });
  if (error || !data.properties?.hashed_token) {
    console.error("[admin-login] generateLink failed", error);
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
  const origin = new URL(request.url).origin;
  const base = process.env.NODE_ENV === "production" ? site.url : origin;
  const link = `${base}/admin/auth/confirm?token_hash=${data.properties.hashed_token}&type=magiclink`;
  const mail = loginEmail(link);
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Nina Marquina", email: process.env.BREVO_SENDER_EMAIL ?? site.email },
      to: [{ email: normalized }],
      subject: mail.subject,
      htmlContent: mail.html,
      tags: ["admin-login"],
    }),
  });
  if (!res.ok) {
    console.error("[admin-login] brevo error", res.status, await res.text());
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
