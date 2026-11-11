import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Arrow } from "../ui/Arrow";

export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden text-white">
      <Image src="/images/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/5" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      <div className="container-site relative flex h-full flex-col justify-center pt-16">
        <div className="max-w-[760px] animate-fade-up">
          <p className="label mb-7 text-white/85">{t("eyebrow")}</p>
          <h1 className="display text-[42px] sm:text-[54px] md:text-[64px] lg:text-[72px]">
            {t.rich("title", { em: (c) => <em>{c}</em> })}
          </h1>
          <p className="label mt-8 text-white/85">{t("tagline")}</p>
          <Link
            href="/cotizar"
            className="link-arrow mt-10 border border-white/60 px-8 py-4 text-white backdrop-blur-[2px] transition-colors hover:border-white hover:bg-white hover:text-charcoal"
          >
            {t("cta")} <Arrow className="arrow" />
          </Link>
        </div>

        <a
          href="#filosofia"
          className="absolute bottom-10 flex flex-col [@media(max-height:860px)]:hidden items-start gap-3 text-white/85 transition-opacity hover:opacity-70 md:bottom-14"
        >
          <span className="label">{t("discover")}</span>
          <Arrow direction="down" />
        </a>
      </div>
    </section>
  );
}
