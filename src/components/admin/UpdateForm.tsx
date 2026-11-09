"use client";

import { useRef, useState } from "react";
import { addUpdate, projectUploadUrls } from "@/app/admin/actions";

async function shrink(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("image"))), "image/jpeg", 0.82));
}

export function UpdateForm({ projectId, phases }: { projectId: string; phases: { id: string; name: string; status: string }[] }) {
  const form = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const current = phases.find((p) => p.status === "in_progress")?.id ?? "";
  return (
    <form
      ref={form}
      className="space-y-4 bg-sand p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setState("sending");
        try {
          const blobs = await Promise.all(files.map(shrink));
          const uploads = await projectUploadUrls(projectId, blobs.length);
          await Promise.all(
            uploads.map(async (u, i) => {
              const r = await fetch(u.signedUrl, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: blobs[i] });
              if (!r.ok) throw new Error("upload");
            }),
          );
          await addUpdate(projectId, {
            date: String(f.get("date")),
            title: String(f.get("title")),
            body: String(f.get("body")),
            phase_id: String(f.get("phase_id")),
            photos: uploads.map((u) => u.path),
            visible: f.get("visible") === "on",
          });
          form.current?.reset();
          setFiles([]);
          setState("idle");
        } catch {
          setState("error");
        }
      }}
    >
      <p className="label text-muted">Nuevo avance</p>
      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input" />
        <select name="phase_id" defaultValue={current} className="input">
          <option value="">Sin fase</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <input name="title" required placeholder="Título (p. ej. «Terminada la estructura»)" className="input font-serif text-[18px]" />
      <textarea name="body" placeholder="Qué se ha hecho, próximos pasos…" className="input min-h-[110px]" />
      <label className="block cursor-pointer border border-dashed border-black/25 bg-ivory/60 px-4 py-5 text-center text-[13px] text-muted hover:border-clay">
        {files.length ? `${files.length} foto${files.length > 1 ? "s" : ""} seleccionada${files.length > 1 ? "s" : ""}` : "Añadir fotos (máx. 12)"}
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 12))} />
      </label>
      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" name="visible" defaultChecked /> Visible para el cliente
      </label>
      {state === "error" && <p className="text-[13px] text-clay">No se pudo publicar. Revisa las fotos (JPG o PNG) e inténtalo de nuevo.</p>}
      <button disabled={state === "sending"} className="bg-charcoal px-8 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-clay disabled:opacity-60">
        {state === "sending" ? "Publicando…" : "Publicar avance"}
      </button>
    </form>
  );
}
