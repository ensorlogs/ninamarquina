import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProject } from "@/app/admin/actions";
import { BUDGET_STATUS, PROJECT_STATUS } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Project({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin()!;
  const { data: p } = await db.from("projects").select("*, clients(*)").eq("id", id).maybeSingle();
  if (!p) notFound();
  const { data: budgets } = await db.from("budgets").select("id,number,title,status").eq("project_id", id);
  return (
    <>
      <Link href="/admin/proyectos" className="label text-muted hover:text-charcoal">← Proyectos</Link>
      <h1 className="display mt-4 text-[40px]">{p.title}</h1>
      <p className="mt-1 text-[13px] text-muted">{p.clients?.name} · {p.clients?.email} · {p.clients?.phone} · {p.location}</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <form action={updateProject.bind(null, p.id)} className="space-y-5 bg-sand p-6">
          <input name="title" defaultValue={p.title} className="input font-serif text-[20px]" />
          <select name="status" defaultValue={p.status} className="input">
            {Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <textarea name="notes" defaultValue={p.notes ?? ""} placeholder="Notas del proyecto…" className="input min-h-[160px]" />
          <button className="bg-charcoal px-8 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay">Guardar</button>
        </form>
        <aside className="space-y-3 bg-sand p-6">
          <p className="label text-muted">Presupuestos</p>
          {budgets?.map((b) => <Link key={b.id} href={`/admin/presupuestos/${b.id}`} className="block text-[13px] text-clay">#{b.number} · {b.title} · {BUDGET_STATUS[b.status]} →</Link>)}
          {p.request_id && <Link href={`/admin/solicitudes/${p.request_id}`} className="block pt-3 text-[13px]">Ver solicitud original →</Link>}
        </aside>
      </div>
    </>
  );
}
