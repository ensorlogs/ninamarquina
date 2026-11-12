import Link from "next/link";
import { createProject, moveProject } from "@/app/admin/content-actions";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function PortfolioAdmin() {
  const { data } = await supabaseAdmin()!.from("portfolio_projects").select("id,title,slug,year,images,published,position").order("position");
  const list = data ?? [];
  return (
    <>
      <p className="label text-muted">Web</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[40px]">Portfolio</h1>
      </div>
      <p className="mt-2 max-w-2xl text-[13.5px] text-muted">Los proyectos que se ven en la web, en este orden (carrusel de la home y /proyectos). Usa las flechas para cambiar el orden.</p>
      <details className="mt-6 bg-sand p-5">
        <summary className="cursor-pointer text-[12px] uppercase tracking-[0.16em]">+ Nuevo proyecto</summary>
        <form action={createProject} className="mt-5 flex flex-wrap gap-3">
          <input name="title" required placeholder="Nombre del proyecto *" className="input max-w-md" />
          <button className="bg-charcoal px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay">Crear</button>
        </form>
      </details>
      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        {list.map((p, i) => (
          <div key={p.id} className="grid grid-cols-[96px_1fr_auto] items-center gap-4 py-3 md:px-3">
            <Link href={`/admin/portfolio/${p.id}`} className="relative block aspect-[16/10] overflow-hidden bg-stone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.images?.[0] && <img src={p.images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            </Link>
            <Link href={`/admin/portfolio/${p.id}`} className="min-w-0 hover:text-clay">
              <span className="block truncate font-serif text-[20px]">{p.title}</span>
              <span className="text-[12px] text-muted">
                {p.year} · {p.images?.length ?? 0} fotos ·{" "}
                <span className={p.published ? "text-clay" : ""}>{p.published ? "Publicado" : "Oculto"}</span>
              </span>
            </Link>
            <div className="flex gap-1">
              <form action={moveProject.bind(null, p.id, -1)}>
                <button disabled={i === 0} title="Subir" className="h-9 w-9 border border-black/15 hover:border-clay disabled:opacity-30">↑</button>
              </form>
              <form action={moveProject.bind(null, p.id, 1)}>
                <button disabled={i === list.length - 1} title="Bajar" className="h-9 w-9 border border-black/15 hover:border-clay disabled:opacity-30">↓</button>
              </form>
            </div>
          </div>
        ))}
        {!list.length && <p className="py-6 text-[14px] text-muted">Todavía no hay proyectos.</p>}
      </div>
    </>
  );
}
