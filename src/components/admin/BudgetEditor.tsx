"use client";

import { useState, useTransition } from "react";
import { markBudgetSent, saveBudget, sendBudgetEmail } from "@/app/admin/actions";
import { BUDGET_STATUS } from "@/lib/admin-labels";
import { BudgetSignature } from "@/components/BudgetSignature";
import { site } from "@/lib/site";

type Item = { description: string; quantity: number; unit: string; unit_price: number };
type Budget = {
  id: string;
  number: number;
  shareUrl: string;
  created_at: string;
  title: string;
  status: string;
  currency: string;
  tax_rate: number;
  notes: string | null;
  clients: { name: string; email: string; phone: string; location: string } | null;
  budget_items: Item[];
};

export function BudgetEditor({ budget }: { budget: Budget }) {
  const [meta, setMeta] = useState({ title: budget.title, status: budget.status, tax_rate: Number(budget.tax_rate), notes: budget.notes ?? "" });
  const [items, setItems] = useState<Item[]>(budget.budget_items.map(({ description, quantity, unit, unit_price }) => ({ description, quantity: Number(quantity), unit: unit ?? "", unit_price: Number(unit_price) })));
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const persist = () => saveBudget(budget.id, meta, items);
  const sendEmail = () =>
    start(async () => {
      await persist();
      const r = await sendBudgetEmail(budget.id);
      setMeta((m) => ({ ...m, status: r.ok && m.status === "draft" ? "sent" : m.status }));
      setNotice(r.ok ? `Enviado a ${budget.clients?.email}` : (r.error ?? "Error"));
    });
  const sendWhatsApp = () => {
    const phone = (budget.clients?.phone ?? "").replace(/\D/g, "");
    const text = `Hola ${budget.clients?.name.split(" ")[0] ?? ""}, te comparto el presupuesto #${budget.number} · ${meta.title}: ${budget.shareUrl}\n\nNina Marquina · Architecture & Interiors`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
    start(async () => {
      await persist();
      await markBudgetSent(budget.id);
      setMeta((m) => ({ ...m, status: m.status === "draft" ? "sent" : m.status }));
    });
  };
  const money = (n: number) => n.toLocaleString("es-VE", { style: "currency", currency: budget.currency });
  const sub = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax = (sub * meta.tax_rate) / 100;
  const set = (i: number, patch: Partial<Item>) => {
    setSaved(false);
    setItems((all) => all.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  };
  const cell = "w-full bg-transparent py-2 outline-none print:p-0";

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <select value={meta.status} onChange={(e) => setMeta({ ...meta, status: e.target.value })} className="pill">
          {Object.entries(BUDGET_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex flex-wrap gap-2">
          <button disabled={pending || !budget.clients?.email} onClick={sendEmail} className="bg-clay px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory disabled:opacity-50">Enviar por email</button>
          <button disabled={pending} onClick={sendWhatsApp} className="bg-[#25D366] px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-charcoal disabled:opacity-50">Enviar por WhatsApp</button>
          <button onClick={() => { navigator.clipboard.writeText(budget.shareUrl); setNotice("Enlace copiado"); }} className="border border-charcoal px-5 py-2.5 text-[11px] uppercase tracking-[0.16em]">Copiar enlace</button>
          <button onClick={() => window.print()} className="border border-charcoal px-5 py-2.5 text-[11px] uppercase tracking-[0.16em]">Descargar PDF</button>
          <button disabled={pending} onClick={() => start(async () => { await saveBudget(budget.id, meta, items); setSaved(true); })} className="bg-charcoal px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay disabled:opacity-60">
            {pending ? "Guardando…" : saved ? "Guardado ✓" : "Guardar"}
          </button>
        </div>
      </div>

      {notice && <p className="mt-4 text-[13px] text-clay print:hidden">{notice}</p>}
      <article className="mt-6 bg-white p-6 md:p-12 print:m-0 print:p-0">
        <header className="flex flex-wrap justify-between gap-6 border-b border-black/10 pb-8">
          <div>
            <p className="font-serif text-[22px] tracking-[0.3em]">NINA MARQUINA</p>
            <p className="label mt-1 text-[9px] text-muted">Architecture &amp; Interiors</p>
            <p className="mt-4 text-[12px] text-muted">hello@ninamarquina.com · {site.locations.join(" · ")}</p>
          </div>
          <div className="text-right">
            <p className="label text-clay">Presupuesto #{budget.number}</p>
            <p className="mt-1 text-[12px] text-muted">{new Date(budget.created_at).toLocaleDateString("es-VE")}</p>
          </div>
        </header>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} className="display bg-transparent text-[30px] outline-none" />
          {budget.clients && (
            <div className="text-[13px] md:text-right">
              <p className="label text-[9.5px] text-muted">Cliente</p>
              <p className="mt-1 font-serif text-[19px]">{budget.clients.name}</p>
              <p className="text-muted">{budget.clients.email} · {budget.clients.phone}</p>
            </div>
          )}
        </div>
        <table className="mt-10 w-full text-[13.5px]">
          <thead>
            <tr className="label border-b border-black/15 text-left text-[9.5px] text-muted">
              <th className="py-2 font-normal">Partida</th><th className="w-16 font-normal">Cant.</th><th className="w-20 font-normal">Ud.</th><th className="w-28 text-right font-normal">Precio</th><th className="w-28 text-right font-normal">Total</th><th className="w-6 print:hidden" />
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-black/10 align-top">
                <td><input value={it.description} onChange={(e) => set(i, { description: e.target.value })} className={cell} placeholder="Descripción" /></td>
                <td><input type="number" value={it.quantity} onChange={(e) => set(i, { quantity: Number(e.target.value) })} className={cell} /></td>
                <td><input value={it.unit} onChange={(e) => set(i, { unit: e.target.value })} className={cell} /></td>
                <td><input type="number" value={it.unit_price} onChange={(e) => set(i, { unit_price: Number(e.target.value) })} className={`${cell} text-right`} /></td>
                <td className="py-2 text-right">{money(it.quantity * it.unit_price)}</td>
                <td className="print:hidden"><button aria-label="Eliminar" onClick={() => setItems(items.filter((_, j) => j !== i))} className="px-2 py-2 text-muted hover:text-clay">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setItems([...items, { description: "", quantity: 1, unit: "global", unit_price: 0 }])} className="mt-4 text-[12px] text-clay print:hidden">+ Añadir partida</button>
        <div className="ml-auto mt-8 w-full max-w-xs space-y-2 text-[14px]">
          <p className="flex justify-between"><span className="text-muted">Subtotal</span>{money(sub)}</p>
          <p className="flex items-center justify-between"><span className="text-muted">IVA <input type="number" value={meta.tax_rate} onChange={(e) => setMeta({ ...meta, tax_rate: Number(e.target.value) })} className="w-10 bg-transparent text-right outline-none" />%</span>{money(tax)}</p>
          <p className="flex justify-between border-t border-black/15 pt-3 font-serif text-[24px]"><span>Total</span>{money(sub + tax)}</p>
        </div>
        <textarea value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} placeholder="Condiciones, plazos, forma de pago…" className="mt-10 min-h-[100px] w-full resize-none bg-transparent text-[13px] leading-[1.7] text-muted outline-none" />
        <BudgetSignature />
      </article>
    </div>
  );
}
