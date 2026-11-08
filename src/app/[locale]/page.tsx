import { getTranslations, setRequestLocale } from "next-intl/server";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Hero } from "@/components/home/Hero";
import { Journal } from "@/components/home/Journal";
import { Mirada } from "@/components/home/Mirada";
import { Newsletter } from "@/components/home/Newsletter";
import { Philosophy } from "@/components/home/Philosophy";
import { Services } from "@/components/home/Services";
import { Studio } from "@/components/home/Studio";
import { site } from "@/lib/site";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  const ts = await getTranslations({ locale, namespace: "services" });
  const services = ts.raw("items") as { title: string; body: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Architect", "GeneralContractor"],
    name: "Nina Marquina — Architecture & Interiors",
    description: t("description"),
    url: `${site.url}/${locale}`,
    image: `${site.url}/images/hero.jpg`,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "El Hatillo",
      addressRegion: "Miranda",
      addressCountry: "VE",
    },
    areaServed: [
      { "@type": "City", name: "El Hatillo" },
      { "@type": "City", name: "Caracas" },
      { "@type": "AdministrativeArea", name: "Miranda, Venezuela" },
      { "@type": "City", name: "Punta Cana" },
    ],
    knowsAbout: services.map((s) => s.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: ts("label"),
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.body },
      })),
    },
    sameAs: Object.values(site.social),
    founder: { "@type": "Person", name: "Stephany Seijas", jobTitle: "Arquitecta", image: `${site.url}/images/stephany.jpg` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <Hero />
        <Philosophy />
        <FeaturedProjects />
        <Services />
        <BeforeAfter />
        <Mirada />
        <Studio />
        <Journal />
        <Newsletter />
      </main>
    </>
  );
}
