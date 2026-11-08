"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay">
      Descargar PDF
    </button>
  );
}
