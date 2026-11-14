import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/content";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

function entry(path: string, priority: number, lastModified?: string, locales: readonly string[] = routing.locales) {
  const languages = Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${path}`]));
  return locales.map((l) => ({
    url: `${site.url}/${l}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);
  return [
    ...entry("", 1),
    ...entry("/proyectos", 0.9),
    ...entry("/estudio", 0.8),
    ...entry("/journal", 0.7),
    ...entry("/cotizar", 0.9),
    ...entry("/legal", 0.3),
    ...projects.flatMap((p) => entry(`/proyectos/${p.slug}`, 0.8)),
    ...posts.flatMap((p) => entry(`/journal/${p.slug}`, 0.6, p.date, ["es"])),
  ];
}
