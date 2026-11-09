import NextLink from "next/link";
import { signOut } from "@/app/admin/actions";
import { requirePortal } from "@/lib/portal-auth";
import { site, whatsappHref } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await requirePortal();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-black/10 bg-ivory">
        <div className="container-site flex h-[76px] items-center justify-between gap-6">
          <NextLink href="/portal" className="block">
            <p className="font-serif text-[19px] tracking-[0.16em] md:text-[21px]">NINA MARQUINA</p>
            <p className="label mt-1 text-[8px] text-muted">Área de clientes</p>
          </NextLink>
          <div className="flex items-center gap-5 text-[12px]">
            <span className="hidden text-muted md:inline">{client.name}</span>
            <form action={signOut}>
              <button className="label hover:text-clay">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-site flex-1 py-12 md:py-16">{children}</main>
      <footer className="border-t border-black/10 py-8">
        <div className="container-site flex flex-wrap justify-between gap-4 text-[12px] text-muted">
          <span>¿Dudas sobre tu proyecto? Escríbenos.</span>
          <span className="flex gap-5">
            <a href={whatsappHref("Hola Nina, te escribo desde mi área de cliente.")} target="_blank" rel="noopener noreferrer" className="hover:text-charcoal">WhatsApp</a>
            <a href={`mailto:${site.email}`} className="hover:text-charcoal">{site.email}</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
