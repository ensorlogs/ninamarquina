import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { loginEmail } from "@/lib/emails";
import { magicLink, sendBrevo } from "@/lib/magic-link";
import { findPortalClient } from "@/lib/portal-auth";

export async function POST(request: Request) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  const normalized = (email ?? "").trim().toLowerCase();
  const admin = isAdminEmail(normalized);
  // Always answer ok so the endpoint doesn't reveal which emails have access
  if (!admin && !(await findPortalClient(normalized))) return NextResponse.json({ ok: true });

  const link = await magicLink(normalized, new URL(request.url).origin);
  if (!link) return NextResponse.json({ error: "provider_error" }, { status: 502 });
  const mail = loginEmail(link, !admin);
  const ok = await sendBrevo({
    to: [{ email: normalized }],
    subject: mail.subject,
    htmlContent: mail.html,
    tags: [admin ? "admin-login" : "portal-login"],
  });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "provider_error" }, { status: 502 });
}
