import "server-only";
import { redirect } from "next/navigation";
import { isAdminEmail } from "./admin-auth";
import { supabaseAdmin } from "./supabase-admin";
import { supabaseServer } from "./supabase-server";

export type PortalClient = { id: string; name: string; email: string };

export async function findPortalClient(email?: string | null): Promise<PortalClient | null> {
  if (!email) return null;
  const db = supabaseAdmin();
  if (!db) return null;
  const { data } = await db
    .from("clients")
    .select("id,name,email")
    .ilike("email", email.trim())
    .eq("portal_enabled", true)
    .limit(1)
    .maybeSingle();
  return data;
}

/** Where a signed-in email should land: admin panel, client portal or nowhere. */
export async function homeFor(email?: string | null) {
  if (isAdminEmail(email)) return "/admin";
  if (await findPortalClient(email)) return "/portal";
  return null;
}

export async function requirePortal() {
  const { data } = await (await supabaseServer()).auth.getUser();
  const client = await findPortalClient(data.user?.email);
  if (!client) redirect("/acceso");
  return client;
}
