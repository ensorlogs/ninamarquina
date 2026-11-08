import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Arrow } from "../ui/Arrow";

export async function Mirada() {
  const t = await getTranslations("mirada");
  return (
    <section id="mirada" className="grid scroll-mt-20 bg-sand md:grid-cols-[1.25fr_1fr]">
      <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[600px]">
        <Image src="/images/mirada.jpg" alt={t("imageAlt")} fill sizes="(min-width: 768px) 56vw, 100vw" className="object-cover" />
      </div>
      <div className="flex items-center px-6 py-16 md:px-14 md:py-20 lg:px-20">
        <div className="max-w-[460px]">
          <p className="label mb-8 text-muted">{t("label")}</p>
          <h2 className="display text-[36px] md:text-[46px] lg:text-[52px]">
            {t.rich("title", { em: (c) => <em>{c}</em> })}
          </h2>
          <p className="mt-8 text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
          <Link href="/#mirada" className="link-arrow mt-10 hover:text-clay">
            {t("link")} <Arrow className="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
