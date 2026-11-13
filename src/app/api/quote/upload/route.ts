import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { FILE_TYPES, MAX_FILE_BYTES, MAX_FILES } from "@/lib/quote";
import { QUOTE_BUCKET, supabaseAdmin } from "@/lib/supabase-admin";

type FileMeta = { name: string; type: string; size: number };

export async function POST(request: Request) {
  if (!rateLimit(`quote-upload:${clientIp(request)}`, 10)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const { files } = (await request.json().catch(() => ({}))) as { files?: FileMeta[] };
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) {
    return NextResponse.json({ error: "invalid_files" }, { status: 400 });
  }
  if (files.some((f) => !FILE_TYPES.includes(f.type) || !(f.size > 0 && f.size <= MAX_FILE_BYTES))) {
    return NextResponse.json({ error: "invalid_files" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  if (!supabase) {
    if (process.env.NODE_ENV !== "production") return NextResponse.json({ simulated: true, uploads: [] });
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const folder = `requests/${randomUUID()}`;
  const uploads = [];
  for (const [i, f] of files.entries()) {
    const ext = (f.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const path = `${folder}/${String(i + 1).padStart(2, "0")}.${ext}`;
    const { data, error } = await supabase.storage.from(QUOTE_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[quote/upload]", error);
      return NextResponse.json({ error: "provider_error" }, { status: 502 });
    }
    uploads.push({ path, signedUrl: data.signedUrl });
  }
  return NextResponse.json({ uploads });
}
