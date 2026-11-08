import Link from "next/link";
import { notFound } from "next/navigation";
import { BudgetEditor } from "@/components/admin/BudgetEditor";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Budget({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: b } = await supabaseAdmin()!.from("budgets").select("*, clients(name,email,phone,location), budget_items(*)").eq("id", id).maybeSingle();
  if (!b) notFound();
  b.budget_items.sort((x: { position: number }, y: { position: number }) => x.position - y.position);
  return (
    <>
      <Link href="/admin/presupuestos" className="label text-muted hover:text-charcoal print:hidden">← Presupuestos</Link>
      <BudgetEditor budget={b} />
    </>
  );
}
