import Link from "next/link";
import { notFound } from "next/navigation";
import { addPhase, createDefaultPhases, deletePhase, deleteUpdate, savePhase, toggleUpdate, updateProject } from "@/app/admin/actions";
import { UpdateForm } from "@/components/admin/UpdateForm";
import { UpdatesTimeline } from "@/components/portal/UpdatesTimeline";
import { BUDGET_STATUS, PHASE_STATUS, PROJECT_STATUS } from "@/lib/admin-labels";
import { overallProgress, projectTimeline } from "@/lib/portal-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

const btn = "bg-charcoal px-5 py-2.5 text-[10.5px] uppercase tracking-[0.16em] text-ivory hover:bg-clay";

export default async function Project({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin()!;
  const { data: p } = await db.from("projects").select("*, clients(*)").eq("id", id).maybeSingle();
  if (!p) notFound();
  const [{ data: budgets }, { phases, updates }] = await Promise.all([
    db.from("budgets").select("id,number,title,status").eq("project_id", id),
    projectTimeline(id),
  ]);
  const pct = overallProgress(phases);

  return (
    <>
      <Link href="/admin/proyectos" className="label text-muted hover:text-charcoal">
        ← Proyectos
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[40px]">{p.title}</h1>
          <p className="mt-1 text-[13px] text-muted">
            {p.clients ? (
              <Link href={`/admin/clientes/${p.clients.id}`} className="text-clay">
                {p.clients.name}
              </Link>
            ) : (
              "Sin cliente"
            )}
            {p.clients?.email && ` · ${p.clients.email}`}
            {p.clients?.phone && ` · ${p.clients.phone}`}
            {p.location && ` · ${p.location}`}
          </p>
        </div>
        <p className="text-right">
          <span className="font-serif text-[44px] leading-none">{pct}%</span>
          <span className="label block text-muted">
            {p.clients?.portal_enabled ? "El cliente lo ve en su área" : "Cliente sin acceso al portal"}
          </span>
        </p>
      </div>

      <section className="mt-10">
        <h2 className="label mb-4 text-muted">Fases</h2>
        {!phases.length && (
          <form action={createDefaultPhases.bind(null, id)} className="mb-4">
            <button className={btn}>Crear fases: Diseño → Permisos → Obra → Entrega</button>
          </form>
        )}
        <div className="space-y-px bg-black/10">
          {phases.map((f) => (
            <form key={f.id} action={savePhase.bind(null, id, f.id)} className="grid items-center gap-3 bg-sand p-4 md:grid-cols-[1.3fr_150px_90px_150px_150px_auto]">
              <input name="name" defaultValue={f.name} className="input font-serif text-[18px]" aria-label="Fase" />
              <select name="status" defaultValue={f.status} className="input" aria-label="Estado">
                {Object.entries(PHASE_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-[13px]">
                <input name="progress" type="number" min={0} max={100} defaultValue={f.progress} className="input" aria-label="% avance" />%
              </label>
              <input name="start_date" type="date" defaultValue={f.start_date ?? ""} className="input" aria-label="Inicio" />
              <input name="end_date" type="date" defaultValue={f.end_date ?? ""} className="input" aria-label="Fin" />
              <span className="flex gap-2">
                <button className={btn}>Guardar</button>
                <button formAction={deletePhase.bind(null, id, f.id)} className="px-2 text-[12px] text-muted hover:text-clay" aria-label="Eliminar fase">
                  ✕
                </button>
              </span>
              <input name="notes" defaultValue={f.notes ?? ""} placeholder="Nota visible para el cliente (opcional)" className="input md:col-span-6" />
            </form>
          ))}
        </div>
        <form action={addPhase.bind(null, id)} className="mt-3 flex gap-3">
          <input name="name" placeholder="Nueva fase…" className="input max-w-xs" />
          <button className="border border-charcoal px-5 text-[10.5px] uppercase tracking-[0.16em] hover:bg-charcoal hover:text-ivory">Añadir</button>
        </form>
      </section>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_340px]">
        <section>
          <h2 className="display mb-6 text-[30px]">
            Avances de <em>obra</em>
          </h2>
          <UpdateForm projectId={id} phases={phases} />
          <div className="mt-10">
            <UpdatesTimeline
              updates={updates}
              phases={phases}
              actions={(u) => (
                <form className="mt-4 flex gap-4 text-[12px]">
                  <button formAction={toggleUpdate.bind(null, id, u.id, !u.visible)} className="text-clay hover:underline">
                    {u.visible ? "Ocultar al cliente" : "Mostrar al cliente"}
                  </button>
                  <button formAction={deleteUpdate.bind(null, id, u.id)} className="text-muted hover:text-clay">
                    Eliminar
                  </button>
                </form>
              )}
            />
          </div>
        </section>
        <aside className="space-y-6">
          <form action={updateProject.bind(null, p.id)} className="space-y-4 bg-sand p-6">
            <p className="label text-muted">Datos del proyecto</p>
            <input name="title" defaultValue={p.title} className="input font-serif text-[18px]" />
            <select name="status" defaultValue={p.status} className="input">
              {Object.entries(PROJECT_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <textarea name="notes" defaultValue={p.notes ?? ""} placeholder="Notas internas…" className="input min-h-[120px]" />
            <button className={btn}>Guardar</button>
          </form>
          <div className="space-y-3 bg-sand p-6">
            <p className="label text-muted">Presupuestos</p>
            {budgets?.map((b) => (
              <Link key={b.id} href={`/admin/presupuestos/${b.id}`} className="block text-[13px] text-clay">
                #{b.number} · {b.title} · {BUDGET_STATUS[b.status]} →
              </Link>
            ))}
            {!budgets?.length && <p className="text-[13px] text-muted">Sin presupuestos.</p>}
            {p.request_id && (
              <Link href={`/admin/solicitudes/${p.request_id}`} className="block pt-3 text-[13px]">
                Ver solicitud original →
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
