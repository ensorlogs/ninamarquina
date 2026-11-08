import { getTranslations } from "next-intl/server";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

export async function BeforeAfter() {
  const t = await getTranslations("beforeAfter");
  return (
    <section id="transformaciones" className="scroll-mt-20 bg-ivory pb-20 md:pb-28">
      <div className="container-site">
        <div className="mb-10 grid gap-6 border-t border-black/10 pt-16 md:grid-cols-2 md:items-end md:gap-16 md:pt-20">
          <div>
            <p className="label mb-6 text-muted">{t("label")}</p>
            <h2 className="display text-[34px] md:text-[44px]">
              {t.rich("title", { em: (c) => <em>{c}</em> })}
            </h2>
          </div>
          <p className="max-w-[420px] text-[14.5px] leading-[1.75] text-muted md:justify-self-end">{t("body")}</p>
        </div>
        <BeforeAfterSlider
          before="/images/antes.jpg"
          after="/images/despues.jpg"
          beforeAlt={t("beforeAlt")}
          afterAlt={t("afterAlt")}
          beforeLabel={t("before")}
          afterLabel={t("after")}
          handleLabel={t("handle")}
        />
      </div>
    </section>
  );
}
