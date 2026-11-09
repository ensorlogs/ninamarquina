import NextLink from "next/link";
import { notFound } from "next/navigation";
import { PhaseTrack } from "@/components/portal/PhaseTrack";
import { UpdatesTimeline } from "@/components/portal/UpdatesTimeline";
import { BUDGET_STATUS, PROJECT_STATUS, fmtDate } from "@/lib/admin-labels";
import { budgetUrl } from "@/lib/budget";
import { requirePortal } from "@/lib/portal-auth";
import { budgetTotal, clientBudgets, money, overallProgress, projectTimeline } from "@/lib/portal-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function PortalProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await requirePortal();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: p } = await supabaseAdmin()!.from("projects").select("id,title,location,status,client_id").eq("id", id).maybeSingle();
  if (!p || p.client_id !== client.id) notFound();
  const [{ phases, updates }, budgets] = await Promise.all([projectTimeline(id, true), clientBudgets(client.id, id)]);
  const pct = overallProgress(phases);
  return (
    <>
      <NextLink href="/portal" className="label text-muted hover:text-charcoal">← Mis proyectos</NextLink>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-muted">{PROJECT_STATUS[p.status]}</p>
          <h1 className="display mt-3 text-[40px] md:text-[54px]">{p.title}</h1>
          {p.location && <p className="mt-1 text-[14px] text-muted">{p.location}</p>}
        </div>
        <div className="md:text-right">
          <p className="font-serif text-[56px] leading-none">{pct}%</p>
          <p className="label mt-2 text-muted">Avance general</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="label mb-5 text-muted">Fases del proyecto</h2>
        <PhaseTrack phases={phases} />
      </section>

      <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="display mb-8 text-[32px]">
            Avances de <em>obra</em>
          </h2>
          <UpdatesTimeline updates={updates} phases={phases} />
        </section>
        <aside className="space-y-6">
          <div className="bg-sand p-7">
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
              {!budgets.length && <p className="py-3 text-[13px] text-muted">Aún no hay presupuestos para este proyecto.</p>}
            </div>
          </div>
          <div className="border border-black/15 p-7">
            <h2 className="label text-muted">Pagos</h2>
            <p className="mt-4 font-serif text-[22px] leading-tight">
              Pagos online, <em>muy pronto</em>.
            </p>
            <p className="mt-3 text-[13px] leading-[1.7] text-muted">Pronto podrás pagar tus cuotas desde aquí. Mientras tanto, coordinamos los pagos contigo directamente.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
