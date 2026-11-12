import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDate, type Post } from "@/data/posts";
import { getPosts } from "@/lib/content";
import { PostCard } from "@/components/home/Journal";
import { Arrow } from "@/components/ui/Arrow";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journalPage" });
  const posts = await getPosts();
  return pageMetadata({
    locale,
    path: "/journal",
    title: t("metaTitle"),
    description: t("metaDescription"),
    image: posts[0]?.cover ?? undefined,
  });
}

export default async function JournalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("journalPage");
  const posts = await getPosts();
  const [first, ...rest] = posts;
  const meta = (p: Post) => `${formatDate(p.date, locale)} · ${t("minutes", { n: p.minutes })}`;

  return (
    <main className="bg-ivory pb-24 pt-[124px] md:pt-[150px]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Nina Marquina — Journal",
          url: `${site.url}/${locale}/journal`,
          inLanguage: "es",
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.date,
            url: `${site.url}/es/journal/${p.slug}`,
          })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(site.url, [
          { name: "Nina Marquina", path: `/${locale}` },
          { name: t("label"), path: `/${locale}/journal` },
        ])}
      />
      <div className="container-site">
        <p className="label mb-6 text-muted">{t("label")}</p>
        <h1 className="display max-w-3xl text-[44px] md:text-[64px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h1>
        <p className="mt-6 max-w-xl text-[15px] leading-[1.75] text-muted">{t("intro")}</p>

        {first && (
          <Link href={`/journal/${first.slug}`} className="group mt-16 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-14">
            <div className="relative aspect-[16/10] overflow-hidden bg-stone">
              {first.cover && (
                <Image
                  src={first.cover}
                  alt={first.title}
                  fill
                  priority
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
              )}
            </div>
            <div>
              <p className="label text-muted">{meta(first)}</p>
              <h2 className="display mt-4 text-[34px] md:text-[44px]">{first.title}</h2>
              <p className="mt-5 text-[14.5px] leading-[1.75] text-muted">{first.excerpt}</p>
              <span className="link-arrow mt-8 group-hover:text-clay">
                {t("read")} <Arrow className="arrow" />
              </span>
            </div>
          </Link>
        )}

        <div className="mt-20 grid gap-x-7 gap-y-14 border-t border-black/10 pt-14 md:grid-cols-3">
          {rest.map((p) => (
            <PostCard key={p.slug} post={p} meta={meta(p)} />
          ))}
        </div>
      </div>
    </main>
  );
}
