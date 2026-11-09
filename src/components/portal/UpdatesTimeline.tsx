import { fmtDay } from "@/lib/admin-labels";
import type { Phase, Update } from "@/lib/portal-data";

export function UpdatesTimeline({ updates, phases, actions }: { updates: Update[]; phases: Phase[]; actions?: (u: Update) => React.ReactNode }) {
  if (!updates.length) return <p className="text-[14px] text-muted">Todavía no hay avances publicados.</p>;
  const phaseName = new Map(phases.map((p) => [p.id, p.name]));
  return (
    <ol className="relative space-y-12 border-l border-black/15 pl-7">
      {updates.map((u) => (
        <li key={u.id} className={`relative ${u.visible ? "" : "opacity-50"}`}>
          <span className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full bg-clay" />
          <p className="label text-muted">
            {fmtDay(u.date)}
            {u.phase_id && phaseName.get(u.phase_id) && ` · ${phaseName.get(u.phase_id)}`}
            {!u.visible && " · Oculto al cliente"}
          </p>
          <h3 className="mt-2 font-serif text-[26px] leading-tight">{u.title}</h3>
          {u.body && <p className="mt-3 max-w-2xl whitespace-pre-line text-[14.5px] leading-[1.75] text-muted">{u.body}</p>}
          {!!u.urls.length && (
            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-3">
              {u.urls.map((src) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="group block aspect-[4/3] overflow-hidden bg-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs */}
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </a>
              ))}
            </div>
          )}
          {actions?.(u)}
        </li>
      ))}
    </ol>
  );
}
