import Link from "next/link";
import { createClient } from "@/app/admin/actions";
import { fmtDate } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Clients() {
  const { data } = await supabaseAdmin()!.from("clients").select("*").order("created_at", { ascending: false });
  return (
    <>
      <p className="label text-muted">CRM</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[40px]">Clientes</h1>
      </div>
      <details className="mt-6 bg-sand p-5">
        <summary className="cursor-pointer text-[12px] uppercase tracking-[0.16em]">+ Nuevo cliente</summary>
        <form action={createClient} className="mt-5 grid gap-3 md:grid-cols-4">
          <input name="name" required placeholder="Nombre *" className="input" />
          <input name="email" type="email" placeholder="Email" className="input" />
          <input name="phone" placeholder="WhatsApp" className="input" />
          <input name="location" placeholder="Ubicación" className="input" />
          <button className="bg-charcoal px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay md:col-span-4 md:justify-self-start">Crear cliente</button>
        </form>
      </details>
      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        {(data ?? []).map((c) => (
          <Link key={c.id} href={`/admin/clientes/${c.id}`} className="grid gap-1 py-4 hover:bg-sand/60 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_120px_110px] md:items-center md:px-3">
            <span className="font-serif text-[19px]">{c.name}</span>
            <span className="text-[13px] text-clay">{c.email}</span>
            <span className="text-[13px]">{c.phone}</span>
            <span className="text-[13px] text-muted">{c.location}</span>
            <span>
              {c.portal_enabled && <span className="bg-clay px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ivory">Portal</span>}
            </span>
            <span className="text-[12px] text-muted md:text-right">{fmtDate(c.created_at)}</span>
          </Link>
        ))}
        {!data?.length && <p className="py-6 text-[14px] text-muted">Crea uno nuevo o convierte una solicitud.</p>}
      </div>
    </>
  );
}
