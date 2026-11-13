import { BUDGET_STATUS, PROJECT_STATUS, fmtDate } from "@/lib/admin-labels";
import { budgetUrl } from "@/lib/budget";
import { requirePortal } from "@/lib/portal-auth";
import { budgetTotal, clientBudgets, money, overallProgress } from "@/lib/portal-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Row = { id: string; title: string; location: string | null; status: string; project_phases: { progress: number; status: string; name: string; position: number }[] };

export default async function PortalHome() {
  const client = await requirePortal();
  const { data } = await supabaseAdmin()!
    .from("projects")
    .select("id,title,location,status,project_phases(progress,status,name,position)")
    .eq("client_id", client.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  const projects = (data ?? []) as Row[];
  const budgets = (await clientBudgets(client.id)).filter((b) => !b.project_id);
  return (
    <>
      <p className="label text-muted">Área de clientes</p>
      <h1 className="display mt-4 text-[44px] md:text-[56px]">
        Hola, <em>{client.name.split(" ")[0]}</em>.
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-[1.7] text-muted">Aquí puedes seguir tus proyectos por fases, ver los avances de obra y consultar tus presupuestos.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {projects.map((p) => {
          const phases = [...p.project_phases].sort((a, b) => a.position - b.position);
          const pct = overallProgress(phases);
          const current = phases.find((f) => f.status === "in_progress") ?? phases.find((f) => f.status !== "done");
          return (
            <a key={p.id} href={`/portal/proyectos/${p.id}`} className="group block bg-sand p-7 transition-colors hover:bg-stone md:p-9">
              <div className="flex items-start justify-between gap-4">
                <span className="label text-muted">{PROJECT_STATUS[p.status]}</span>
                <span className="font-serif text-[40px] leading-none">{pct}%</span>
              </div>
              <h2 className="mt-6 font-serif text-[30px] leading-tight">{p.title}</h2>
              {p.location && <p className="mt-1 text-[13px] text-muted">{p.location}</p>}
              <div className="mt-6 h-1 bg-ivory">
                <div className="h-full bg-clay" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-3 flex justify-between gap-3 text-[12px] text-muted">
                <span>{current ? `Fase actual: ${current.name}` : phases.length ? "Proyecto completado" : "Fases por definir"}</span>
                <span className="transition-transform group-hover:translate-x-1">Ver proyecto →</span>
              </p>
            </a>
          );
        })}
        {!projects.length && <p className="text-[14px] text-muted">Todavía no hay proyectos en tu área. Te avisaremos cuando esté listo.</p>}
      </div>
      {budgets.length > 0 && (
        <section className="mt-12 bg-sand p-7 md:p-9">
          <h2 className="label text-muted">Presupuestos</h2>
          <div className="mt-4 divide-y divide-black/10">
            {budgets.map((b) => (
              <a key={b.id} href={budgetUrl(b.share_token)} target="_blank" rel="noopener noreferrer" className="block py-4 hover:text-clay">
                <p className="flex justify-between gap-3 text-[12px] text-muted">
                  <span>#{b.number} · {fmtDate(b.created_at)}</span>
                  <span>{BUDGET_STATUS[b.status]}</span>
                </p>
                <p className="mt-1 font-serif text-[20px] leading-tight">{b.title}</p>
                <p className="mt-1 text-[14px]">
                  {money(budgetTotal(b), b.currency)} <span className="text-clay">· Ver / PDF →</span>
                </p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
