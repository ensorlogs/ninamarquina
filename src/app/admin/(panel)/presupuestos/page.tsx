import Link from "next/link";
import { BUDGET_STATUS, fmtDate } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Budgets() {
  const { data } = await supabaseAdmin()!.from("budgets").select("*, clients(name), budget_items(quantity,unit_price)").order("created_at", { ascending: false });
  return (
    <>
      <p className="label text-muted">Ventas</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[40px]">Presupuestos</h1>
        <Link href="/admin/presupuestos/nuevo" className="bg-charcoal px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay">+ Nuevo presupuesto</Link>
      </div>
      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        {(data ?? []).map((b) => {
          const sub = b.budget_items.reduce((s: number, i: { quantity: number; unit_price: number }) => s + i.quantity * i.unit_price, 0);
          return (
            <Link key={b.id} href={`/admin/presupuestos/${b.id}`} className="grid grid-cols-[1fr_auto] gap-2 py-4 hover:bg-sand/60 md:grid-cols-[60px_1.5fr_1fr_auto_120px_110px] md:px-3">
              <span className="hidden text-[13px] text-muted md:block">#{b.number}</span>
              <span className="font-serif text-[19px]">{b.title}</span>
              <span className="hidden text-[13px] md:block">{b.clients?.name}</span>
              <span className="bg-sand px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em]">{BUDGET_STATUS[b.status]}</span>
              <span className="hidden text-right text-[14px] md:block">{(sub * (1 + Number(b.tax_rate) / 100)).toLocaleString("es-VE", { style: "currency", currency: b.currency })}</span>
              <span className="hidden text-right text-[12px] text-muted md:block">{fmtDate(b.created_at)}</span>
            </Link>
          );
        })}
        {!data?.length && <p className="py-6 text-[14px] text-muted">Crea uno nuevo o desde una solicitud.</p>}
      </div>
    </>
  );
}
