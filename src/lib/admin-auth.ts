import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email?: string | null) => !!email && adminEmails().includes(email.toLowerCase());

export async function requireAdmin() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!isAdminEmail(data.user?.email)) redirect("/admin/login");
  return data.user!;
}
