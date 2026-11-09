import "server-only";
import { site } from "./site";
import { supabaseAdmin } from "./supabase-admin";

/** Creates the auth user if needed and returns a one-time login URL. */
export async function magicLink(email: string, origin?: string) {
  const db = supabaseAdmin();
  if (!db) return null;
  const { error: createError } = await db.auth.admin.createUser({ email, email_confirm: true });
  if (createError && !/already|registered|exists/i.test(createError.message)) console.error("[magic-link] createUser", createError);
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties?.hashed_token) {
    console.error("[magic-link] generateLink failed", error);
    return null;
  }
  const base = process.env.NODE_ENV === "production" || !origin ? site.url : origin;
  return `${base}/admin/auth/confirm?token_hash=${data.properties.hashed_token}&type=magiclink`;
}

export async function sendBrevo(body: object) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ sender: { name: "Nina Marquina", email: process.env.BREVO_SENDER_EMAIL ?? site.email }, ...body }),
  });
  if (!res.ok) console.error("[brevo]", res.status, await res.text());
  return res.ok;
}
