"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteProject, saveProject, type ProjectInput } from "@/app/admin/content-actions";
import { uploadImages } from "./media";

type L = { es: string; en: string };
const btn = "bg-charcoal px-5 py-2.5 text-[10.5px] uppercase tracking-[0.16em] text-ivory hover:bg-clay disabled:opacity-50";
const small = "text-[12px] text-muted underline hover:text-clay";
const E: L = { es: "", en: "" };

function Pair({ label, value, onChange, area, rows = 3 }: { label: string; value: L; onChange: (v: L) => void; area?: boolean; rows?: number }) {
  const F = area ? "textarea" : "input";
  return (
    <div className="grid gap-x-6 md:grid-cols-2">
      {(["es", "en"] as const).map((k) => (
        <label key={k} className="block">
          <span className="label text-muted">
            {label} · {k.toUpperCase()}
          </span>
          <F value={value[k]} rows={area ? rows : undefined} onChange={(e) => onChange({ ...value, [k]: e.target.value })} className="input !text-[14.5px]" />
        </label>
      ))}
    </div>
  );
}

const toText = (a: string[]) => a.join("\n\n");
const toParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export function ProjectEditor({ id, initial }: { id: string; initial: ProjectInput }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [bodies, setBodies] = useState(initial.details.sections.map((s) => ({ es: toText(s.body.es), en: toText(s.body.en) })));
  const [highlights, setHighlights] = useState<L>({
    es: initial.details.highlights.map((h) => h.es).join("\n"),
    en: initial.details.highlights.map((h) => h.en).join("\n"),
  });
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof ProjectInput>(k: K, val: ProjectInput[K]) => setV((s) => ({ ...s, [k]: val }));
  const setD = <K extends keyof ProjectInput["details"]>(k: K, val: ProjectInput["details"][K]) => setV((s) => ({ ...s, details: { ...s.details, [k]: val } }));

  const moveImg = (i: number, dir: -1 | 1) => {
    const imgs = [...v.images];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set("images", imgs);
  };

  const add = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files, "projects");
      setV((s) => ({ ...s, images: [...s.images, ...urls] }));
    } catch {
      setMsg({ error: "No se pudieron subir las fotos. Prueba con JPG o PNG." });
    }
    setUploading(false);
  };

  const save = (published = v.published) =>
    start(async () => {
      setMsg(null);
      const hl = { es: highlights.es.split("\n"), en: highlights.en.split("\n") };
      const input: ProjectInput = {
        ...v,
        published,
        details: {
          ...v.details,
          sections: v.details.sections.map((s, i) => ({ title: s.title, body: { es: toParas(bodies[i]?.es ?? ""), en: toParas(bodies[i]?.en ?? "") } })),
          highlights: Array.from({ length: Math.max(hl.es.length, hl.en.length) }, (_, i) => ({ es: hl.es[i]?.trim() ?? "", en: hl.en[i]?.trim() ?? "" })),
        },
      };
      const r = await saveProject(id, input);
      if (r.error) return setMsg({ error: r.error });
      set("published", published);
      setMsg({ ok: published ? "Guardado. Ya se ve en la web." : "Guardado (oculto en la web)." });
      router.refresh();
    });

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-12">
        <section className="space-y-5">
          <p className="label text-clay">Datos</p>
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-[2fr_1fr_1fr]">
            <label className="block">
              <span className="label text-muted">Nombre</span>
              <input value={v.title} onChange={(e) => set("title", e.target.value)} className="input font-serif !text-[22px]" />
            </label>
            <label className="block">
              <span className="label text-muted">Año</span>
              <input type="number" value={v.year} onChange={(e) => set("year", Number(e.target.value))} className="input" />
            </label>
            <label className="block">
              <span className="label text-muted">Ubicación (opcional)</span>
              <input value={v.location} onChange={(e) => set("location", e.target.value)} placeholder="Punta Cana" className="input" />
            </label>
          </div>
          <Pair label="Categoría" value={v.category} onChange={(x) => set("category", x)} />
          <p className="-mt-3 text-[11.5px] text-muted">Ej.: «Residencial · Diseño arquitectónico y visualización 3D». La primera parte (antes del «·») sale como categoría.</p>
          <Pair label="Descripción" value={v.summary} onChange={(x) => set("summary", x)} area rows={5} />
          <Pair label="Alcance (opcional)" value={v.details.scope} onChange={(x) => setD("scope", x)} />
        </section>

        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="label text-clay">Fotos</p>
            <p className="text-[12px] text-muted">La primera es la portada.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {v.images.map((src, i) => (
              <div key={src} className="group relative aspect-[4/3] overflow-hidden bg-stone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 bg-charcoal px-2 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-ivory">Portada</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-2 py-1 text-[13px] text-white">
                  <span className="flex gap-3">
                    <button type="button" title="Mover antes" onClick={() => moveImg(i, -1)} disabled={i === 0} className="disabled:opacity-30">←</button>
                    <button type="button" title="Mover después" onClick={() => moveImg(i, 1)} disabled={i === v.images.length - 1} className="disabled:opacity-30">→</button>
                  </span>
                  <button type="button" title="Quitar" onClick={() => set("images", v.images.filter((_, k) => k !== i))}>✕</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => fileInput.current?.click()} className="aspect-[4/3] border border-dashed border-black/25 bg-sand text-[13px] text-muted hover:border-clay">
              {uploading ? "Subiendo…" : "+ Añadir fotos"}
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        </section>

        <section className="space-y-6">
          <p className="label text-clay">Ficha (opcional)</p>
          {v.details.facts.map((f, i) => (
            <div key={i} className="grid gap-x-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <Pair label="Dato" value={f.label} onChange={(x) => setD("facts", v.details.facts.map((g, k) => (k === i ? { ...g, label: x } : g)))} />
              <Pair label="Valor" value={f.value} onChange={(x) => setD("facts", v.details.facts.map((g, k) => (k === i ? { ...g, value: x } : g)))} />
              <button type="button" className={small} onClick={() => setD("facts", v.details.facts.filter((_, k) => k !== i))}>Quitar</button>
            </div>
          ))}
          <button type="button" className={small} onClick={() => setD("facts", [...v.details.facts, { label: { ...E }, value: { ...E } }])}>
            + Añadir dato (p. ej. Terreno · 40.000 m²)
          </button>
        </section>

        <section className="space-y-6">
          <p className="label text-clay">Sobre el proyecto (opcional)</p>
          {v.details.sections.map((s, i) => (
            <div key={i} className="space-y-4 border-l-2 border-stone pl-5">
              <div className="flex items-baseline justify-between">
                <span className="label text-muted">Bloque {String(i + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  className={small}
                  onClick={() => {
                    setD("sections", v.details.sections.filter((_, k) => k !== i));
                    setBodies((b) => b.filter((_, k) => k !== i));
                  }}
                >
                  Quitar bloque
                </button>
              </div>
              <Pair label="Título" value={s.title} onChange={(x) => setD("sections", v.details.sections.map((g, k) => (k === i ? { ...g, title: x } : g)))} />
              <Pair label="Texto (deja una línea en blanco entre párrafos)" value={bodies[i] ?? E} onChange={(x) => setBodies((b) => b.map((g, k) => (k === i ? x : g)))} area rows={7} />
            </div>
          ))}
          <button
            type="button"
            className={small}
            onClick={() => {
              setD("sections", [...v.details.sections, { title: { ...E }, body: { es: [], en: [] } }]);
              setBodies((b) => [...b, { ...E }]);
            }}
          >
            + Añadir bloque de texto
          </button>
          <Pair label="Puntos clave (uno por línea)" value={highlights} onChange={setHighlights} area rows={5} />
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <div className="space-y-3 bg-sand p-5">
          <p className="label text-muted">
            Estado: <span className={v.published ? "text-clay" : ""}>{v.published ? "Publicado" : "Oculto"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending || uploading} onClick={() => save()} className={btn}>Guardar</button>
            <button type="button" disabled={pending || uploading} onClick={() => save(!v.published)} className="border border-black/20 px-5 py-2.5 text-[10.5px] uppercase tracking-[0.16em] hover:border-clay hover:text-clay disabled:opacity-50">
              {v.published ? "Ocultar" : "Publicar"}
            </button>
          </div>
          {v.published && (
            <a href={`/es/proyectos/${v.slug}`} target="_blank" className="inline-block text-[12.5px] text-clay underline underline-offset-2">Ver en la web ↗</a>
          )}
          {pending && <p className="text-[12.5px] text-muted">Guardando…</p>}
          {msg?.ok && <p className="text-[12.5px] text-clay">{msg.ok}</p>}
          {msg?.error && <p className="text-[12.5px] text-[#8A1221]">{msg.error}</p>}
        </div>
        <label className="block">
          <span className="label text-muted">URL</span>
          <div className="flex items-baseline gap-1 text-[13px] text-muted">
            <span className="shrink-0">/proyectos/</span>
            <input value={v.slug} onChange={(e) => set("slug", e.target.value)} className="input !text-[13px]" />
          </div>
        </label>
        <form action={deleteProject.bind(null, id)} onSubmit={(e) => { if (!window.confirm("¿Borrar este proyecto del portfolio? No se puede deshacer.")) e.preventDefault(); }} className="border-t border-black/10 pt-6">
          <button className="text-[12px] text-muted underline hover:text-[#8A1221]">Borrar proyecto</button>
        </form>
      </aside>
    </div>
  );
}
