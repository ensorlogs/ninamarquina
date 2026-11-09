import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDate, posts } from "@/data/posts";
import { Arrow } from "../ui/Arrow";
import { ProjectsCarousel } from "./ProjectsCarousel";
import { Stories, type Story } from "./Stories";

export async function Journal() {
  const t = await getTranslations("journal");
  const tp = await getTranslations("journalPage");
  const locale = await getLocale();
  const stories = t.raw("stories") as Story[];

  return (
    <section id="journal" className="scroll-mt-20 overflow-hidden bg-ivory py-20 md:py-28">
      <div className="container-site">
        <div className="mb-8 flex items-center justify-between gap-6">
          <p className="label text-muted">{t("label")}</p>
          <Link href="/journal" className="link-arrow text-muted hover:text-clay">
            {t("viewAll")} <Arrow className="arrow" />
          </Link>
        </div>

        <ProjectsCarousel
          items={posts
            .filter((post) => post.cover)
            .map((post) => ({
              slug: post.slug,
              title: post.title,
              meta: `${formatDate(post.date, locale)} · ${tp("minutes", { n: post.minutes })}`,
              image: post.cover as string,
              alt: post.title,
            }))}
          labels={{ prev: t("prev"), next: t("next") }}
          basePath="/journal"
          cols={3}
          metaFirst
        />

        <div className="mt-20 border-t border-black/10 pt-12 md:mt-24">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <p className="label text-muted">{t("storiesLabel")}</p>
            <p className="font-serif text-[20px] italic text-muted">{t("storiesHint")}</p>
          </div>
          <Stories stories={stories} labels={{ close: t("close"), prev: t("prev"), next: t("next") }} />
        </div>
      </div>
    </section>
  );
}

export function PostCard({ post, meta }: { post: (typeof posts)[number]; meta: string }) {
  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        {post.cover && (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
          />
        )}
      </div>
      <p className="label mt-5 text-muted">{meta}</p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <h3 className="font-serif text-[24px] leading-[1.15]">{post.title}</h3>
        <Arrow direction="up-right" className="mt-2 shrink-0" />
      </div>
    </Link>
  );
}
