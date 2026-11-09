"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { REQUEST_STATUS } from "@/lib/admin-labels";
import { opt } from "@/lib/admin-labels";
import { DEFAULT_PHASES } from "@/lib/admin-labels";
import { budgetEmail, portalEmail } from "@/lib/emails";
import { magicLink, sendBrevo } from "@/lib/magic-link";
import { PROJECT_BUCKET } from "@/lib/portal-data";
import { budgetUrl } from "@/lib/budget";
import { site } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";

async function db() {
  await requireAdmin();
  return supabaseAdmin()!;
}
const str = (f: FormData, k: string, n = 4000) => String(f.get(k) ?? "").trim().slice(0, n) || null;

export async function signOut() {
  await (await supabaseServer()).auth.signOut();
  redirect("/acceso");
}

export async function updateRequest(id: string, form: FormData) {
  const supabase = await db();
  const status = String(form.get("status"));
  await supabase
    .from("quote_requests")
    .update({ status: status in REQUEST_STATUS ? status : "new", notes: str(form, "notes"), updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/solicitudes/${id}`);
  revalidatePath("/admin/solicitudes");
}

export async function convertRequest(id: string) {
  const supabase = await db();
  const { data: r } = await supabase.from("quote_requests").select("*").eq("id", id).single();
  if (!r) return;
  let clientId = r.client_id as string | null;
  if (!clientId) {
    const { data: existing } = await supabase.from("clients").select("id").eq("email", r.email).maybeSingle();
    clientId =
      existing?.id ??
      (
        await supabase
          .from("clients")
          .insert({ name: r.name, email: r.email, phone: r.phone, location: [opt("location", r.location), r.zone].filter(Boolean).join(" · ") })
          .select("id")
          .single()
      ).data!.id;
  }
  let projectId = r.project_id as string | null;
  if (!projectId) {
    const { data: p } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        request_id: id,
        title: `${opt("service", r.service)} · ${r.name}`,
        service: r.service,
        location: [opt("location", r.location), r.zone].filter(Boolean).join(" · "),
        notes: r.description,
      })
      .select("id")
      .single();
    projectId = p!.id;
  }
  await supabase.from("quote_requests").update({ client_id: clientId, project_id: projectId, status: "won" }).eq("id", id);
  revalidatePath(`/admin/solicitudes/${id}`);
  redirect(`/admin/proyectos/${projectId}`);
}

export async function createBudgetFromRequest(id: string) {
  const supabase = await db();
  const { data: r } = await supabase.from("quote_requests").select("*").eq("id", id).single();
  if (!r) return;
  const { data: b } = await supabase
    .from("budgets")
    .insert({ request_id: id, client_id: r.client_id, project_id: r.project_id, title: `${opt("service", r.service)} · ${r.name}` })
    .select("id")
    .single();
  const needs = (r.needs as string[]).map((n, i) => ({ budget_id: b!.id, position: i, description: opt("needs", n), quantity: 1, unit: "global", unit_price: 0 }));
  if (needs.length) await supabase.from("budget_items").insert(needs);
  if (r.status === "new" || r.status === "contacted") await supabase.from("quote_requests").update({ status: "quoted" }).eq("id", id);
  redirect(`/admin/presupuestos/${b!.id}`);
}

export async function updateProject(id: string, form: FormData) {
  const supabase = await db();
  await supabase.from("projects").update({ title: str(form, "title", 200) ?? "Proyecto", status: String(form.get("status")), notes: str(form, "notes") }).eq("id", id);
  revalidatePath(`/admin/proyectos/${id}`);
}

type Item = { description: string; quantity: number; unit: string; unit_price: number };
export async function saveBudget(id: string, meta: { title: string; status: string; tax_rate: number; notes: string }, items: Item[]) {
  const supabase = await db();
  await supabase.from("budgets").update({ title: meta.title.slice(0, 200), status: meta.status, tax_rate: Number(meta.tax_rate) || 0, notes: meta.notes.slice(0, 4000) }).eq("id", id);
  await supabase.from("budget_items").delete().eq("budget_id", id);
  const rows = items.filter((i) => i.description.trim()).map((i, position) => ({ budget_id: id, position, description: i.description.slice(0, 500), quantity: Number(i.quantity) || 0, unit: i.unit.slice(0, 20), unit_price: Number(i.unit_price) || 0 }));
  if (rows.length) await supabase.from("budget_items").insert(rows);
  revalidatePath(`/admin/presupuestos/${id}`);
}

export async function createBudget(form: FormData) {
  const supabase = await db();
  let clientId = str(form, "client_id", 60);
  if (!clientId) {
    const name = str(form, "name", 200);
    if (!name) return;
    const { data } = await supabase
      .from("clients")
      .insert({ name, email: str(form, "email", 200), phone: str(form, "phone", 40), location: str(form, "location", 200) })
      .select("id")
      .single();
    clientId = data!.id;
  }
  const { data: b } = await supabase
    .from("budgets")
    .insert({ client_id: clientId, title: str(form, "title", 200) ?? "Presupuesto" })
    .select("id")
    .single();
  await supabase.from("budget_items").insert({ budget_id: b!.id, position: 0, description: "", quantity: 1, unit: "global", unit_price: 0 });
  redirect(`/admin/presupuestos/${b!.id}`);
}

export async function markBudgetSent(id: string) {
  const supabase = await db();
  await supabase.from("budgets").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id).eq("status", "draft");
  revalidatePath(`/admin/presupuestos/${id}`);
}

export async function sendBudgetEmail(id: string) {
  const supabase = await db();
  const { data: b } = await supabase.from("budgets").select("*, clients(name,email), budget_items(quantity,unit_price)").eq("id", id).single();
  const apiKey = process.env.BREVO_API_KEY;
  if (!b?.clients?.email || !apiKey) return { ok: false, error: !apiKey ? "Brevo no configurado" : "El cliente no tiene email" };
  const sub = b.budget_items.reduce((s: number, i: { quantity: number; unit_price: number }) => s + i.quantity * i.unit_price, 0);
  const total = (sub * (1 + Number(b.tax_rate) / 100)).toLocaleString("es-VE", { style: "currency", currency: b.currency });
  const mail = budgetEmail({ name: b.clients.name, title: b.title, number: b.number, total, url: budgetUrl(b.share_token) });
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Nina Marquina", email: process.env.BREVO_SENDER_EMAIL ?? site.email },
      to: [{ email: b.clients.email, name: b.clients.name }],
      bcc: (process.env.QUOTE_NOTIFY_CC ?? "").split(",").map((e) => e.trim()).filter(Boolean).map((email) => ({ email })),
      replyTo: { email: site.email, name: "Nina Marquina" },
      subject: mail.subject,
      htmlContent: mail.html,
      tags: ["budget"],
    }),
  });
  if (!res.ok) {
    console.error("[budget-email] brevo error", res.status, await res.text());
    return { ok: false, error: "Brevo rechazó el envío" };
  }
  await markBudgetSent(id);
  return { ok: true };
}

// ── Clients & portal ──────────────────────────────────────────────

const clientFields = (form: FormData) => ({
  name: str(form, "name", 200) ?? "Cliente",
  email: str(form, "email", 200)?.toLowerCase() ?? null,
  phone: str(form, "phone", 40),
  location: str(form, "location", 200),
  notes: str(form, "notes"),
});

export async function createClient(form: FormData) {
  const supabase = await db();
  if (!str(form, "name", 200)) return;
  const { data } = await supabase.from("clients").insert(clientFields(form)).select("id").single();
  redirect(`/admin/clientes/${data!.id}`);
}

export async function updateClient(id: string, form: FormData) {
  const supabase = await db();
  await supabase.from("clients").update(clientFields(form)).eq("id", id);
  revalidatePath(`/admin/clientes/${id}`);
}

export async function invitePortal(id: string) {
  const supabase = await db();
  const { data: c } = await supabase.from("clients").select("id,name,email").eq("id", id).single();
  const email = c?.email?.trim().toLowerCase();
  if (!c || !email) return;
  await supabase.from("clients").update({ portal_enabled: true, portal_invited_at: new Date().toISOString() }).eq("id", id);
  const link = (await magicLink(email)) ?? `${site.url}/acceso`;
  const mail = portalEmail(link, { name: c.name });
  await sendBrevo({ to: [{ email, name: c.name }], subject: mail.subject, htmlContent: mail.html, tags: ["portal-invite"] });
  revalidatePath(`/admin/clientes/${id}`);
}

export async function revokePortal(id: string) {
  const supabase = await db();
  await supabase.from("clients").update({ portal_enabled: false }).eq("id", id);
  revalidatePath(`/admin/clientes/${id}`);
}

export async function createProject(clientId: string, form: FormData) {
  const supabase = await db();
  const { data: p } = await supabase
    .from("projects")
    .insert({ client_id: clientId, title: str(form, "title", 200) ?? "Proyecto", location: str(form, "location", 200) })
    .select("id")
    .single();
  await supabase.from("project_phases").insert(DEFAULT_PHASES.map((name, position) => ({ project_id: p!.id, name, position })));
  redirect(`/admin/proyectos/${p!.id}`);
}

// ── Project phases & progress updates ─────────────────────────────

const project = (id: string) => revalidatePath(`/admin/proyectos/${id}`);
const PHASE_STATES = ["pending", "in_progress", "done"];

export async function createDefaultPhases(projectId: string) {
  const supabase = await db();
  await supabase.from("project_phases").insert(DEFAULT_PHASES.map((name, position) => ({ project_id: projectId, name, position })));
  project(projectId);
}

export async function addPhase(projectId: string, form: FormData) {
  const supabase = await db();
  const name = str(form, "name", 120);
  if (!name) return;
  const { count } = await supabase.from("project_phases").select("id", { count: "exact", head: true }).eq("project_id", projectId);
  await supabase.from("project_phases").insert({ project_id: projectId, name, position: count ?? 0 });
  project(projectId);
}

export async function savePhase(projectId: string, id: string, form: FormData) {
  const supabase = await db();
  const raw = String(form.get("status"));
  const status = PHASE_STATES.includes(raw) ? raw : "pending";
  const progress = status === "done" ? 100 : Math.max(0, Math.min(100, Math.round(Number(form.get("progress")) || 0)));
  await supabase
    .from("project_phases")
    .update({ name: str(form, "name", 120) ?? "Fase", status, progress, start_date: str(form, "start_date", 10), end_date: str(form, "end_date", 10), notes: str(form, "notes", 1000) })
    .eq("id", id)
    .eq("project_id", projectId);
  project(projectId);
}

export async function deletePhase(projectId: string, id: string) {
  const supabase = await db();
  await supabase.from("project_phases").delete().eq("id", id).eq("project_id", projectId);
  project(projectId);
}

export async function projectUploadUrls(projectId: string, count: number) {
  const supabase = await db();
  const n = Math.min(Math.max(0, Math.floor(count)), 12);
  return Promise.all(
    Array.from({ length: n }, async () => {
      const path = `${projectId}/${crypto.randomUUID()}.jpg`;
      const { data, error } = await supabase.storage.from(PROJECT_BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw new Error("upload");
      return { path, signedUrl: data.signedUrl };
    }),
  );
}

export async function addUpdate(projectId: string, u: { date: string; title: string; body: string; phase_id: string; photos: string[]; visible: boolean }) {
  const supabase = await db();
  await supabase.from("project_updates").insert({
    project_id: projectId,
    date: /^\d{4}-\d{2}-\d{2}$/.test(u.date) ? u.date : new Date().toISOString().slice(0, 10),
    title: u.title.trim().slice(0, 200) || "Avance de obra",
    body: u.body.trim().slice(0, 4000) || null,
    phase_id: u.phase_id || null,
    photos: u.photos.filter((p) => p.startsWith(`${projectId}/`)).slice(0, 12),
    visible: u.visible,
  });
  project(projectId);
}

export async function toggleUpdate(projectId: string, id: string, visible: boolean) {
  const supabase = await db();
  await supabase.from("project_updates").update({ visible }).eq("id", id).eq("project_id", projectId);
  project(projectId);
}

export async function deleteUpdate(projectId: string, id: string) {
  const supabase = await db();
  const { data } = await supabase.from("project_updates").select("photos").eq("id", id).eq("project_id", projectId).maybeSingle();
  if (data?.photos?.length) await supabase.storage.from(PROJECT_BUCKET).remove(data.photos);
  await supabase.from("project_updates").delete().eq("id", id).eq("project_id", projectId);
  project(projectId);
}
