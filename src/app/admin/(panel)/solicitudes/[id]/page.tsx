import Link from "next/link";
import { notFound } from "next/navigation";
import { convertRequest, createBudgetFromRequest, updateRequest } from "@/app/admin/actions";
import { REQUEST_STATUS, fmtDate, opt } from "@/lib/admin-labels";
import { QUOTE_BUCKET, supabaseAdmin } from "@/lib/supabase-admin";

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin()!;
  const { data: r } = await db.from("quote_requests").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();
  const { data: signed } = r.files.length ? await db.storage.from(QUOTE_BUCKET).createSignedUrls(r.files, 3600) : { data: [] };
  const { data: budgets } = await db.from("budgets").select("id,number,title,status").eq("request_id", id);
  const phone = String(r.phone).replace(/\D/g, "");
  const rows: [string, string][] = [
    ["Servicio", opt("service", r.service)],
    ["Inmueble", [opt("propertyType", r.property_type), r.property_status && opt("propertyStatus", r.property_status)].filter(Boolean).join(" · ")],
    ["Superficie", r.area_m2 ? `${r.area_m2} m²` : "—"],
    ["Ubicación", [opt("location", r.location), r.zone].filter(Boolean).join(" · ")],
    ["Presupuesto", opt("budget", r.budget)],
    ["Inicio", opt("timeline", r.timeline)],
    ["Contacto preferido", opt("contactPref", r.contact_pref)],
    ["Idioma", String(r.locale).toUpperCase()],
  ];
  return (
    <>
      <Link href="/admin/solicitudes" className="label text-muted hover:text-charcoal">← Solicitudes</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[40px]">{r.name}</h1>
          <p className="mt-1 text-[13px] text-muted">Recibida el {fmtDate(r.created_at)} · Ref. {r.id.slice(0, 8)}</p>
        </div>
        <span className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] ${REQUEST_STATUS[r.status]?.cls}`}>{REQUEST_STATUS[r.status]?.label}</span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <section className="bg-sand p-6">
            <p className="label text-muted">Cliente</p>
            <p className="mt-2 text-[14px]"><a className="text-clay" href={`mailto:${r.email}`}>{r.email}</a> · <a className="text-clay" href={`tel:${r.phone}`}>{r.phone}</a></p>
            <div className="mt-4 flex flex-wrap gap-2">
              {phone && <a href={`https://wa.me/${phone}`} target="_blank" className="bg-charcoal px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-ivory">WhatsApp</a>}
              <a href={`mailto:${r.email}`} className="border border-charcoal px-4 py-2 text-[11px] uppercase tracking-[0.14em]">Email</a>
            </div>
          </section>
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="border-b border-black/10 pb-3"><dt className="label text-[9.5px] text-muted">{k}</dt><dd className="mt-1 text-[15px]">{v}</dd></div>
            ))}
          </dl>
          {r.needs.length > 0 && (
            <div><p className="label text-muted">Qué quiere hacer</p><div className="mt-3 flex flex-wrap gap-2">{r.needs.map((n: string) => <span key={n} className="bg-sand px-3 py-1.5 text-[13px]">{opt("needs", n)}</span>)}</div></div>
          )}
          {r.description && <blockquote className="border-l-2 border-clay pl-5 font-serif text-[21px] italic leading-snug">“{r.description}”</blockquote>}
          {(signed?.length || r.links.length) ? (
            <div>
              <p className="label text-muted">Fotos, planos e ideas</p>
              <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
                {signed?.map((f) => f.signedUrl && (
                  <a key={f.path} href={f.signedUrl} target="_blank" className="block aspect-square overflow-hidden bg-stone">
                    {/\.pdf$/i.test(f.path ?? "") ? <span className="grid h-full place-items-center text-[12px]">PDF ↗</span> : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.signedUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </a>
                ))}
              </div>
              {r.links.map((l: string) => <a key={l} href={l} target="_blank" className="mt-2 block break-all text-[13px] text-clay">↗ {l}</a>)}
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <form action={updateRequest.bind(null, r.id)} className="bg-sand p-6">
            <p className="label text-muted">Estado y notas</p>
            <select name="status" defaultValue={r.status} className="input mt-3">
              {Object.entries(REQUEST_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <textarea name="notes" defaultValue={r.notes ?? ""} placeholder="Notas internas…" className="input mt-4 min-h-[110px]" />
            <button className="mt-4 w-full bg-charcoal py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay">Guardar</button>
          </form>
          <div className="space-y-3 bg-sand p-6">
            <p className="label text-muted">Acciones</p>
            {r.project_id ? (
              <Link href={`/admin/proyectos/${r.project_id}`} className="block border border-charcoal py-3 text-center text-[11px] uppercase tracking-[0.16em]">Ver proyecto →</Link>
            ) : (
              <form action={convertRequest.bind(null, r.id)}><button className="w-full bg-clay py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-charcoal">Convertir en cliente + proyecto</button></form>
            )}
            <form action={createBudgetFromRequest.bind(null, r.id)}><button className="w-full border border-charcoal py-3 text-[11px] uppercase tracking-[0.16em] hover:bg-charcoal hover:text-ivory">Crear presupuesto</button></form>
            {budgets?.map((b) => <Link key={b.id} href={`/admin/presupuestos/${b.id}`} className="block text-[13px] text-clay">Presupuesto #{b.number} · {b.title} →</Link>)}
          </div>
        </aside>
      </div>
    </>
  );
}
