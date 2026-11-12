"use client";

import { mediaUploadUrls } from "@/app/admin/content-actions";

async function shrink(file: File, max = 2200): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("image"))), "image/jpeg", 0.84));
}

/** Compresses the images in the browser and uploads them to the public media bucket. Returns their public URLs. */
export async function uploadImages(files: File[], folder: "journal" | "projects") {
  const blobs = await Promise.all(files.map((f) => shrink(f)));
  const urls = await mediaUploadUrls(folder, blobs.length);
  await Promise.all(
    urls.map(async (u, i) => {
      const r = await fetch(u.signedUrl, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: blobs[i] });
      if (!r.ok) throw new Error("upload");
    }),
  );
  return urls.map((u) => u.publicUrl);
}
