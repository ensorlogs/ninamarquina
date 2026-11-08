import es from "../../messages/es.json";

const o = es.quote.options as Record<string, Record<string, string>>;
export const opt = (group: string, key?: string | null) => (key ? (o[group]?.[key] ?? key) : "—");

export const REQUEST_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Nueva", cls: "bg-clay text-ivory" },
  contacted: { label: "Contactada", cls: "bg-[#C9A27E] text-charcoal" },
  quoted: { label: "Presupuesto enviado", cls: "bg-[#7C8A6E] text-ivory" },
  won: { label: "Ganada", cls: "bg-charcoal text-ivory" },
  lost: { label: "Perdida", cls: "bg-stone text-muted" },
  archived: { label: "Archivada", cls: "bg-stone text-muted" },
};

export const PROJECT_STATUS: Record<string, string> = {
  design: "Diseño",
  permits: "Permisos",
  construction: "En obra",
  done: "Terminado",
  paused: "En pausa",
  cancelled: "Cancelado",
};

export const BUDGET_STATUS: Record<string, string> = { draft: "Borrador", sent: "Enviado", accepted: "Aceptado", rejected: "Rechazado" };

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Caracas" });
