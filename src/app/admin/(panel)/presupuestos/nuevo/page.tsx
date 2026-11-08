import Link from "next/link";
import { createBudget } from "@/app/admin/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function NewBudget() {
  const { data: clients } = await supabaseAdmin()!.from("clients").select("id,name,email").order("name");
  return (
    <>
      <Link href="/admin/presupuestos" className="label text-muted hover:text-charcoal">← Presupuestos</Link>
      <h1 className="display mt-4 text-[40px]">Nuevo <em>presupuesto</em></h1>
      <form action={createBudget} className="mt-10 max-w-2xl space-y-8 bg-sand p-6 md:p-10">
        <div>
          <label className="label text-muted" htmlFor="title">Título del trabajo</label>
          <input id="title" name="title" required placeholder="Reforma de cocina · Alto Hatillo" className="input" />
        </div>
        {!!clients?.length && (
          <div>
            <label className="label text-muted" htmlFor="client_id">Cliente existente</label>
            <select id="client_id" name="client_id" className="input" defaultValue="">
              <option value="">— Cliente nuevo (rellena abajo) —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.email ? ` · ${c.email}` : ""}</option>)}
            </select>
          </div>
        )}
        <fieldset className="grid gap-6 md:grid-cols-2">
          <legend className="label mb-4 text-clay">Cliente nuevo</legend>
          <input name="name" placeholder="Nombre y apellido" className="input" />
          <input name="email" type="email" placeholder="Email" className="input" />
          <input name="phone" placeholder="WhatsApp (+58 …)" className="input" />
          <input name="location" placeholder="Ubicación" className="input" />
        </fieldset>
        <button className="bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay">Crear y añadir partidas →</button>
      </form>
    </>
  );
}
