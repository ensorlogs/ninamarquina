import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Arrow } from "@/components/ui/Arrow";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studioPage" });
  return pageMetadata({
    locale,
    path: "/estudio",
    title: t("metaTitle"),
    description: t("metaDescription"),
    image: "/images/stephany.jpg",
  });
}

export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("studioPage");
  const ts = await getTranslations("studio");
  const paragraphs = t.raw("paragraphs") as string[];
  const help = t.raw("help") as string[];

  return (
    <main className="bg-ivory pb-24 pt-[124px] md:pt-[150px]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Nina Marquina",
          jobTitle: t("role"),
          image: `${site.url}/images/stephany.jpg`,
          worksFor: { "@type": "Organization", name: "Nina Marquina", url: site.url },
          workLocation: site.locations.map((name) => ({ "@type": "Place", name })),
          sameAs: Object.values(site.social),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(site.url, [
          { name: "Nina Marquina", path: `/${locale}` },
          { name: t("label"), path: `/${locale}/estudio` },
        ])}
      />
      <div className="container-site grid gap-14 md:grid-cols-[1fr_1.15fr] md:gap-20">
        <div className="md:sticky md:top-32 md:self-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-espresso">
            <Image
              src="/images/stephany.jpg"
              alt={ts("imageAlt")}
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </div>
        <div>
          <p className="label mb-6 text-muted">{t("label")}</p>
          <h1 className="display text-[52px] md:text-[76px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h1>
          <p className="label mt-4 text-clay">{t("role")}</p>
          <div className="mt-10 space-y-6 text-[15.5px] leading-[1.85]">
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Image src="/images/firma-nina.png" alt={`Firma de Nina Marquina`} width={900} height={239} className="mt-10 h-auto w-44 md:w-52" />

          <p className="label mb-6 mt-16 text-muted">{t("helpLabel")}</p>
          <ol className="border-t border-black/10">
            {help.map((h, i) => (
              <li key={h} className="flex items-baseline gap-6 border-b border-black/10 py-5">
                <span className="label text-clay">{String(i + 1).padStart(3, "0")}</span>
                <span className="font-serif text-[24px]">{h}</span>
              </li>
            ))}
          </ol>

          <p className="label mb-3 mt-14 text-muted">{t("locationsLabel")}</p>
          <p className="font-serif text-[24px]">{site.locations.join(" · ")}</p>

          <Link href="/proyectos" className="link-arrow mt-12 hover:text-clay">
            {t("projectsLink")} <Arrow className="arrow" />
          </Link>
        </div>
      </div>
    </main>
  );
}
