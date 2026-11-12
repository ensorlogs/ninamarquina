import Link from "next/link";
import { fmtDate } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function JournalAdmin() {
  const { data } = await supabaseAdmin()!
    .from("posts")
    .select("id,title,slug,status,published_at,cover,newsletter_sent_at")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  return (
    <>
      <p className="label text-muted">Web</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[40px]">Journal</h1>
        <Link href="/admin/journal/nuevo" className="bg-charcoal px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay">
          + Nuevo artículo
        </Link>
      </div>
      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        {(data ?? []).map((p) => (
          <Link key={p.id} href={`/admin/journal/${p.id}`} className="grid grid-cols-[72px_1fr] items-center gap-4 py-3 hover:bg-sand/60 md:grid-cols-[72px_1fr_120px_130px] md:px-3">
            <span className="relative block aspect-[4/3] overflow-hidden bg-stone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.cover && <img src={p.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-[19px]">{p.title}</span>
              <span className="text-[12px] text-muted">/journal/{p.slug}</span>
            </span>
            <span className="col-start-2 md:col-start-auto">
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${p.status === "published" ? "bg-clay text-ivory" : "bg-stone text-muted"}`}>
                {p.status === "published" ? "Publicado" : "Borrador"}
              </span>
              {p.newsletter_sent_at && <span className="ml-2 text-[11px] text-muted">✉︎ enviado</span>}
            </span>
            <span className="col-start-2 text-[12px] text-muted md:col-start-auto md:text-right">{fmtDate(p.published_at)}</span>
          </Link>
        ))}
        {!data?.length && <p className="py-6 text-[14px] text-muted">Todavía no hay artículos.</p>}
      </div>
    </>
  );
}
