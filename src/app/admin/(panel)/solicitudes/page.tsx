import Link from "next/link";
import { RequestTable } from "@/components/admin/RequestTable";
import { REQUEST_STATUS } from "@/lib/admin-labels";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function Requests({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  let q = supabaseAdmin()!.from("quote_requests").select("id,created_at,name,service,location,status").order("created_at", { ascending: false });
  q = estado && estado in REQUEST_STATUS ? q.eq("status", estado) : q.neq("status", "archived");
  const { data } = await q;
  return (
    <>
      <p className="label text-muted">CRM</p>
      <h1 className="display mt-3 text-[40px]">Solicitudes</h1>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/solicitudes" className={`pill ${!estado ? "pill-on" : ""}`}>Activas</Link>
        {Object.entries(REQUEST_STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/solicitudes?estado=${k}`} className={`pill ${estado === k ? "pill-on" : ""}`}>{v.label}</Link>
        ))}
      </div>
      <RequestTable rows={data ?? []} />
    </>
  );
}
