import Link from "next/link";
import { PostEditor } from "@/components/admin/PostEditor";

export default function NewPost() {
  return (
    <>
      <Link href="/admin/journal" className="label text-muted hover:text-charcoal">
        ← Journal
      </Link>
      <h1 className="display mt-4 mb-8 text-[40px]">Nuevo artículo</h1>
      <PostEditor
        post={{
          id: null,
          title: "",
          slug: "",
          excerpt: "",
          cover: null,
          html: "",
          date: new Date().toISOString().slice(0, 10),
          status: "draft",
          seo_title: "",
          seo_description: "",
          newsletter_sent_at: null,
        }}
      />
    </>
  );
}
