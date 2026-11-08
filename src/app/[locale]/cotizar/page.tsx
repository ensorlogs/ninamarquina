import { getTranslations, setRequestLocale } from "next-intl/server";
import { QuoteWizard } from "@/components/quote/QuoteWizard";
import { SERVICES } from "@/lib/quote";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ servicio?: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote" });
  return pageMetadata({ locale, path: "/cotizar", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function QuotePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { servicio } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("quote");
  const initialService = (SERVICES as readonly string[]).includes(servicio ?? "") ? servicio : undefined;

  return (
    <main className="min-h-screen bg-ivory pb-24 pt-[124px] md:pt-[150px]">
      <JsonLd
        data={breadcrumbJsonLd(site.url, [
          { name: "Nina Marquina", path: `/${locale}` },
          { name: t("label"), path: `/${locale}/cotizar` },
        ])}
      />
      <div className="container-site">
        <p className="label mb-6 text-muted">{t("label")}</p>
        <h1 className="display max-w-3xl text-[44px] md:text-[64px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h1>
        <p className="mt-6 max-w-xl text-[15px] leading-[1.75] text-muted">{t("intro")}</p>
        <QuoteWizard initialService={initialService} />
      </div>
    </main>
  );
}
