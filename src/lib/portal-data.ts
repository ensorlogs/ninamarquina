import "server-only";
import { supabaseAdmin } from "./supabase-admin";

export const PROJECT_BUCKET = "project-files";

export type Phase = { id: string; position: number; name: string; status: string; progress: number; start_date: string | null; end_date: string | null; notes: string | null };
export type Update = { id: string; date: string; title: string; body: string | null; photos: string[]; visible: boolean; phase_id: string | null; urls: string[] };

export const overallProgress = (phases: Pick<Phase, "progress">[]) =>
  phases.length ? Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length) : 0;

export async function projectTimeline(projectId: string, onlyVisible = false) {
  const db = supabaseAdmin()!;
  const [{ data: phases }, updatesRes] = await Promise.all([
    db.from("project_phases").select("*").eq("project_id", projectId).order("position"),
    (() => {
      const q = db.from("project_updates").select("*").eq("project_id", projectId).order("date", { ascending: false }).order("created_at", { ascending: false });
      return onlyVisible ? q.eq("visible", true) : q;
    })(),
  ]);
  const raw = (updatesRes.data ?? []) as Omit<Update, "urls">[];
  const paths = raw.flatMap((u) => u.photos);
  const signed = paths.length ? (await db.storage.from(PROJECT_BUCKET).createSignedUrls(paths, 60 * 60 * 6)).data ?? [] : [];
  const byPath = new Map(signed.map((s) => [s.path, s.signedUrl]));
  const updates: Update[] = raw.map((u) => ({ ...u, urls: u.photos.map((p) => byPath.get(p)).filter(Boolean) as string[] }));
  return { phases: (phases ?? []) as Phase[], updates };
}

type BudgetRow = { id: string; number: number; title: string; status: string; currency: string; tax_rate: number; share_token: string; created_at: string; budget_items: { quantity: number; unit_price: number }[] };

export const budgetTotal = (b: Pick<BudgetRow, "tax_rate" | "budget_items">) => {
  const sub = b.budget_items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
  return sub * (1 + Number(b.tax_rate) / 100);
};

export const money = (n: number, currency = "USD") => n.toLocaleString("es-VE", { style: "currency", currency });

export async function clientBudgets(clientId: string, projectId?: string) {
  let q = supabaseAdmin()!
    .from("budgets")
    .select("id,number,title,status,currency,tax_rate,share_token,created_at,project_id,budget_items(quantity,unit_price)")
    .eq("client_id", clientId)
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  return ((await q).data ?? []) as (BudgetRow & { project_id: string | null })[];
}
