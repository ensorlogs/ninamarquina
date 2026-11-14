import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };
type Section = { id: string; title: string; body: string[] };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("title"),
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  const sections = t.raw("sections") as Section[];

  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="container-site max-w-3xl">
        <p className="label mb-4 text-muted">Nina Marquina</p>
        <h1 className="font-serif text-[40px] leading-tight text-espresso md:text-[52px]">{t("title")}</h1>
        <p className="mt-3 text-[13px] text-muted">{t("updated")}</p>

        <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-y border-black/10 py-4 text-[13px]">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-clay underline-offset-4 hover:underline">
              {s.title}
            </a>
          ))}
        </nav>

        {sections.map((s) => (
          <article key={s.id} id={s.id} className="mt-14 scroll-mt-28">
            <h2 className="font-serif text-[26px] text-espresso md:text-[32px]">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-5 text-[15px] leading-[1.85] text-charcoal/85">
                {p}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
