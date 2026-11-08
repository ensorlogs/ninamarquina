import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export function alternates(locale: string, path = "", locales: readonly string[] = routing.locales) {
  const canonicalLocale = locales.includes(locale) ? locale : locales[0];
  return {
    canonical: `/${canonicalLocale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}

type PageMeta = {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  locales?: readonly string[];
};

export function pageMetadata({ locale, path, title, description, image, type = "website", locales }: PageMeta): Metadata {
  const images = image ? [image] : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: alternates(locale, path, locales),
    openGraph: {
      type,
      siteName: "Nina Marquina — Architecture & Interiors",
      title,
      description,
      url: `/${locale}${path}`,
      locale: locale === "es" ? "es_VE" : "en_US",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export function breadcrumbJsonLd(base: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
