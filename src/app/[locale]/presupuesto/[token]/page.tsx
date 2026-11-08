import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/PrintButton";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Presupuesto", robots: { index: false, follow: false } };

type Item = { position: number; description: string; quantity: number; unit: string | null; unit_price: number };

export default async function PublicBudget({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  const db = supabaseAdmin();
  const { data: b } = db
    ? await db.from("budgets").select("number,created_at,title,currency,tax_rate,notes,clients(name), budget_items(*)").eq("share_token", token).maybeSingle()
    : { data: null };
  if (!b) notFound();
  const items = (b.budget_items as Item[]).sort((x, y) => x.position - y.position);
  const money = (n: number) => n.toLocaleString("es-VE", { style: "currency", currency: b.currency });
  const sub = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax = (sub * Number(b.tax_rate)) / 100;
  const client = b.clients as unknown as { name: string } | null;
  return (
    <section className="bg-sand px-5 pb-24 pt-32 md:pt-40 print:bg-white print:p-0">
      <article className="mx-auto max-w-4xl bg-white p-6 md:p-14 print:p-0">
        <header className="flex flex-wrap justify-between gap-6 border-b border-black/10 pb-8">
          <div>
            <p className="font-serif text-[22px] tracking-[0.3em]">NINA MARQUINA</p>
            <p className="label mt-1 text-[9px] text-muted">Architecture &amp; Interiors</p>
          </div>
          <div className="text-right">
            <p className="label text-clay">Presupuesto #{b.number}</p>
            <p className="mt-1 text-[12px] text-muted">{new Date(b.created_at).toLocaleDateString("es-VE")}</p>
          </div>
        </header>
        <h1 className="display mt-10 text-[34px]">{b.title}</h1>
        {client && <p className="mt-2 text-[14px] text-muted">Para {client.name}</p>}
        <table className="mt-10 w-full text-[14px]">
          <thead>
            <tr className="label border-b border-black/15 text-left text-[9.5px] text-muted">
              <th className="py-2 font-normal">Partida</th><th className="w-16 font-normal">Cant.</th><th className="hidden w-20 font-normal sm:table-cell">Ud.</th><th className="hidden w-28 text-right font-normal sm:table-cell">Precio</th><th className="w-28 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.position} className="border-b border-black/10 align-top">
                <td className="py-3 pr-3">{i.description}</td><td className="py-3">{i.quantity}</td><td className="hidden py-3 sm:table-cell">{i.unit}</td>
                <td className="hidden py-3 text-right sm:table-cell">{money(i.unit_price)}</td><td className="py-3 text-right">{money(i.quantity * i.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-8 w-full max-w-xs space-y-2 text-[14px]">
          <p className="flex justify-between"><span className="text-muted">Subtotal</span>{money(sub)}</p>
          {Number(b.tax_rate) > 0 && <p className="flex justify-between"><span className="text-muted">IVA {Number(b.tax_rate)}%</span>{money(tax)}</p>}
          <p className="flex justify-between border-t border-black/15 pt-3 font-serif text-[26px]"><span>Total</span>{money(sub + tax)}</p>
        </div>
        {b.notes && <p className="mt-12 whitespace-pre-line text-[13px] leading-[1.75] text-muted">{b.notes}</p>}
        <p className="mt-12 border-t border-black/10 pt-6 text-[12px] text-muted">hello@ninamarquina.com · El Hatillo · Caracas · Punta Cana</p>
      </article>
      <div className="mx-auto mt-8 max-w-4xl text-center print:hidden"><PrintButton /></div>
    </section>
  );
}
