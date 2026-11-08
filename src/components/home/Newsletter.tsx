import { getTranslations } from "next-intl/server";
import { NewsletterForm } from "./NewsletterForm";

export async function Newsletter() {
  const t = await getTranslations("newsletter");
  return (
    <section className="bg-sand py-20 md:py-24">
      <div className="container-site grid items-center gap-10 md:grid-cols-2 md:gap-20">
        <div>
          <p className="label mb-6 text-muted">{t("label")}</p>
          <h2 className="display text-[34px] md:text-[44px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h2>
          <p className="mt-6 max-w-[420px] text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
        </div>
        <NewsletterForm
          labels={{
            placeholder: t("placeholder"),
            submit: t("submit"),
            sending: t("sending"),
            success: t("success"),
            error: t("error"),
            invalid: t("invalid"),
            consent: t("consent"),
          }}
        />
      </div>
    </section>
  );
}
