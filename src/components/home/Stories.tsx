"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type Story = { title: string; image: string; video?: string };

const DURATION = 5000;

type Props = {
  stories: Story[];
  labels: { close: string; prev: string; next: string };
};

export function Stories({ stories, labels }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? null : i + 1 < stories.length ? i + 1 : null)),
    [stories.length],
  );
  const prev = useCallback(() => setActive((i) => (i === null ? null : Math.max(0, i - 1))), []);

  useEffect(() => {
    if (active === null) return;
    const timer = window.setTimeout(next, DURATION);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, next, prev, close]);

  const current = active === null ? null : stories[active];

  return (
    <>
      <div className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
        {stories.map((s, i) => (
          <button
            key={s.image}
            type="button"
            onClick={() => setActive(i)}
            className="group relative aspect-[9/16] w-[46vw] shrink-0 snap-start overflow-hidden bg-stone text-left sm:w-[32vw] md:w-auto"
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              sizes="(min-width: 768px) 22vw, 46vw"
              className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 text-white">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden>
                <path d="M0 0v12l10-6z" />
              </svg>
            </span>
            <span className="absolute bottom-4 left-4 right-4 font-serif text-[22px] leading-tight text-white">
              {s.title}
            </span>
          </button>
        ))}
      </div>

      {current && active !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso/95" role="dialog" aria-modal="true">
          <div className="relative h-full w-full overflow-hidden md:h-[88vh] md:w-auto md:aspect-[9/16]">
            {current.video ? (
              <video key={current.video} src={current.video} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div key={current.image} className="absolute inset-0 animate-[story-zoom_5s_linear_both]">
                <Image src={current.image} alt={current.title} fill sizes="(min-width: 768px) 50vh, 100vw" className="object-cover" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

            <div className="absolute inset-x-4 top-4 flex gap-1.5">
              {stories.map((s, i) => (
                <div key={s.image} className="h-[2px] flex-1 overflow-hidden bg-white/30">
                  <div
                    key={`${active}-${i}`}
                    className={`h-full origin-left bg-white ${
                      i < active ? "" : i === active ? "animate-[story-progress_5s_linear_both]" : "scale-x-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="absolute inset-x-4 top-9 flex items-center justify-between text-white">
              <span className="label">Nina Marquina · {current.title}</span>
              <button type="button" onClick={close} className="label opacity-90 hover:opacity-60" aria-label={labels.close}>
                ✕
              </button>
            </div>

            <button type="button" onClick={prev} aria-label={labels.prev} className="absolute inset-y-0 left-0 w-1/3" />
            <button type="button" onClick={next} aria-label={labels.next} className="absolute inset-y-0 right-0 w-2/3" />
          </div>
        </div>
      )}
    </>
  );
}
