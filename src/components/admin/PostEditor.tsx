"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deletePost, savePost, sendPostNewsletter, sendPostTest, type PostInput } from "@/app/admin/content-actions";
import { uploadImages } from "./media";

export type EditablePost = PostInput & { id: string | null; newsletter_sent_at: string | null };

const btn = "bg-charcoal px-5 py-2.5 text-[10.5px] uppercase tracking-[0.16em] text-ivory hover:bg-clay disabled:opacity-50";
const ghost = "border border-black/20 px-5 py-2.5 text-[10.5px] uppercase tracking-[0.16em] hover:border-clay hover:text-clay disabled:opacity-50";

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const b = (label: string, active: boolean, run: () => void, title = label) => (
    <button
      key={title}
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
      className={`min-w-9 px-2.5 py-1.5 text-[13px] ${active ? "bg-charcoal text-ivory" : "hover:bg-stone"}`}
    >
      {label}
    </button>
  );
  const c = () => editor.chain().focus();
  return (
    <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-black/10 bg-sand px-2 py-2">
      {b("Párrafo", editor.isActive("paragraph"), () => c().setParagraph().run())}
      {b("Título", editor.isActive("heading", { level: 2 }), () => c().toggleHeading({ level: 2 }).run())}
      {b("Subtítulo", editor.isActive("heading", { level: 3 }), () => c().toggleHeading({ level: 3 }).run())}
      <span className="mx-1 w-px bg-black/15" />
      {b("B", editor.isActive("bold"), () => c().toggleBold().run(), "Negrita")}
      {b("I", editor.isActive("italic"), () => c().toggleItalic().run(), "Cursiva")}
      {b("• Lista", editor.isActive("bulletList"), () => c().toggleBulletList().run())}
      {b("1. Lista", editor.isActive("orderedList"), () => c().toggleOrderedList().run())}
      {b("❝ Cita", editor.isActive("blockquote"), () => c().toggleBlockquote().run())}
      {b("Enlace", editor.isActive("link"), () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Dirección del enlace (vacío para quitarlo)", prev ?? "https://");
        if (url === null) return;
        if (!url.trim()) c().extendMarkRange("link").unsetLink().run();
        else c().extendMarkRange("link").setLink({ href: url.trim() }).run();
      })}
      {b("Foto", false, onImage, "Insertar foto")}
      <span className="mx-1 w-px bg-black/15" />
      {b("↶", false, () => c().undo().run(), "Deshacer")}
      {b("↷", false, () => c().redo().run(), "Rehacer")}
    </div>
  );
}

export function PostEditor({ post }: { post: EditablePost }) {
  const router = useRouter();
  const [v, setV] = useState(post);
  const [slugTouched, setSlugTouched] = useState(!!post.id);
  const created = useSearchParams().get("ok");
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(
    created ? { ok: created === "published" ? "Publicado. Ya se ve en la web." : "Borrador guardado." } : null,
  );
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const [lists, setLists] = useState({ newsletter: true, quotes: true });
  const imgInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof EditablePost>(k: K, val: EditablePost[K]) => setV((s) => ({ ...s, [k]: val }));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener" } } }),
      Image,
      Placeholder.configure({ placeholder: "Escribe aquí el artículo…" }),
    ],
    content: post.html,
    editorProps: { attributes: { class: "prose-nm px-6 py-8 md:px-10" } },
  });

  const save = (status: "draft" | "published") =>
    start(async () => {
      setMsg(null);
      const res = await savePost(v.id, { ...v, status, html: editor?.getHTML() ?? v.html });
      if (res.error) return setMsg({ error: res.error });
      setV((s) => ({ ...s, status, id: res.id! }));
      setMsg({ ok: status === "published" ? "Publicado. Ya se ve en la web." : "Borrador guardado." });
      if (!v.id) router.replace(`/admin/journal/${res.id}?ok=${status}`);
      else router.refresh();
    });

  const insertImages = async (files: File[]) => {
    if (!files.length || !editor) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files, "journal");
      urls.forEach((src) => editor.chain().focus().setImage({ src, alt: "" }).createParagraphNear().run());
    } catch {
      setMsg({ error: "No se pudo subir la foto. Prueba con JPG o PNG." });
    }
    setUploading(false);
  };

  const setCover = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      set("cover", (await uploadImages([file], "journal"))[0]);
    } catch {
      setMsg({ error: "No se pudo subir la portada." });
    }
    setUploading(false);
  };

  const published = v.status === "published";
  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        <input
          value={v.title}
          onChange={(e) => {
            set("title", e.target.value);
            if (!slugTouched)
              set(
                "slug",
                e.target.value
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, ""),
              );
          }}
          placeholder="Título del artículo"
          className="input font-serif !text-[34px] leading-tight"
        />
        <textarea
          value={v.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="Resumen corto (sale en las tarjetas, en Google y en el email de la newsletter)"
          className="input min-h-[70px]"
        />
        <div className="border border-black/10 bg-ivory editor-nm">
          {editor && <Toolbar editor={editor} onImage={() => imgInput.current?.click()} />}
          <EditorContent editor={editor} />
          <input ref={imgInput} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { insertImages(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        </div>
      </div>

      <aside className="space-y-8 xl:sticky xl:top-8 xl:self-start">
        <div className="space-y-3 bg-sand p-5">
          <p className="label text-muted">
            Estado: <span className={published ? "text-clay" : ""}>{published ? "Publicado" : "Borrador"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending || uploading} onClick={() => save("published")} className={btn}>
              {published ? "Guardar cambios" : "Publicar"}
            </button>
            <button type="button" disabled={pending || uploading} onClick={() => save("draft")} className={ghost}>
              {published ? "Pasar a borrador" : "Guardar borrador"}
            </button>
          </div>
          {v.id && (
            <a href={published ? `/es/journal/${v.slug}` : `/admin/journal/${v.id}/vista`} target="_blank" className="inline-block text-[12.5px] text-clay underline underline-offset-2">
              {published ? "Ver en la web ↗" : "Vista previa ↗"}
            </a>
          )}
          {pending && <p className="text-[12.5px] text-muted">Guardando…</p>}
          {uploading && <p className="text-[12.5px] text-muted">Subiendo foto…</p>}
          {msg?.ok && <p className="text-[12.5px] text-clay">{msg.ok}</p>}
          {msg?.error && <p className="text-[12.5px] text-[#8A1221]">{msg.error}</p>}
        </div>

        <div className="space-y-3">
          <p className="label text-muted">Portada</p>
          <button type="button" onClick={() => coverInput.current?.click()} className="relative block aspect-[4/3] w-full overflow-hidden border border-dashed border-black/25 bg-sand text-[13px] text-muted hover:border-clay">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {v.cover ? <img src={v.cover} alt="" className="absolute inset-0 h-full w-full object-cover" /> : "Subir foto de portada"}
          </button>
          {v.cover && (
            <button type="button" onClick={() => set("cover", null)} className="text-[12px] text-muted underline">
              Quitar portada
            </button>
          )}
          <input ref={coverInput} type="file" accept="image/*" className="sr-only" onChange={(e) => { setCover(e.target.files?.[0]); e.target.value = ""; }} />
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="label text-muted">Fecha</span>
            <input type="date" value={v.date} onChange={(e) => set("date", e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="label text-muted">URL</span>
            <div className="flex items-baseline gap-1 text-[13px] text-muted">
              <span className="shrink-0">/journal/</span>
              <input value={v.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} className="input !text-[13px]" />
            </div>
            {published && <span className="text-[11.5px] text-muted">Si cambias la URL de un artículo publicado, los enlaces antiguos dejarán de funcionar.</span>}
          </label>
        </div>

        <details className="space-y-3">
          <summary className="label cursor-pointer text-muted">SEO (Google)</summary>
          <input value={v.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={`${v.title || "Título"} | Nina Marquina`} className="input !text-[13.5px]" />
          <textarea value={v.seo_description} onChange={(e) => set("seo_description", e.target.value)} placeholder={v.excerpt || "Descripción para Google (si lo dejas vacío se usa el resumen)"} className="input min-h-[80px] !text-[13.5px]" />
        </details>

        {v.id && published && (
          <div className="space-y-3 border-t border-black/10 pt-6">
            <p className="label text-muted">Newsletter (Brevo)</p>
            {post.newsletter_sent_at && <p className="text-[12.5px] text-clay">Enviado el {new Date(post.newsletter_sent_at).toLocaleDateString("es-VE")}.</p>}
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={lists.newsletter} onChange={(e) => setLists((l) => ({ ...l, newsletter: e.target.checked }))} /> Suscriptores de la newsletter
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={lists.quotes} onChange={(e) => setLists((l) => ({ ...l, quotes: e.target.checked }))} /> Personas que pidieron cotización
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                className={ghost}
                onClick={() => start(async () => { const r = await sendPostTest(v.id!); setMsg(r.error ? { error: r.error } : { ok: "Prueba enviada a hello@ninamarquina.com." }); })}
              >
                Enviar prueba
              </button>
              <button
                type="button"
                disabled={pending || (!lists.newsletter && !lists.quotes)}
                className={btn}
                onClick={() => {
                  if (!window.confirm(`¿Enviar «${v.title}» ahora a los suscriptores? No se puede deshacer.`)) return;
                  start(async () => {
                    const sel = (Object.keys(lists) as ("newsletter" | "quotes")[]).filter((k) => lists[k]);
                    const r = await sendPostNewsletter(v.id!, sel);
                    setMsg(r.error ? { error: r.error } : { ok: "Enviado a los suscriptores." });
                    router.refresh();
                  });
                }}
              >
                Enviar a suscriptores
              </button>
            </div>
            <p className="text-[11.5px] text-muted">Guarda los cambios antes de enviar. Se envía el título, el resumen, la portada y un botón para leerlo en la web.</p>
          </div>
        )}

        {v.id && (
          <form action={deletePost.bind(null, v.id)} onSubmit={(e) => { if (!window.confirm("¿Borrar este artículo? No se puede deshacer.")) e.preventDefault(); }} className="border-t border-black/10 pt-6">
            <button className="text-[12px] text-muted underline hover:text-[#8A1221]">Borrar artículo</button>
          </form>
        )}
      </aside>
    </div>
  );
}
