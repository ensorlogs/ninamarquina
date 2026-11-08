"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

type Props = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  handleLabel: string;
};

export function BeforeAfterSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  handleLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden bg-stone md:aspect-[16/8]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging && update(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      style={{ cursor: dragging ? "grabbing" : "ew-resize" }}
    >
      <Image src={after} alt={afterAlt} fill sizes="100vw" className="pointer-events-none object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={beforeAlt} fill sizes="100vw" className="pointer-events-none object-cover" />
      </div>

      <span className="label pointer-events-none absolute left-5 top-5 bg-ivory/85 px-3 py-2 text-charcoal backdrop-blur md:left-7 md:top-7">
        {beforeLabel}
      </span>
      <span className="label pointer-events-none absolute right-5 top-5 bg-ivory/85 px-3 py-2 text-charcoal backdrop-blur md:right-7 md:top-7">
        {afterLabel}
      </span>

      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -translate-x-1/2 border-l border-white/90" />
        <div
          role="slider"
          tabIndex={0}
          aria-label={handleLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className="pointer-events-auto absolute top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full border border-white/80 bg-black/25 text-white backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden>
            <path d="M6 1 1 6l5 5" stroke="currentColor" />
          </svg>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden>
            <path d="m1 1 5 5-5 5" stroke="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
