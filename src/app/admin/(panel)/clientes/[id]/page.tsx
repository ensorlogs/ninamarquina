import Link from "next/link";
import { notFound } from "next/navigation";
import { createProject, invitePortal, revokePortal, updateClient } from "@/app/admin/actions";
import { BUDGET_STATUS, PROJECT_STATUS, fmtDate } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

const btn = "bg-charcoal px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay disabled:opacity-40";

export default async function Client({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin()!;
  const { data: c } = await db.from("clients").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();
  const [{ data: projects }, { data: budgets }] = await Promise.all([
    db.from("projects").select("id,title,status,location").eq("client_id", id).order("created_at", { ascending: false }),
    db.from("budgets").select("id,number,title,status").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <Link href="/admin/clientes" className="label text-muted hover:text-charcoal">
        ← Clientes
      </Link>
      <h1 className="display mt-4 text-[40px]">{c.name}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <form action={updateClient.bind(null, id)} className="grid gap-4 bg-sand p-6 md:grid-cols-2">
            <p className="label text-muted md:col-span-2">Datos</p>
            <input name="name" required defaultValue={c.name} className="input font-serif text-[18px] md:col-span-2" />
            <input name="email" type="email" defaultValue={c.email ?? ""} placeholder="Email" className="input" />
            <input name="phone" defaultValue={c.phone ?? ""} placeholder="WhatsApp" className="input" />
            <input name="location" defaultValue={c.location ?? ""} placeholder="Ubicación" className="input md:col-span-2" />
            <textarea name="notes" defaultValue={c.notes ?? ""} placeholder="Notas internas…" className="input min-h-[100px] md:col-span-2" />
            <button className={`${btn} md:justify-self-start`}>Guardar</button>
          </form>

          <section>
            <h2 className="label mb-4 text-muted">Proyectos</h2>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {projects?.map((p) => (
                <Link key={p.id} href={`/admin/proyectos/${p.id}`} className="flex justify-between gap-4 px-3 py-4 hover:bg-sand/60">
                  <span className="font-serif text-[19px]">{p.title}</span>
                  <span className="bg-sand px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em]">{PROJECT_STATUS[p.status]}</span>
                </Link>
              ))}
            </div>
            <form action={createProject.bind(null, id)} className="mt-4 flex flex-wrap gap-3">
              <input name="title" required placeholder="Nuevo proyecto (p. ej. Reforma cocina)" className="input max-w-sm" />
              <input name="location" defaultValue={c.location ?? ""} placeholder="Ubicación" className="input max-w-[220px]" />
              <button className={btn}>Crear proyecto</button>
            </form>
          </section>

          <section>
            <h2 className="label mb-4 text-muted">Presupuestos</h2>
            {budgets?.map((b) => (
              <Link key={b.id} href={`/admin/presupuestos/${b.id}`} className="block py-1 text-[13px] text-clay">
                #{b.number} · {b.title} · {BUDGET_STATUS[b.status]} →
              </Link>
            ))}
            {!budgets?.length && <p className="text-[13px] text-muted">Sin presupuestos. Solo los enviados se ven en el área del cliente.</p>}
          </section>
        </div>

        <aside className="h-fit space-y-4 border border-black/15 p-6">
          <p className="label text-muted">Área de cliente</p>
          {c.portal_enabled ? (
            <>
              <p className="font-serif text-[22px] leading-tight">
                Acceso <em>activo</em>
              </p>
              <p className="text-[13px] leading-[1.7] text-muted">
                Entra en ninamarquina.com/acceso con {c.email}. Ve sus proyectos, fases, avances visibles y presupuestos enviados.
                {c.portal_invited_at && ` Invitado el ${fmtDate(c.portal_invited_at)}.`}
              </p>
              <form action={invitePortal.bind(null, id)}>
                <button className={btn}>Reenviar invitación</button>
              </form>
              <form action={revokePortal.bind(null, id)}>
                <button className="text-[12px] text-muted hover:text-clay">Quitar acceso</button>
              </form>
            </>
          ) : (
            <>
              <p className="text-[13px] leading-[1.7] text-muted">
                Le enviamos un email de bienvenida con su enlace de entrada. Podrá seguir sus proyectos por fases, ver los avances de obra y sus presupuestos.
              </p>
              <form action={invitePortal.bind(null, id)}>
                <button disabled={!c.email} className={btn}>
                  Dar acceso al portal
                </button>
              </form>
              {!c.email && <p className="text-[12px] text-clay">Añade antes un email al cliente.</p>}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
