import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { Arrow } from "../ui/Arrow";

export async function Studio() {
  const t = await getTranslations("studio");
  return (
    <section id="estudio" className="scroll-mt-20 bg-ivory py-20 md:py-24">
      <div className="container-site grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div className="max-w-[520px]">
          <p className="label mb-8 text-muted">{t("label")}</p>
          <h2 className="display text-[36px] md:text-[44px] lg:text-[50px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h2>
          <p className="mt-8 text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
          <p className="label mt-8 text-muted">{site.locations.join(" · ")}</p>
          <Link href="/estudio" className="link-arrow mt-10 hover:text-clay">
            {t("link")} <Arrow className="arrow" />
          </Link>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden bg-espresso md:ml-auto md:mr-0">
          <Image
            src="/images/stephany.jpg"
            alt={t("imageAlt")}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>
      </div>
    </section>
  );
}
