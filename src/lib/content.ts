import "server-only";
import { cache } from "react";
import staticPosts from "@/data/posts.json";
import type { Post } from "@/data/posts";
import { projects as staticProjects, type Project } from "@/data/projects";
import { projectDetails } from "@/data/project-details";
import { supabaseAdmin } from "./supabase-admin";

export const MEDIA_BUCKET = "site-media";

type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  html: string;
  minutes: number;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
};

const toPost = (r: PostRow): Post => ({
  slug: r.slug,
  date: r.published_at,
  title: r.title,
  excerpt: r.excerpt,
  cover: r.cover,
  minutes: r.minutes,
  html: r.html,
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
});

export const getPosts = cache(async (): Promise<Post[]> => {
  const db = supabaseAdmin();
  if (!db) return (staticPosts as unknown as Post[]).map((p) => ({ ...p, minutes: Number(p.minutes) })).sort((a, b) => b.date.localeCompare(a.date));
  const { data, error } = await db
    .from("posts")
    .select("slug,title,excerpt,cover,html,minutes,published_at,seo_title,seo_description")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as PostRow[]).map(toPost);
});

export const getPost = async (slug: string) => (await getPosts()).find((p) => p.slug === slug);

export const getProjects = cache(async (): Promise<Project[]> => {
  const db = supabaseAdmin();
  if (!db) return staticProjects.map((p) => ({ ...p, details: projectDetails[p.slug] }));
  const { data, error } = await db
    .from("portfolio_projects")
    .select("slug,title,year,location,category,summary,images,details,featured")
    .eq("published", true)
    .order("position");
  if (error) throw error;
  return (data ?? [])
    .filter((p) => p.images?.length)
    .map((p) => ({ ...p, location: p.location ?? undefined, details: p.details ?? undefined }) as Project);
});

export const absoluteUrl = (base: string, src: string) => (/^https?:\/\//.test(src) ? src : `${base}${src}`);
