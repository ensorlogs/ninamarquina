export type Post = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  cover: string | null;
  minutes: number;
  html: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-VE" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
