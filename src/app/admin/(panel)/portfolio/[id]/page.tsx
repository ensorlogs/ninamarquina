import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import type { ProjectDetails } from "@/data/project-details";
import { supabaseAdmin } from "@/lib/supabase-admin";

const L = { es: "", en: "" };

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: p } = await supabaseAdmin()!.from("portfolio_projects").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const d = (p.details ?? {}) as Partial<ProjectDetails>;
  return (
    <>
      <Link href="/admin/portfolio" className="label text-muted hover:text-charcoal">
        ← Portfolio
      </Link>
      <h1 className="display mt-4 mb-8 text-[40px]">{p.title}</h1>
      <ProjectEditor
        id={p.id}
        initial={{
          title: p.title,
          slug: p.slug,
          year: p.year,
          location: p.location ?? "",
          category: { ...L, ...p.category },
          summary: { ...L, ...p.summary },
          images: p.images ?? [],
          published: p.published,
          details: {
            scope: { ...L, ...d.scope },
            facts: d.facts ?? [],
            sections: d.sections ?? [],
            highlights: d.highlights ?? [],
          },
        }}
      />
    </>
  );
}
