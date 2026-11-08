import { getTranslations } from "next-intl/server";

type Item = { title: string; body: string };

export async function Services() {
  const t = await getTranslations("services");
  const items = t.raw("items") as Item[];
  return (
    <section id="servicios" className="scroll-mt-20 bg-sand py-20 md:py-28">
      <div className="container-site grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
        <div className="max-w-[480px]">
          <p className="label mb-8 text-muted">{t("label")}</p>
          <h2 className="display text-[36px] md:text-[44px] lg:text-[50px]">{t.rich("title", { em: (c) => <em>{c}</em> })}</h2>
          <p className="mt-8 text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
        </div>
        <ol className="border-t border-black/10">
          {items.map((item, i) => (
            <li key={item.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-black/10 py-7">
              <span className="label pt-2 text-clay">{String(i + 1).padStart(3, "0")}</span>
              <div>
                <h3 className="font-serif text-[26px] leading-tight">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
