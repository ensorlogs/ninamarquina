import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDate, posts } from "@/data/posts";
import { PostCard } from "@/components/home/Journal";
import { Arrow } from "@/components/ui/Arrow";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) return {};
  return pageMetadata({
    locale,
    path: `/journal/${p.slug}`,
    title: `${p.title} | Nina Marquina`,
    description: p.excerpt.slice(0, 158),
    image: p.cover ?? undefined,
    type: "article",
    locales: ["es"],
  });
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = posts.find((x) => x.slug === slug);
  if (!post) notFound();
  const t = await getTranslations("journalPage");
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = `${site.url}/es/journal/${post.slug}`;

  return (
    <main className="bg-ivory pb-24 pt-[124px] md:pt-[150px]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          inLanguage: "es",
          image: post.cover ? `${site.url}${post.cover}` : undefined,
          author: { "@type": "Person", name: "Stephany Marquina", url: site.social.linkedin },
          publisher: { "@type": "Organization", name: "Nina Marquina", url: site.url },
          mainEntityOfPage: url,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(site.url, [
          { name: "Nina Marquina", path: `/${locale}` },
          { name: t("label"), path: `/${locale}/journal` },
          { name: post.title, path: `/${locale}/journal/${post.slug}` },
        ])}
      />
      <article className="container-site" lang="es">
        <div className="mx-auto max-w-3xl">
          <Link href="/journal" className="link-arrow text-muted hover:text-clay">
            <Arrow direction="left" className="arrow" /> {t("back")}
          </Link>
          <p className="label mt-10 text-muted">
            {formatDate(post.date, locale)} · {t("minutes", { n: post.minutes })} · Stephany Marquina
          </p>
          <h1 className="display mt-5 text-[40px] md:text-[58px]">{post.title}</h1>
          {t("spanishOnly") && <p className="mt-5 font-serif text-[18px] italic text-muted">{t("spanishOnly")}</p>}
        </div>
        {post.cover && (
          <div className="relative mx-auto mt-12 aspect-[16/9] max-w-5xl overflow-hidden bg-stone">
            <Image src={post.cover} alt={post.title} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="prose-nm mx-auto mt-14 max-w-3xl" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      <section className="container-site mt-24 border-t border-black/10 pt-14">
        <p className="label mb-8 text-muted">{t("more")}</p>
        <div className="grid gap-x-7 gap-y-14 md:grid-cols-3">
          {more.map((p) => (
            <PostCard key={p.slug} post={p} meta={`${formatDate(p.date, locale)} · ${t("minutes", { n: p.minutes })}`} />
          ))}
        </div>
      </section>
    </main>
  );
}
