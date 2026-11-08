import data from "./posts.json";

export type Post = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  cover: string | null;
  minutes: number;
  html: string;
};

export const posts: Post[] = [...(data as Post[])].sort((a, b) => b.date.localeCompare(a.date));

export function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-VE" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
