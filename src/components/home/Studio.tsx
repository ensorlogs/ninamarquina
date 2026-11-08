import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Arrow } from "../ui/Arrow";

export async function Studio() {
  const t = await getTranslations("studio");
  return (
    <section id="estudio" className="scroll-mt-20 bg-ivory py-20 md:py-24">
      <div className="container-site grid items-center gap-12 md:grid-cols-[1fr_1.35fr] md:gap-16">
        <div className="max-w-[480px]">
          <p className="label mb-8 text-muted">{t("label")}</p>
          <h2 className="display text-[36px] md:text-[44px] lg:text-[50px]">{t("title")}</h2>
          <p className="mt-8 text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
          <Link href="/#estudio" className="link-arrow mt-10 hover:text-clay">
            {t("link")} <Arrow className="arrow" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="/images/estudio-1.jpg" alt={t("image1Alt")} fill sizes="(min-width: 768px) 28vw, 50vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="/images/estudio-2.jpg" alt={t("image2Alt")} fill sizes="(min-width: 768px) 28vw, 50vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
