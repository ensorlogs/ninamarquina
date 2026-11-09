import { PHASE_STATUS, fmtDay } from "@/lib/admin-labels";
import type { Phase } from "@/lib/portal-data";

export function PhaseTrack({ phases }: { phases: Phase[] }) {
  if (!phases.length) return <p className="text-[14px] text-muted">Pronto verás aquí las fases de tu proyecto.</p>;
  return (
    <ol className="grid gap-px bg-black/10 md:auto-cols-fr md:grid-flow-col">
      {phases.map((p, i) => (
        <li key={p.id} className={`p-5 ${p.status === "in_progress" ? "bg-sand" : "bg-ivory"}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="label text-muted">Fase {String(i + 1).padStart(2, "0")}</span>
            <span
              className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                p.status === "done" ? "bg-charcoal text-ivory" : p.status === "in_progress" ? "bg-clay text-ivory" : "bg-stone text-muted"
              }`}
            >
              {PHASE_STATUS[p.status]}
            </span>
          </div>
          <p className="mt-4 font-serif text-[24px] leading-tight">{p.name}</p>
          <div className="mt-4 h-1 bg-stone">
            <div className="h-full bg-clay" style={{ width: `${p.progress}%` }} />
          </div>
          <p className="mt-2 text-[12px] text-muted">
            {p.progress}%{p.start_date && ` · ${fmtDay(p.start_date)}`}
            {p.end_date && ` → ${fmtDay(p.end_date)}`}
          </p>
          {p.notes && <p className="mt-3 text-[13px] leading-[1.6] text-muted">{p.notes}</p>}
        </li>
      ))}
    </ol>
  );
}
