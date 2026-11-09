import NextLink from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { homeFor } from "@/lib/portal-auth";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function Acceso({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { data } = await (await supabaseServer()).auth.getUser();
  const home = await homeFor(data.user?.email);
  if (home) redirect(home);
  return (
    <main className="grid min-h-screen md:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden bg-espresso md:block">
        <div className="absolute inset-0 bg-[url('/images/hero.jpg')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-x-12 bottom-12 text-ivory">
          <p className="label text-ivory/70">Área privada</p>
          <p className="display mt-4 text-[44px] leading-[1.05]">
            Tu proyecto, <em>paso a paso</em>.
          </p>
        </div>
      </div>
      <div className="grid place-items-center bg-sand px-6 py-16">
        <div className="w-full max-w-md bg-ivory p-10 md:p-12">
          <NextLink href="/es" className="block">
            <p className="font-serif text-[22px] tracking-[0.3em]">NINA MARQUINA</p>
            <p className="label mt-1 text-[9px] text-muted">Architecture &amp; Interiors</p>
          </NextLink>
          <h1 className="display mt-10 text-[36px]">
            Accede a tu <em>área</em>.
          </h1>
          <p className="mt-3 text-[14px] leading-[1.7] text-muted">
            Para clientes y equipo del estudio. Escribe tu email y te enviaremos un enlace de acceso, sin contraseñas.
          </p>
          {error && <p className="mt-6 text-[13px] text-clay">El enlace no es válido o ha caducado. Pide uno nuevo.</p>}
          <LoginForm />
          <NextLink href="/es" className="label mt-10 inline-block text-muted hover:text-charcoal">← Volver a la web</NextLink>
        </div>
      </div>
    </main>
  );
}
