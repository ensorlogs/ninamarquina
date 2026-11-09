import { NextResponse } from "next/server";
import { formatLocation, type QuoteInput, validateQuote } from "@/lib/quote";
import { site } from "@/lib/site";
import { clientQuoteEmail, internalQuoteEmail, type QuoteRow } from "@/lib/emails";
import { QUOTE_BUCKET, supabaseAdmin } from "@/lib/supabase-admin";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(request: Request) {
  const q = (await request.json().catch(() => ({}))) as Partial<QuoteInput>;
  if (q.company) return NextResponse.json({ ok: true });

  const invalid = validateQuote(q);
  if (invalid) return NextResponse.json({ error: "invalid", field: invalid }, { status: 400 });

  const row = {
    locale: q.locale === "en" ? "en" : "es",
    service: q.service,
    property_type: q.propertyType,
    property_status: q.propertyStatus || null,
    area_m2: Number(q.area) > 0 ? Math.min(Number(q.area), 1_000_000) : null,
    location: formatLocation({ country: q.country!, city: q.city ?? "", cityOther: q.cityOther ?? "" }),
    zone: clip(q.zone, 120) || null,
    needs: q.needs,
    description: clip(q.description, 4000) || null,
    budget: q.budget,
    timeline: q.timeline,
    links: clip(q.links, 2000)
      .split(/\s+/)
      .filter((l) => /^https?:\/\//.test(l))
      .slice(0, 10),
    files: q.files,
    name: clip(q.name, 120),
    email: clip(q.email, 160).toLowerCase(),
    phone: clip(q.phone, 40),
    contact_pref: q.contactPref ?? "whatsapp",
    source: "web",
  };

  const supabase = supabaseAdmin();
  if (!supabase) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[quote] Supabase not configured; simulated request", row);
      return NextResponse.json({ ok: true, simulated: true });
    }
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { data, error } = await supabase.from("quote_requests").insert(row).select("id").single();
  if (error) {
    console.error("[quote] insert failed", error);
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }

  await syncContact(row as QuoteRow, q.newsletter !== false).catch((e) => console.error("[quote] contact sync failed", e));
  await notify(supabase, row as QuoteRow, data.id).catch((e) => console.error("[quote] notify failed", e));
  return NextResponse.json({ ok: true, id: data.id });
}

async function notify(supabase: NonNullable<ReturnType<typeof supabaseAdmin>>, row: QuoteRow, id: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;
  const sender = { name: "Nina Marquina", email: process.env.BREVO_SENDER_EMAIL ?? site.email };
  const to = process.env.QUOTE_NOTIFY_EMAIL ?? site.email;
  const bcc = (process.env.QUOTE_NOTIFY_CC ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

  let fileUrls: { name: string; url: string }[] = [];
  if (row.files.length) {
    const { data } = await supabase.storage.from(QUOTE_BUCKET).createSignedUrls(row.files, 60 * 60 * 24 * 7);
    fileUrls = (data ?? [])
      .filter((f) => f.signedUrl)
      .map((f, i) => ({ name: `Archivo ${String(i + 1).padStart(2, "0")} · ${f.path?.split(".").pop()?.toUpperCase()}`, url: f.signedUrl as string }));
  }

  const send = async (body: object) => {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ sender, ...body }),
    });
    if (!res.ok) console.error("[quote] brevo error", res.status, await res.text());
  };

  const internal = internalQuoteEmail(row, id, fileUrls);
  const client = clientQuoteEmail(row);
  await Promise.all([
    send({
      to: [{ email: to }],
      ...(bcc.length ? { bcc } : {}),
      replyTo: { email: row.email, name: row.name },
      subject: internal.subject,
      htmlContent: internal.html,
      tags: ["quote-internal"],
    }),
    send({
      to: [{ email: row.email, name: row.name }],
      ...(bcc.length ? { bcc } : {}),
      replyTo: { email: site.email, name: "Nina Marquina" },
      subject: client.subject,
      htmlContent: client.html,
      tags: ["quote-client"],
    }),
  ]);
}

async function syncContact(row: QuoteRow, newsletter: boolean) {
  const apiKey = process.env.BREVO_API_KEY;
  const listIds = [process.env.BREVO_QUOTE_LIST_ID, newsletter ? process.env.BREVO_NEWSLETTER_LIST_ID : undefined]
    .map(Number)
    .filter((n) => n > 0);
  if (!apiKey || !listIds.length) return;
  const [first, ...rest] = row.name.split(" ");
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: row.email,
      listIds,
      updateEnabled: true,
      attributes: { NOMBRE: first, APELLIDOS: rest.join(" ") },
    }),
  });
  if (!res.ok && res.status !== 204) console.error("[quote] Brevo contact error", res.status, await res.text());
}
