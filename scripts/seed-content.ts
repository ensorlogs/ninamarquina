// One-off: copies the static Journal posts and portfolio projects into Supabase.
// Run: npx tsx --env-file=.env.local scripts/seed-content.ts
import { createClient } from "@supabase/supabase-js";
import posts from "../src/data/posts.json";
import { projects } from "../src/data/projects";
import { projectDetails } from "../src/data/project-details";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function main() {
  const postRows = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover: p.cover,
    html: p.html,
    minutes: Number(p.minutes) || 1,
    status: "published",
    published_at: p.date,
    seo_title: null,
    seo_description: null,
  }));
  const r1 = await db.from("posts").upsert(postRows, { onConflict: "slug", ignoreDuplicates: true });
  if (r1.error) throw r1.error;

  const projectRows = projects.map((p, i) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    location: p.location ?? null,
    category: p.category,
    summary: p.summary,
    images: p.images,
    details: projectDetails[p.slug] ?? null,
    featured: !!p.featured,
    published: true,
    position: i,
  }));
  const r2 = await db.from("portfolio_projects").upsert(projectRows, { onConflict: "slug", ignoreDuplicates: true });
  if (r2.error) throw r2.error;

  const [{ count: c1 }, { count: c2 }] = await Promise.all([
    db.from("posts").select("*", { count: "exact", head: true }),
    db.from("portfolio_projects").select("*", { count: "exact", head: true }),
  ]);
  console.log({ posts: c1, projects: c2 });
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
