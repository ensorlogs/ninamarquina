import Link from "next/link";
import { REQUEST_STATUS, fmtDate, opt } from "@/lib/admin-labels";

export function RequestTable({ rows }: { rows: { id: string; created_at: string; name: string; service: string; location: string; status: string }[] }) {
  if (!rows.length) return <p className="mt-6 text-[14px] text-muted">Todavía no hay solicitudes.</p>;
  return (
    <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
      {rows.map((r) => (
        <Link key={r.id} href={`/admin/solicitudes/${r.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 py-4 hover:bg-sand/60 md:grid-cols-[1.2fr_1fr_1fr_auto_110px] md:px-3">
          <span className="font-serif text-[19px]">{r.name}</span>
          <span className="hidden text-[13px] md:block">{opt("service", r.service)}</span>
          <span className="hidden text-[13px] text-muted md:block">{opt("location", r.location)}</span>
          <span className={`px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] ${REQUEST_STATUS[r.status]?.cls}`}>{REQUEST_STATUS[r.status]?.label}</span>
          <span className="hidden text-right text-[12px] text-muted md:block">{fmtDate(r.created_at)}</span>
        </Link>
      ))}
    </div>
  );
}
