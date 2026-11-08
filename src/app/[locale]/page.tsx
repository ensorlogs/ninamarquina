import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FooterCTA } from "@/components/home/FooterCTA";
import { Hero } from "@/components/home/Hero";
import { Journal } from "@/components/home/Journal";
import { Mirada } from "@/components/home/Mirada";
import { Newsletter } from "@/components/home/Newsletter";
import { Philosophy } from "@/components/home/Philosophy";
import { Studio } from "@/components/home/Studio";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { site } from "@/lib/site";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Architect", "LocalBusiness"],
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
    areaServed: ["El Hatillo", "Caracas", "Venezuela", "Madrid", "Punta Cana"],
    founder: { "@type": "Person", name: "Nina Marquina", jobTitle: "Arquitecta e Ingeniera Civil" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main>
        <Hero />
        <Philosophy />
        <FeaturedProjects />
        <BeforeAfter />
        <Mirada />
        <Studio />
        <Journal />
        <Newsletter />
      </main>
      <FooterCTA />
      <WhatsAppButton />
    </>
  );
}
