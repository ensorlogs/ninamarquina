import { fmtDate } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Clients() {
  const { data } = await supabaseAdmin()!.from("clients").select("*").order("created_at", { ascending: false });
  return (
    <>
      <p className="label text-muted">CRM</p>
      <h1 className="display mt-3 text-[40px]">Clientes</h1>
      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        {(data ?? []).map((c) => (
          <div key={c.id} className="grid gap-1 py-4 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_110px] md:px-3">
            <span className="font-serif text-[19px]">{c.name}</span>
            <a href={`mailto:${c.email}`} className="text-[13px] text-clay">{c.email}</a>
            <span className="text-[13px]">{c.phone}</span>
            <span className="text-[13px] text-muted">{c.location}</span>
            <span className="text-[12px] text-muted md:text-right">{fmtDate(c.created_at)}</span>
          </div>
        ))}
        {!data?.length && <p className="py-6 text-[14px] text-muted">Se crean al convertir una solicitud.</p>}
      </div>
    </>
  );
}
