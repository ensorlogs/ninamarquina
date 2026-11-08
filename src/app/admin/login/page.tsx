import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdminEmail } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { data } = await (await supabaseServer()).auth.getUser();
  if (isAdminEmail(data.user?.email)) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-sand px-6">
      <div className="w-full max-w-md bg-ivory p-10 md:p-12">
        <p className="font-serif text-[22px] tracking-[0.3em]">NINA MARQUINA</p>
        <p className="label mt-1 text-[9px] text-muted">Architecture &amp; Interiors · Panel</p>
        <h1 className="display mt-10 text-[36px]">
          Bienvenida <em>de nuevo</em>.
        </h1>
        <p className="mt-3 text-[14px] text-muted">Te enviaremos un enlace de acceso a tu email.</p>
        {error && <p className="mt-6 text-[13px] text-clay">El enlace no es válido o ha caducado. Pide uno nuevo.</p>}
        <LoginForm />
      </div>
    </main>
  );
}
