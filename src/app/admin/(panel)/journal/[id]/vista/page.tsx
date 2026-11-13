import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/data/posts";
import { sanitizeHtml } from "@/lib/sanitize";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function PreviewPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: p } = await supabaseAdmin()!.from("posts").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <Link href={`/admin/journal/${p.id}`} className="label text-muted hover:text-charcoal">
        ← Volver al editor
      </Link>
      <p className="mt-6 bg-sand px-4 py-2 text-[12.5px] text-muted">Vista previa{p.status === "draft" ? " · borrador, todavía no se ve en la web" : ""}</p>
      <p className="label mt-10 text-muted">{formatDate(p.published_at, "es")} · {p.minutes} min · Nina Marquina</p>
      <h1 className="display mt-5 text-[40px] md:text-[58px]">{p.title}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {p.cover && <img src={p.cover} alt="" className="mt-10 aspect-[16/9] w-full object-cover" />}
      <div className="prose-nm mt-12" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.html) }} />
    </article>
  );
}
