import Link from "next/link";
import { PROJECT_STATUS, fmtDate } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Projects() {
  const { data } = await supabaseAdmin()!.from("projects").select("*, clients(name)").order("created_at", { ascending: false });
  return (
    <>
      <p className="label text-muted">Obras</p>
      <h1 className="display mt-3 text-[40px]">Proyectos</h1>
      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        {(data ?? []).map((p) => (
          <Link key={p.id} href={`/admin/proyectos/${p.id}`} className="grid grid-cols-[1fr_auto] gap-2 py-4 hover:bg-sand/60 md:grid-cols-[1.5fr_1fr_1fr_auto_110px] md:px-3">
            <span className="font-serif text-[19px]">{p.title}</span>
            <span className="hidden text-[13px] md:block">{p.clients?.name}</span>
            <span className="hidden text-[13px] text-muted md:block">{p.location}</span>
            <span className="bg-sand px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em]">{PROJECT_STATUS[p.status]}</span>
            <span className="hidden text-right text-[12px] text-muted md:block">{fmtDate(p.created_at)}</span>
          </Link>
        ))}
        {!data?.length && <p className="py-6 text-[14px] text-muted">Se crean al convertir una solicitud.</p>}
      </div>
    </>
  );
}
