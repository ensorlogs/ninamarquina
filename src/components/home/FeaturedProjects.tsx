import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { featuredProjects } from "@/data/projects";
import { Arrow } from "../ui/Arrow";

export async function FeaturedProjects() {
  const t = await getTranslations("projects");
  const locale = (await getLocale()) as Locale;
  return (
    <section id="proyectos" className="scroll-mt-20 bg-ivory py-20 md:py-24">
      <div className="container-site">
        <div className="mb-8 flex items-center justify-between gap-6">
          <p className="label text-muted">{t("label")}</p>
          <Link href="/#proyectos" className="link-arrow text-muted hover:text-clay">
            {t("viewAll")} <Arrow className="arrow" />
          </Link>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:gap-7">
          {featuredProjects.map((p) => (
            <Link key={p.slug} href="/#proyectos" className="group block">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone">
                <Image
                  src={p.images[0]}
                  alt={`${t("altPrefix")} ${p.title}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-[26px] leading-tight md:text-[28px]">{p.title}</h3>
                  <p className="label mt-2 text-muted">
                    {[p.location, p.category[locale], p.year].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Arrow
                  direction="up-right"
                  className="mt-2.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
