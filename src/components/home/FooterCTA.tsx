import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { site, whatsappHref } from "@/lib/site";
import { Arrow } from "../ui/Arrow";
import { Logo } from "../ui/Logo";
import { SocialIcons } from "../ui/SocialIcons";
import { WhatsAppIcon } from "../ui/WhatsAppButton";

export async function FooterCTA() {
  const t = await getTranslations();
  return (
    <footer id="contacto" className="relative scroll-mt-20 overflow-hidden bg-espresso text-ivory">
      <Image src="/images/footer.jpg" alt="" fill sizes="100vw" className="object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/50 to-espresso/20" />

      <div className="container-site relative grid gap-14 py-20 md:grid-cols-[1.3fr_1fr] md:items-end md:py-28">
        <div>
          <p className="label mb-7 text-ivory/70">{t("cta.label")}</p>
          <h2 className="display max-w-[560px] text-[38px] md:text-[52px] lg:text-[58px]">
            {t.rich("cta.title", { em: (c) => <em>{c}</em> })}
          </h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={`mailto:${site.email}`}
              className="link-arrow border border-ivory/50 px-9 py-4 hover:border-ivory hover:bg-ivory hover:text-charcoal"
            >
              {t("cta.button")} <Arrow className="arrow" />
            </a>
            <a
              href={whatsappHref(t("cta.whatsappMessage"))}
              target="_blank"
              rel="noopener noreferrer"
              className="link-arrow border border-ivory/20 px-7 py-4 text-ivory/85 hover:border-ivory/60 hover:text-ivory"
            >
              <WhatsAppIcon size={15} /> {t("cta.whatsapp")}
            </a>
          </div>
        </div>

        <div className="md:justify-self-end md:text-left">
          <a href={`mailto:${site.email}`} className="text-[15px] text-ivory/90 hover:text-ivory">
            {site.email}
          </a>
          <p className="label mt-3 text-ivory/65">{site.locations.join(" · ")}</p>
          <div className="mt-8 flex items-end justify-between gap-10 border-t border-ivory/20 pt-6">
            <Logo light />
            <SocialIcons />
          </div>
          <p className="mt-6 text-[11px] text-ivory/45">
            © {new Date().getFullYear()} Nina Marquina. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
