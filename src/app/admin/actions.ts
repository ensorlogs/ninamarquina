"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { REQUEST_STATUS } from "@/lib/admin-labels";
import { opt } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";

async function db() {
  await requireAdmin();
  return supabaseAdmin()!;
}
const str = (f: FormData, k: string, n = 4000) => String(f.get(k) ?? "").trim().slice(0, n) || null;

export async function signOut() {
  await (await supabaseServer()).auth.signOut();
  redirect("/admin/login");
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
