import { NextResponse } from "next/server";
import "server-only";
import { extractLead, geminiReply, type ChatMessage } from "@/lib/chat";
import { site } from "@/lib/site";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendBrevo } from "@/lib/magic-link";
import { supabaseAdmin } from "@/lib/supabase-admin";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    messages?: ChatMessage[];
    company?: string;
    startedAt?: number;
    locale?: string;
  };
  if (body.company) return NextResponse.json({ reply: "" });
  if (!rateLimit(`chat:${clientIp(request)}`, 12)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  if (typeof body.startedAt !== "number" || Date.now() - body.startedAt < 3_000) {
    return NextResponse.json({ error: "too_fast" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-14);
  if (!messages.length || messages.at(-1)!.role !== "user") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const reply = await geminiReply(messages);
  if (!reply) return NextResponse.json({ error: "provider_error" }, { status: 502 });

  await captureLead(messages).catch((e) => console.error("[chat] lead", e));
  return NextResponse.json({ reply });
}

/** When the visitor shares an email or phone, store it once and notify Nina. */
async function captureLead(messages: ChatMessage[]) {
  const { email, phone } = extractLead(messages);
  if (!email && !phone) return;
  const db = supabaseAdmin();
  if (!db) return;
  if (email) {
    const { data: existing } = await db.from("chat_leads").select("id").ilike("email", email).limit(1).maybeSingle();
    if (existing) return;
  }
  const transcript = messages.map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  await db.from("chat_leads").insert({ email, phone, transcript });

  if (email) {
    const apiKey = process.env.BREVO_API_KEY;
    const listIds = [process.env.BREVO_QUOTE_LIST_ID].map(Number).filter((n) => n > 0);
    if (apiKey && listIds.length) {
      await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, listIds, updateEnabled: true }),
      }).catch(() => {});
    }
  }

  const rows = transcript
    .map((m) => `<div style="margin:6px 0"><b>${m.role === "user" ? "Visitante" : "Asistente"}:</b> ${esc(m.content)}</div>`)
    .join("");
  await sendBrevo({
    to: [{ email: process.env.QUOTE_NOTIFY_EMAIL ?? site.email }],
    subject: `Nuevo lead del chat · ${email ?? phone ?? "sin contacto"}`,
    htmlContent: `<div style="font-family:sans-serif;max-width:600px"><h2 style="font-family:serif">Lead del chat web</h2><p><b>Email:</b> ${esc(email ?? "—")} · <b>Tel:</b> ${esc(phone ?? "—")}</p><div style="border-top:1px solid #ddd;padding-top:12px">${rows}</div></div>`,
    tags: ["chat-lead"],
  });
}
