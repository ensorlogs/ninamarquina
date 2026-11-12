import Link from "next/link";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: p } = await supabaseAdmin()!.from("posts").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <>
      <Link href="/admin/journal" className="label text-muted hover:text-charcoal">
        ← Journal
      </Link>
      <h1 className="display mt-4 mb-8 text-[40px]">Editar artículo</h1>
      <PostEditor
        post={{
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          cover: p.cover,
          html: p.html,
          date: p.published_at,
          status: p.status,
          seo_title: p.seo_title ?? "",
          seo_description: p.seo_description ?? "",
          newsletter_sent_at: p.newsletter_sent_at,
        }}
      />
    </>
  );
}
