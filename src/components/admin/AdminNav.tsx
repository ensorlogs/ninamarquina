"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

const items = [
  ["/admin", "Resumen"],
  ["/admin/solicitudes", "Solicitudes"],
  ["/admin/clientes", "Clientes"],
  ["/admin/proyectos", "Proyectos"],
  ["/admin/presupuestos", "Presupuestos"],
  ["/admin/portfolio", "Portfolio"],
  ["/admin/journal", "Journal"],
] as const;

export function AdminNav({ email }: { email: string }) {
  const path = usePathname();
  return (
    <aside className="bg-espresso px-6 py-6 text-ivory md:sticky md:top-0 md:flex md:h-screen md:flex-col md:py-10">
      <Link href="/admin" className="block">
        <p className="font-serif text-[18px] tracking-[0.28em]">NINA MARQUINA</p>
        <p className="label mt-1 text-[8.5px] text-ivory/55">Panel</p>
      </Link>
      <nav className="-mx-1 mt-6 flex gap-1 overflow-x-auto md:mt-12 md:flex-col">
        {items.map(([href, label]) => {
          const on = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`shrink-0 px-3 py-2.5 text-[13px] transition-colors ${on ? "bg-ivory/10 text-ivory" : "text-ivory/60 hover:text-ivory"}`}>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 hidden text-[11.5px] text-ivory/50 md:mt-auto md:block">
        <p className="truncate">{email}</p>
        <div className="mt-3 flex gap-4">
          <a href="/es" target="_blank" className="hover:text-ivory">Ver web ↗</a>
          <form action={signOut}><button className="hover:text-ivory">Salir</button></form>
        </div>
      </div>
    </aside>
  );
}
