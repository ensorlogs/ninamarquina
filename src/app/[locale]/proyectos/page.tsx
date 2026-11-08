import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { projectMeta, projects } from "@/data/projects";
import { Arrow } from "@/components/ui/Arrow";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  return pageMetadata({
    locale,
    path: "/proyectos",
    title: t("metaTitle"),
    description: t("metaDescription"),
    image: projects[0].images[0],
  });
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projectsPage");
  const tp = await getTranslations("projects");

  return (
    <main className="bg-ivory pb-24 pt-[124px] md:pt-[150px]">
      <JsonLd
        data={breadcrumbJsonLd(site.url, [
          { name: t("home"), path: `/${locale}` },
          { name: t("label"), path: `/${locale}/proyectos` },
        ])}
      />
      <div className="container-site">
        <p className="label mb-6 text-muted">{t("label")}</p>
        <h1 className="display max-w-3xl text-[44px] md:text-[64px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h1>
        <p className="mt-6 max-w-xl text-[15px] leading-[1.75] text-muted">{t("intro")}</p>

        <div className="mt-16 grid gap-x-7 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <Link key={p.slug} href={`/proyectos/${p.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-stone">
                <Image
                  src={p.images[0]}
                  alt={`${tp("altPrefix")} ${p.title}`}
                  fill
                  priority={i < 2}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[28px] leading-tight">{p.title}</h2>
                  <p className="label mt-2 text-muted">{projectMeta(p, locale as Locale)}</p>
                </div>
                <Arrow direction="up-right" className="mt-2.5 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
