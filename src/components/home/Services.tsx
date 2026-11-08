import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Arrow } from "../ui/Arrow";

type Item = { key: string; title: string; body: string };

export async function Services() {
  const t = await getTranslations("services");
  const items = t.raw("items") as Item[];
  return (
    <section id="servicios" className="scroll-mt-20 overflow-hidden bg-sand py-20 md:py-28">
      <div className="container-site">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-20">
          <div>
            <p className="label mb-8 text-muted">{t("label")}</p>
            <h2 className="display max-w-[620px] text-[36px] md:text-[48px] lg:text-[54px]">
              {t.rich("title", { em: (c) => <em>{c}</em> })}
            </h2>
          </div>
          <div>
            <p className="text-[14.5px] leading-[1.75] text-muted">{t("body")}</p>
            <Link
              href="/cotizar"
              className="link-arrow mt-8 bg-charcoal px-8 py-4 text-ivory transition-colors hover:bg-clay"
            >
              {t("cta")} <Arrow className="arrow" />
            </Link>
          </div>
        </div>

        <ul className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-6 md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => (
            <li
              key={item.key}
              className={`w-[78%] shrink-0 snap-start md:w-auto ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
            >
              <Link
                href={{ pathname: "/cotizar", query: { servicio: item.key } }}
                className={`group relative flex aspect-[3/4] flex-col justify-between overflow-hidden bg-espresso p-6 text-ivory md:p-8 ${
                  i < 2 ? "md:aspect-[16/11]" : "md:aspect-[4/5]"
                }`}
              >
                <Image
                  src={`/images/services/${item.key}.webp`}
                  alt={item.title}
                  fill
                  sizes={i < 2 ? "(min-width: 768px) 50vw, 78vw" : "(min-width: 768px) 33vw, 78vw"}
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-colors duration-500 group-hover:from-black/90" />
                <span className="label relative text-ivory/80">{String(i + 1).padStart(3, "0")}</span>
                <div className="relative">
                  <h3 className="font-serif text-[30px] leading-[1.05] md:text-[34px]">{item.title}</h3>
                  <p className="mt-3 max-w-[420px] text-[13.5px] leading-[1.65] text-ivory/80">{item.body}</p>
                  <span className="link-arrow mt-6 border-b border-ivory/40 pb-1 text-ivory group-hover:border-ivory">
                    {t("cardCta")} <Arrow className="arrow" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
