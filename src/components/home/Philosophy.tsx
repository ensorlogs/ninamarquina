import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Arrow } from "../ui/Arrow";

export async function Philosophy() {
  const t = await getTranslations("philosophy");
  return (
    <section id="filosofia" className="scroll-mt-20 bg-sand py-20 md:py-28">
      <div className="container-site grid items-center gap-12 md:grid-cols-[1fr_1.05fr] md:gap-16 lg:gap-24">
        <div className="max-w-[520px]">
          <p className="label mb-8 text-muted">{t("label")}</p>
          <h2 className="display text-[36px] md:text-[46px] lg:text-[52px]">
            {t.rich("title", { em: (c) => <em>{c}</em> })}
          </h2>
          <p className="mt-8 max-w-[440px] text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
          <Link href="/#estudio" className="link-arrow mt-10 hover:text-clay">
            {t("link")} <Arrow className="arrow" />
          </Link>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src="/images/filosofia.jpg"
            alt={t("imageAlt")}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
