import Link from "next/link";
import { RequestTable } from "@/components/admin/RequestTable";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Dashboard() {
  const db = supabaseAdmin()!;
  const [{ data: reqs }, { count: clients }, { count: projects }, { count: budgets }] = await Promise.all([
    db.from("quote_requests").select("id,created_at,name,service,location,status").order("created_at", { ascending: false }).limit(200),
    db.from("clients").select("id", { count: "exact", head: true }),
    db.from("projects").select("id", { count: "exact", head: true }).not("status", "in", "(done,cancelled)"),
    db.from("budgets").select("id", { count: "exact", head: true }).eq("status", "sent"),
  ]);
  const all = reqs ?? [];
  const fresh = all.filter((r) => r.status === "new");
  const stats = [
    ["Solicitudes nuevas", fresh.length, "/admin/solicitudes?estado=new"],
    ["Clientes", clients ?? 0, "/admin/clientes"],
    ["Proyectos activos", projects ?? 0, "/admin/proyectos"],
    ["Presupuestos enviados", budgets ?? 0, "/admin/presupuestos"],
  ] as const;
  return (
    <>
      <p className="label text-muted">Resumen</p>
      <h1 className="display mt-3 text-[40px]">Hola, <em>equipo</em>.</h1>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {stats.map(([label, n, href]) => (
          <Link key={label} href={href} className="bg-sand p-6 transition-colors hover:bg-stone">
            <p className="font-serif text-[46px] leading-none">{n}</p>
            <p className="label mt-3 text-[9.5px] text-muted">{label}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-14 font-serif text-[26px]">Últimas solicitudes</h2>
      <RequestTable rows={all.slice(0, 8)} />
    </>
  );
}
