"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Arrow } from "../ui/Arrow";

export type CarouselItem = { slug: string; title: string; meta: string; image: string; alt: string };

type Props = {
  items: CarouselItem[];
  labels: { prev: string; next: string };
  basePath?: string;
  cols?: 2 | 3;
  metaFirst?: boolean;
};

const layouts = {
  2: { card: "w-[86%] md:w-[calc((100%-1.75rem)/2)]", aspect: "aspect-[16/9]", sizes: "(min-width: 768px) 50vw, 86vw", title: "text-[26px] md:text-[28px]" },
  3: { card: "w-[86%] md:w-[calc((100%-3.5rem)/3)]", aspect: "aspect-[4/3]", sizes: "(min-width: 768px) 33vw, 86vw", title: "text-[24px]" },
};

export function ProjectsCarousel({ items, labels, basePath = "/proyectos", cols = 2, metaFirst = false }: Props) {
  const layout = layouts[cols];
  const track = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const paused = hovered || focused || touched;
  const [index, setIndex] = useState(0);

  const cardStep = () => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
  };

  const go = useCallback((dir: 1 | -1) => {
    const el = track.current;
    const w = cardStep();
    if (!el || !w) return;
    const max = el.scrollWidth - el.clientWidth;
    let left = el.scrollLeft + dir * w;
    if (dir === 1 && el.scrollLeft >= max - 4) left = 0;
    if (dir === -1 && el.scrollLeft <= 4) left = max;
    el.scrollTo({ left, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), 5000);
    return () => window.clearInterval(id);
  }, [paused, go]);

  const onScroll = () => {
    const el = track.current;
    const w = cardStep();
    if (!el || !w) return;
    setIndex(Math.min(items.length - 1, Math.round(el.scrollLeft / w)));
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onTouchStart={() => setTouched(true)}
    >
      <div
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto [scrollbar-width:none] md:gap-7 [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        {items.map((p, i) => (
          <Link
            key={p.slug}
            href={`${basePath}/${p.slug}`}
            data-card
            className={`group block shrink-0 snap-start ${layout.card}`}
            aria-label={`${p.title} (${i + 1}/${items.length})`}
          >
            <div className={`relative w-full overflow-hidden bg-stone ${layout.aspect}`}>
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes={layout.sizes}
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
            </div>
            {metaFirst && <p className="label mt-5 text-muted">{p.meta}</p>}
            <div className={`flex items-start justify-between gap-4 ${metaFirst ? "mt-2" : "mt-5"}`}>
              <div>
                <h3 className={`font-serif leading-tight ${layout.title}`}>{p.title}</h3>
                {!metaFirst && <p className="label mt-2 text-muted">{p.meta}</p>}
              </div>
              <Arrow
                direction="up-right"
                className="mt-2.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between gap-6">
        <p className="label text-muted" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={labels.prev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 transition-colors hover:border-clay hover:text-clay"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={labels.next}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 transition-colors hover:border-clay hover:text-clay"
          >
            <Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}
