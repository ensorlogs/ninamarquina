import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getInstagramPosts } from "@/lib/instagram";
import { site } from "@/lib/site";
import { Arrow } from "../ui/Arrow";

const IgIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

export async function InstagramFeed() {
  const t = await getTranslations("instagram");
  const posts = await getInstagramPosts();
  return (
    <section className="bg-ivory py-20 md:py-24">
      <div className="container-site">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label mb-5 text-muted">{t("label")}</p>
            <h2 className="display text-[34px] md:text-[44px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h2>
            <p className="mt-4 max-w-[460px] text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
          </div>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-arrow self-start border border-charcoal/30 px-6 py-3.5 hover:border-charcoal md:self-auto"
          >
            <IgIcon className="h-4 w-4" /> {t("follow")} <Arrow className="arrow" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-2">
          {posts.map((p) => (
            <a
              key={p.href}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("post")}
              className="group relative aspect-[4/5] overflow-hidden bg-stone"
            >
              <Image
                src={p.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-espresso/0 text-white opacity-0 transition-all duration-300 group-hover:bg-espresso/45 group-hover:opacity-100">
                <IgIcon className="h-7 w-7" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
