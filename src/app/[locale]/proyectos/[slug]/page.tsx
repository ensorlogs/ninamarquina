import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { projects } from "@/data/projects";
import { Arrow } from "@/components/ui/Arrow";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  const l = locale as Locale;
  return pageMetadata({
    locale,
    path: `/proyectos/${p.slug}`,
    title: `${p.title} — ${p.category[l].split(" · ")[0]} | Nina Marquina`,
    description: p.summary[l].slice(0, 158),
    image: p.images[0],
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const index = projects.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const l = locale as Locale;
  const t = await getTranslations("projectsPage");
  const tp = await getTranslations("projects");

  const facts = [
    { label: t("year"), value: String(p.year) },
    ...(p.location ? [{ label: t("location"), value: p.location }] : []),
    { label: t("category"), value: p.category[l] },
  ];

  return (
    <main className="bg-ivory pb-24 pt-[124px] md:pt-[150px]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.title,
          description: p.summary[l],
          image: p.images.map((src) => `${site.url}${src}`),
          dateCreated: String(p.year),
          genre: p.category[l],
          ...(p.location ? { locationCreated: { "@type": "Place", name: p.location } } : {}),
          creator: { "@type": "Person", name: "Stephany Seijas", worksFor: { "@type": "Organization", name: "Nina Marquina" } },
          url: `${site.url}/${locale}/proyectos/${p.slug}`,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(site.url, [
          { name: t("home"), path: `/${locale}` },
          { name: t("label"), path: `/${locale}/proyectos` },
          { name: p.title, path: `/${locale}/proyectos/${p.slug}` },
        ])}
      />
      <div className="container-site">
        <Link href="/proyectos" className="link-arrow text-muted hover:text-clay">
          <Arrow direction="left" className="arrow" /> {t("all")}
        </Link>
        <div className="mt-10 grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
          <h1 className="display text-[44px] md:text-[72px]">{p.title}</h1>
          <dl className="grid grid-cols-2 gap-6 border-t border-black/10 pt-6 md:grid-cols-1 md:gap-4">
            {facts.map((f) => (
              <div key={f.label} className="md:flex md:justify-between md:gap-6">
                <dt className="label text-muted">{f.label}</dt>
                <dd className="mt-1 text-[14px] md:mt-0 md:text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mt-12 aspect-[16/9] overflow-hidden bg-stone">
          <Image src={p.images[0]} alt={`${tp("altPrefix")} ${p.title}`} fill priority sizes="100vw" className="object-cover" />
        </div>

        <p className="mx-auto mt-16 max-w-3xl font-serif text-[24px] leading-[1.45] md:text-[30px]">{p.summary[l]}</p>

        {p.images.length > 1 && (
          <section className="mt-20">
            <p className="label mb-8 text-muted">{t("gallery")}</p>
            <div className="grid gap-5 md:grid-cols-2 md:gap-7">
              {p.images.slice(1).map((src, i, arr) => (
                <div
                  key={src}
                  className={`relative overflow-hidden bg-stone ${
                    arr.length % 2 === 1 && i === 0 ? "aspect-[16/9] md:col-span-2" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${tp("altPrefix")} ${p.title} — ${i + 2}`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-24 bg-espresso px-6 py-14 text-ivory md:px-14 md:py-16">
          <p className="label text-ivory/65">{t("cta.label")}</p>
          <div className="mt-5 grid gap-8 md:grid-cols-[1.4fr_auto] md:items-end">
            <p className="display text-[32px] md:text-[44px]">{t.rich("cta.title", { em: (c) => <em>{c}</em> })}</p>
            <Link
              href="/cotizar"
              className="link-arrow justify-self-start bg-ivory px-8 py-4 text-charcoal transition-colors hover:bg-clay hover:text-ivory"
            >
              {t("cta.button")} <Arrow className="arrow" />
            </Link>
          </div>
        </section>

        <Link href={`/proyectos/${next.slug}`} className="group mt-16 flex items-center justify-between gap-6 border-t border-black/10 pt-10">
          <div>
            <p className="label text-muted">{tp("next")}</p>
            <p className="mt-3 font-serif text-[34px] leading-tight md:text-[48px]">{next.title}</p>
          </div>
          <Arrow className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </main>
  );
}
