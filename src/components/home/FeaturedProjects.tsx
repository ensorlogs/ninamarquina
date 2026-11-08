import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { projects, projectMeta } from "@/data/projects";
import { Arrow } from "../ui/Arrow";
import { ProjectsCarousel } from "./ProjectsCarousel";

export async function FeaturedProjects() {
  const t = await getTranslations("projects");
  const locale = (await getLocale()) as Locale;
  const items = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    meta: projectMeta(p, locale),
    image: p.images[0],
    alt: `${t("altPrefix")} ${p.title}`,
  }));
  return (
    <section id="proyectos" className="scroll-mt-20 overflow-hidden bg-ivory py-20 md:py-24">
      <div className="container-site">
        <div className="mb-8 flex items-center justify-between gap-6">
          <p className="label text-muted">{t("label")}</p>
          <Link href="/proyectos" className="link-arrow text-muted hover:text-clay">
            {t("viewAll")} <Arrow className="arrow" />
          </Link>
        </div>
        <ProjectsCarousel items={items} labels={{ prev: t("prev"), next: t("next") }} />
      </div>
    </section>
  );
}
