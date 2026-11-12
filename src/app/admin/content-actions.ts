"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { MEDIA_BUCKET } from "@/lib/content";
import { newsletterEmail } from "@/lib/emails";
import { sendBrevo } from "@/lib/magic-link";
import { site } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function db() {
  await requireAdmin();
  return supabaseAdmin()!;
}

const clean = (v: unknown, n = 300) => String(v ?? "").trim().slice(0, n);

export async function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function refreshSite() {
  revalidatePath("/", "layout");
}

export async function mediaUploadUrls(folder: "journal" | "projects", count: number) {
  const supabase = await db();
  const n = Math.min(Math.max(0, Math.floor(count)), 20);
  return Promise.all(
    Array.from({ length: n }, async () => {
      const path = `${folder === "journal" ? "journal" : "projects"}/${crypto.randomUUID()}.jpg`;
      const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw new Error("upload");
      return { signedUrl: data.signedUrl, publicUrl: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl };
    }),
  );
}

/* ---------------- Journal ---------------- */

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  cover: string | null;
  html: string;
  date: string;
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
};

export async function savePost(id: string | null, input: PostInput): Promise<{ id?: string; error?: string }> {
  const supabase = await db();
  const title = clean(input.title, 200);
  if (!title) return { error: "Falta el título." };
  const slug = (await slugify(input.slug || title)) || crypto.randomUUID().slice(0, 8);
  const words = input.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const row = {
    title,
    slug,
    excerpt: clean(input.excerpt, 600),
    cover: input.cover || null,
    html: input.html.slice(0, 400_000),
    minutes: Math.max(1, Math.round(words / 200)),
    status: input.status === "published" ? "published" : "draft",
    published_at: /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : new Date().toISOString().slice(0, 10),
    seo_title: clean(input.seo_title, 120) || null,
    seo_description: clean(input.seo_description, 300) || null,
    updated_at: new Date().toISOString(),
  };
  const res = id
    ? await supabase.from("posts").update(row).eq("id", id).select("id").single()
    : await supabase.from("posts").insert(row).select("id").single();
  if (res.error) return { error: res.error.code === "23505" ? "Ya existe otro artículo con esa URL. Cambia la URL." : "No se pudo guardar." };
  revalidatePath("/admin/journal");
  refreshSite();
  return { id: res.data.id };
}

export async function deletePost(id: string) {
  const supabase = await db();
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/admin/journal");
  refreshSite();
  redirect("/admin/journal");
}

async function postForEmail(id: string) {
  const supabase = await db();
  const { data } = await supabase.from("posts").select("*").eq("id", id).single();
  return { supabase, post: data };
}

export async function sendPostTest(id: string) {
  const { post } = await postForEmail(id);
  if (!post) return { error: "Artículo no encontrado." };
  const { subject, html } = newsletterEmail(post);
  const bcc = process.env.QUOTE_NOTIFY_CC;
  const ok = await sendBrevo({
    to: [{ email: site.email }],
    ...(bcc ? { bcc: [{ email: bcc }] } : {}),
    subject: `[Prueba] ${subject}`,
    htmlContent: html.replace("{{ unsubscribe }}", site.url),
  });
  return ok ? { ok: true } : { error: "Brevo no aceptó el envío de prueba." };
}

export async function sendPostNewsletter(id: string, lists: ("newsletter" | "quotes")[]) {
  const { supabase, post } = await postForEmail(id);
  if (!post || post.status !== "published") return { error: "Publica el artículo antes de enviarlo." };
  const listIds = [
    ...(lists.includes("newsletter") ? [Number(process.env.BREVO_NEWSLETTER_LIST_ID)] : []),
    ...(lists.includes("quotes") ? [Number(process.env.BREVO_QUOTE_LIST_ID)] : []),
  ].filter(Boolean);
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !listIds.length) return { error: "Elige al menos una lista." };
  const { subject, html } = newsletterEmail(post);
  const headers = { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" };
  const created = await fetch("https://api.brevo.com/v3/emailCampaigns", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: `Journal · ${post.title}`.slice(0, 250),
      subject,
      sender: { name: "Nina Marquina", email: process.env.BREVO_SENDER_EMAIL ?? site.email },
      replyTo: site.email,
      htmlContent: html,
      recipients: { listIds },
    }),
  });
  if (!created.ok) {
    console.error("[newsletter] create", created.status, await created.text());
    return { error: "Brevo no aceptó la campaña." };
  }
  const { id: campaignId } = (await created.json()) as { id: number };
  const sent = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignId}/sendNow`, { method: "POST", headers });
  if (!sent.ok) {
    console.error("[newsletter] sendNow", sent.status, await sent.text());
    return { error: "La campaña se creó en Brevo pero no se pudo enviar. Revísala en Brevo → Campañas." };
  }
  await supabase.from("posts").update({ newsletter_sent_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/journal/${id}`);
  return { ok: true };
}

/* ---------------- Portfolio ---------------- */

type L = { es: string; en: string };
export type ProjectInput = {
  title: string;
  slug: string;
  year: number;
  location: string;
  category: L;
  summary: L;
  images: string[];
  published: boolean;
  details: {
    scope: L;
    facts: { label: L; value: L }[];
    sections: { title: L; body: { es: string[]; en: string[] } }[];
    highlights: L[];
  };
};

const lc = (v: L, n = 2000): L => ({ es: clean(v?.es, n), en: clean(v?.en, n) });

export async function createProject(form: FormData) {
  const supabase = await db();
  const title = clean(form.get("title"), 200);
  if (!title) return;
  const { data: last } = await supabase.from("portfolio_projects").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const base = (await slugify(title)) || "proyecto";
  let slug = base;
  for (let i = 2; (await supabase.from("portfolio_projects").select("id").eq("slug", slug).maybeSingle()).data; i++) slug = `${base}-${i}`;
  const { data } = await supabase
    .from("portfolio_projects")
    .insert({ title, slug, position: (last?.position ?? -1) + 1, published: false })
    .select("id")
    .single();
  revalidatePath("/admin/portfolio");
  redirect(`/admin/portfolio/${data!.id}`);
}

export async function saveProject(id: string, input: ProjectInput): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await db();
  const title = clean(input.title, 200);
  if (!title) return { error: "Falta el título." };
  const slug = (await slugify(input.slug || title)) || "proyecto";
  if (input.published && !input.images.length) return { error: "Añade al menos una foto antes de publicar." };
  const d = input.details;
  const details = {
    scope: lc(d.scope, 200),
    facts: d.facts.map((f) => ({ label: lc(f.label, 80), value: lc(f.value, 120) })).filter((f) => f.label.es || f.label.en),
    sections: d.sections
      .map((s) => ({
        title: lc(s.title, 200),
        body: { es: s.body.es.map((p) => clean(p, 4000)).filter(Boolean), en: s.body.en.map((p) => clean(p, 4000)).filter(Boolean) },
      }))
      .filter((s) => s.title.es || s.body.es.length),
    highlights: d.highlights.map((h) => lc(h, 400)).filter((h) => h.es || h.en),
  };
  const hasDetails = details.scope.es || details.facts.length || details.sections.length || details.highlights.length;
  const { error } = await supabase
    .from("portfolio_projects")
    .update({
      title,
      slug,
      year: Math.min(2100, Math.max(1900, Math.floor(Number(input.year)) || new Date().getFullYear())),
      location: clean(input.location, 120) || null,
      category: lc(input.category, 200),
      summary: lc(input.summary, 3000),
      images: input.images.filter((s) => typeof s === "string" && s).slice(0, 40),
      details: hasDetails ? details : null,
      published: !!input.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.code === "23505" ? "Ya existe otro proyecto con esa URL." : "No se pudo guardar." };
  revalidatePath("/admin/portfolio");
  refreshSite();
  return { ok: true };
}

export async function moveProject(id: string, dir: -1 | 1) {
  const supabase = await db();
  const { data } = await supabase.from("portfolio_projects").select("id,position").order("position");
  const list = data ?? [];
  const i = list.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((p, k) => (p.position === k ? null : supabase.from("portfolio_projects").update({ position: k }).eq("id", p.id))));
  revalidatePath("/admin/portfolio");
  refreshSite();
}

export async function deleteProject(id: string) {
  const supabase = await db();
  await supabase.from("portfolio_projects").delete().eq("id", id);
  revalidatePath("/admin/portfolio");
  refreshSite();
  redirect("/admin/portfolio");
}
