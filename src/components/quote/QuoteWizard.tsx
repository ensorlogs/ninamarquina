"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import {
  BUDGETS,
  CARACAS_ZONES,
  CITIES,
  CONTACT_PREFS,
  COUNTRIES,
  EMAIL_RE,
  FILE_TYPES,
  MAX_FILE_BYTES,
  MAX_FILES,
  NEEDS,
  PROPERTY_STATUS,
  PROPERTY_TYPES,
  SERVICES,
  PLACE_NAMES,
  TIMELINES,
  formatLocation,
  locationError,
  type QuoteInput,
} from "@/lib/quote";
import { site } from "@/lib/site";
import { Arrow } from "../ui/Arrow";

const STEPS = ["service", "property", "needs", "budget", "files", "contact"] as const;
const SERVICE_IMAGES: Record<string, string> = {
  reformas: "/images/services/reformas.webp",
  arquitectura: "/images/services/arquitectura.webp",
  construccion: "/images/services/construccion.webp",
  interiorismo: "/images/services/interiorismo.webp",
  render3d: "/images/services/render3d.webp",
  otro: "/images/mirada.jpg",
};

export function QuoteWizard({ initialService }: { initialService?: string }) {
  const t = useTranslations("quote");
  const locale = useLocale() as "es" | "en";
  const top = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [showError, setShowError] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const [q, setQ] = useState<QuoteInput>({
    locale,
    service: (initialService as QuoteInput["service"]) ?? "",
    propertyType: "",
    propertyStatus: "",
    area: "",
    country: "",
    city: "",
    cityOther: "",
    zone: "",
    needs: [],
    description: "",
    budget: "",
    timeline: "",
    links: "",
    files: [],
    name: "",
    email: "",
    phone: "",
    contactPref: "whatsapp",
    consent: false,
    newsletter: true,
    company: "",
  });

  const set = <K extends keyof QuoteInput>(k: K, v: QuoteInput[K]) => setQ((p) => ({ ...p, [k]: v }));
  const opt = (group: string, key: string) => t(`options.${group}.${key}`);
  const place = (k: string) => (k === "otra" ? t("options.place.otra") : PLACE_NAMES[k]);
  const [zoneOther, setZoneOther] = useState(false);
  const cities = q.country ? CITIES[q.country] : undefined;
  const zoneKey = CARACAS_ZONES.find((k) => k !== "otra" && PLACE_NAMES[k] === q.zone) ?? (zoneOther ? "otra" : "");

  const valid = [
    !!q.service,
    !!q.propertyType && !locationError(q),
    true,
    !!q.budget && !!q.timeline,
    true,
    q.name.trim().length > 1 && EMAIL_RE.test(q.email) && q.phone.replace(/\D/g, "").length >= 7 && q.consent,
  ];

  const goTo = (n: number) => {
    setShowError(false);
    setStep(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const next = () => (valid[step] ? goTo(step + 1) : setShowError(true));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFileError("");
    const accepted: File[] = [];
    for (const f of Array.from(list)) {
      if (!FILE_TYPES.includes(f.type)) setFileError(t("drop.badType", { name: f.name }));
      else if (f.size > MAX_FILE_BYTES) setFileError(t("drop.tooBig", { name: f.name }));
      else accepted.push(f);
    }
    setFiles((prev) => {
      const all = [...prev, ...accepted];
      if (all.length > MAX_FILES) setFileError(t("drop.tooMany", { max: MAX_FILES }));
      return all.slice(0, MAX_FILES);
    });
  };

  const submit = async () => {
    if (!valid[5]) return setShowError(true);
    setShowError(false);
    setStatus("sending");
    setErrorMsg("");
    try {
      let paths: string[] = [];
      if (files.length) {
        const res = await fetch("/api/quote/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })) }),
        });
        if (!res.ok) throw new Error("upload");
        const { uploads } = (await res.json()) as { uploads: { path: string; signedUrl: string }[] };
        await Promise.all(
          uploads.map(async (u, i) => {
            const r = await fetch(u.signedUrl, { method: "PUT", headers: { "Content-Type": files[i].type }, body: files[i] });
            if (!r.ok) throw new Error("upload");
          }),
        );
        paths = uploads.map((u) => u.path);
      }
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...q, files: paths }),
      });
      if (!res.ok) throw new Error("submit");
      setStatus("done");
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error && e.message === "upload" ? t("error.upload") : t("error.generic", { email: site.email }));
    }
  };

  if (status === "done") {
    return (
      <div ref={top} className="mt-14 scroll-mt-32 bg-sand px-6 py-16 text-center md:px-16 md:py-24">
        <p className="label text-clay">Nina Marquina</p>
        <h2 className="display mt-6 text-[40px] md:text-[56px]">{t("success.title", { name: q.name.split(" ")[0] })}</h2>
        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.75] text-muted">{t("success.body")}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/" className="link-arrow bg-charcoal px-8 py-4 text-ivory hover:bg-clay">
            {t("success.home")} <Arrow className="arrow" />
          </Link>
          <Link href="/proyectos" className="link-arrow border border-charcoal/30 px-8 py-4 hover:border-charcoal">
            {t("success.projects")}
          </Link>
        </div>
      </div>
    );
  }

  const key = STEPS[step];
  const summary: [string, string][] = [
    [t("steps.service.title"), q.service && opt("service", q.service)],
    [t("fields.propertyType"), q.propertyType && opt("propertyType", q.propertyType)],
    [t("fields.area"), q.area && `${q.area} m²`],
    [t("fields.location"), [q.country && formatLocation(q, q.country === "otro" ? "" : opt("country", q.country)), q.zone].filter(Boolean).join(" · ")],
    [t("fields.needs"), q.needs.map((n) => opt("needs", n)).join(", ")],
    [t("fields.budget"), q.budget && opt("budget", q.budget)],
    [t("fields.timeline"), q.timeline && opt("timeline", q.timeline)],
    [t("steps.files.title"), files.length ? `${files.length}` : ""],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div ref={top} className="mt-14 grid scroll-mt-32 gap-12 md:grid-cols-[1fr_300px] md:gap-16">
      <div>
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s} className={`h-[3px] flex-1 transition-colors duration-500 ${i <= step ? "bg-clay" : "bg-stone"}`} />
          ))}
        </div>
        <p className="label mt-5 text-muted">{t("stepOf", { n: step + 1, total: STEPS.length })}</p>
        <h2 className="display mt-3 text-[32px] md:text-[42px]">{t(`steps.${key}.title`)}</h2>
        <p className="mt-2 text-[14px] text-muted">{t(`steps.${key}.hint`)}</p>

        <div key={key} className="mt-10 animate-fade-up">
          {key === "service" && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    set("service", s);
                    goTo(1);
                  }}
                  aria-pressed={q.service === s}
                  className={`group relative aspect-[4/5] overflow-hidden text-left text-ivory outline-offset-4 transition ${
                    q.service === s ? "ring-2 ring-clay ring-offset-4 ring-offset-ivory" : ""
                  }`}
                >
                  <Image src={SERVICE_IMAGES[s]} alt="" fill sizes="(min-width: 768px) 22vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <span className="absolute inset-x-4 bottom-4">
                    <span className="block font-serif text-[21px] leading-tight md:text-[24px]">{opt("service", s)}</span>
                    <span className="mt-1 block text-[12px] text-ivory/75">{opt("serviceDesc", s)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {key === "property" && (
            <div className="space-y-10">
              <Field label={t("fields.propertyType")}>
                <Pills options={PROPERTY_TYPES} value={q.propertyType} onChange={(v) => set("propertyType", v)} label={(k) => opt("propertyType", k)} />
              </Field>
              <Field label={t("fields.propertyStatus")} optional={t("optional")}>
                <Pills options={PROPERTY_STATUS} value={q.propertyStatus} onChange={(v) => set("propertyStatus", v)} label={(k) => opt("propertyStatus", k)} />
              </Field>
              <Field label={t("fields.country")}>
                <Pills
                  options={COUNTRIES}
                  value={q.country}
                  onChange={(v) => {
                    setQ((p) => ({ ...p, country: v, city: "", cityOther: "", zone: "" }));
                    setZoneOther(false);
                  }}
                  label={(k) => opt("country", k)}
                />
              </Field>
              {cities && (
                <Field label={t("fields.city")}>
                  <Pills
                    options={cities}
                    value={q.city}
                    onChange={(v) => {
                      setQ((p) => ({ ...p, city: v, cityOther: "", zone: "" }));
                      setZoneOther(false);
                    }}
                    label={place}
                  />
                </Field>
              )}
              {q.country && (!cities || q.city === "otra") && (
                <Field label={t(q.country === "otro" ? "fields.countryCity" : "fields.cityName")}>
                  <input className="input max-w-md" value={q.cityOther} onChange={(e) => set("cityOther", e.target.value)} />
                </Field>
              )}
              {q.city === "caracas" && (
                <Field label={t("fields.zone")} optional={t("optional")}>
                  <Pills
                    options={CARACAS_ZONES}
                    value={zoneKey}
                    onChange={(v) => {
                      setZoneOther(v === "otra");
                      set("zone", v === "otra" ? "" : PLACE_NAMES[v]);
                    }}
                    label={place}
                  />
                </Field>
              )}
              <div className="grid gap-8 md:grid-cols-2">
                {q.country && (q.city !== "caracas" || zoneOther) && (
                  <Field label={t("fields.zone")} optional={t("optional")}>
                    <input className="input" value={q.zone} onChange={(e) => set("zone", e.target.value)} placeholder={q.city === "caracas" ? "Los Naranjos, Oripoto…" : ""} />
                  </Field>
                )}
                <Field label={t("fields.area")} optional={t("optional")}>
                  <input className="input" inputMode="numeric" value={q.area} onChange={(e) => set("area", e.target.value.replace(/[^\d]/g, ""))} placeholder="120" />
                </Field>
              </div>
            </div>
          )}

          {key === "needs" && (
            <div className="space-y-10">
              <Field label={t("fields.needs")}>
                <div className="flex flex-wrap gap-2.5">
                  {NEEDS.map((n) => {
                    const on = q.needs.includes(n);
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("needs", on ? q.needs.filter((x) => x !== n) : [...q.needs, n])}
                        className={`pill ${on ? "pill-on" : ""}`}
                      >
                        {on ? "✓ " : "+ "}
                        {opt("needs", n)}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label={t("fields.description")} optional={t("optional")}>
                <textarea className="input min-h-[150px] resize-y" value={q.description} onChange={(e) => set("description", e.target.value)} placeholder={t("fields.descriptionPh")} maxLength={4000} />
              </Field>
            </div>
          )}

          {key === "budget" && (
            <div className="space-y-10">
              <Field label={t("fields.budget")}>
                <Pills options={BUDGETS} value={q.budget} onChange={(v) => set("budget", v)} label={(k) => opt("budget", k)} />
              </Field>
              <Field label={t("fields.timeline")}>
                <Pills options={TIMELINES} value={q.timeline} onChange={(v) => set("timeline", v)} label={(k) => opt("timeline", k)} />
              </Field>
            </div>
          )}

          {key === "files" && (
            <div className="space-y-10">
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addFiles(e.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-14 text-center transition-colors ${
                  dragging ? "border-clay bg-sand" : "border-charcoal/25 hover:border-clay hover:bg-sand/60"
                }`}
              >
                <span className="font-serif text-[26px]">{t("drop.title")}</span>
                <span className="mt-2 text-[14px] text-muted">
                  {t("drop.or")} <span className="text-clay underline underline-offset-4">{t("drop.browse")}</span>
                </span>
                <span className="label mt-5 text-muted">{t("drop.limits", { max: MAX_FILES })}</span>
                <input type="file" multiple accept={FILE_TYPES.join(",")} className="sr-only" onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }} />
              </label>
              {fileError && <p className="text-[13px] text-clay">{fileError}</p>}
              {files.length > 0 && (
                <ul className="grid grid-cols-3 gap-3 md:grid-cols-5">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="group relative aspect-square overflow-hidden bg-stone">
                      {f.type.startsWith("image/") && f.type !== "image/heic" && f.type !== "image/heif" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center p-2 text-center text-[11px] text-muted">{f.name}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, j) => j !== i))}
                        className="absolute right-1.5 top-1.5 bg-ivory/90 px-2 py-0.5 text-[11px]"
                        aria-label={`${t("drop.remove")} ${f.name}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Field label={t("fields.links")} optional={t("optional")}>
                <textarea className="input min-h-[100px] resize-y" value={q.links} onChange={(e) => set("links", e.target.value)} placeholder={t("fields.linksPh")} />
              </Field>
            </div>
          )}

          {key === "contact" && (
            <div className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <Field label={t("fields.name")}>
                  <input className="input" autoComplete="name" value={q.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label={t("fields.phone")}>
                  <input className="input" type="tel" autoComplete="tel" value={q.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+58 412 000 0000" />
                </Field>
              </div>
              <Field label={t("fields.email")}>
                <input className="input" type="email" autoComplete="email" value={q.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label={t("fields.contactPref")}>
                <Pills options={CONTACT_PREFS} value={q.contactPref} onChange={(v) => set("contactPref", v)} label={(k) => opt("contactPref", k)} />
              </Field>
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
                value={q.company}
                onChange={(e) => set("company", e.target.value)}
              />
              <label className="flex items-start gap-3 text-[13.5px] leading-[1.6] text-muted">
                <input type="checkbox" checked={q.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 h-4 w-4 accent-clay" />
                {t("fields.consent")}
              </label>
              <label className="flex items-start gap-3 text-[13.5px] leading-[1.6] text-muted">
                <input type="checkbox" checked={q.newsletter} onChange={(e) => set("newsletter", e.target.checked)} className="mt-1 h-4 w-4 accent-clay" />
                {t("fields.newsletter")}
              </label>
            </div>
          )}
        </div>

        {showError && <p className="mt-8 text-[13px] text-clay" role="alert">{t("required")}</p>}
        {status === "error" && <p className="mt-8 text-[13px] text-clay" role="alert">{errorMsg}</p>}

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-black/10 pt-8">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} className="link-arrow text-muted hover:text-charcoal">
              <Arrow direction="left" className="arrow" /> {t("back")}
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            key !== "service" && (
              <button type="button" onClick={next} className="link-arrow bg-charcoal px-8 py-4 text-ivory transition-colors hover:bg-clay">
                {t("next")} <Arrow className="arrow" />
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={status === "sending"}
              className="link-arrow bg-clay px-8 py-4 text-ivory transition-colors hover:bg-charcoal disabled:opacity-60"
            >
              {status === "sending" ? t("sending") : t("submit")} <Arrow className="arrow" />
            </button>
          )}
        </div>
      </div>

      <aside className="hidden md:block">
        <div className="sticky top-32 bg-sand p-7">
          <p className="label text-muted">{t("summary")}</p>
          {summary.length === 0 ? (
            <p className="mt-5 font-serif text-[20px] italic text-muted">—</p>
          ) : (
            <dl className="mt-5 space-y-4">
              {summary.map(([k, v]) => (
                <div key={k}>
                  <dt className="label text-[9.5px] text-muted">{k}</dt>
                  <dd className="mt-1 font-serif text-[18px] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: string; children: ReactNode }) {
  return (
    <div>
      <p className="label mb-4 text-charcoal">
        {label} {optional && <span className="ml-2 normal-case tracking-normal text-muted">({optional})</span>}
      </p>
      {children}
    </div>
  );
}

function Pills<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: string;
  onChange: (v: T) => void;
  label: (k: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)} className={`pill ${value === o ? "pill-on" : ""}`}>
          {label(o)}
        </button>
      ))}
    </div>
  );
}
