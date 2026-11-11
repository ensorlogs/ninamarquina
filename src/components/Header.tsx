"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Logo } from "./ui/Logo";

const items = [
  { key: "home", href: "/" },
  { key: "projects", href: "/proyectos" },
  { key: "studio", href: "/estudio" },
  { key: "services", href: "/#servicios" },
  { key: "journal", href: "/journal" },
  { key: "contact", href: "#contacto" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const solid = scrolled || open || pathname !== "/";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color] duration-500 ${
          solid
            ? "bg-ivory/95 text-wine shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur"
            : "bg-gradient-to-b from-black/55 via-black/25 to-transparent text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
        }`}
      >
        <div className="container-site flex h-[76px] items-center justify-between md:h-[88px]">
          <Link href="/" aria-label="Nina Marquina" onClick={() => setOpen(false)}>
            <Logo light={!solid} />
          </Link>

          <nav className="hidden items-center gap-7 xl:flex 2xl:gap-9">
            {items.map((item) => (
              <NavLink
                key={item.key}
                href={item.href}
                className={`text-[10.5px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60`}
              >
                {t(item.key)}
              </NavLink>
            ))}
            <NextLink
              href="/acceso"
              className={`text-[10.5px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60`}
            >
              {t("login")}
            </NextLink>
            <LocaleSwitch locale={locale} pathname={pathname} />
            <Link
              href="/cotizar"
              className={`border px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                solid ? "border-wine hover:bg-wine hover:text-ivory" : "border-white hover:bg-white hover:text-charcoal hover:[text-shadow:none]"
              }`}
            >
              {t("quote")}
            </Link>
          </nav>

          <button
            type="button"
            className="flex items-center gap-3 xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t("close") : t("menu")}
          >
            <span className="label font-semibold">{open ? t("close") : t("menu")}</span>
            <span className="relative block h-3 w-6">
              <span
                className={`absolute left-0 top-0 h-[1.5px] w-6 bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`absolute bottom-0 left-0 h-[1.5px] w-6 bg-current transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>

      </header>
        <div
          className={`fixed inset-x-0 bottom-0 top-[76px] z-40 bg-ivory text-wine transition-opacity duration-500 xl:hidden ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <nav className="container-site flex h-full flex-col justify-between py-10">
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.key}>
                  <NavLink href={item.href} onClick={() => setOpen(false)} className="display text-4xl">
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="space-y-8">
              <Link
                href="/cotizar"
                onClick={() => setOpen(false)}
                className="link-arrow w-full justify-center bg-charcoal px-8 py-4 text-ivory"
              >
                {t("quote")}
              </Link>
              <NextLink href="/acceso" className="link-arrow w-full justify-center border border-charcoal px-8 py-4">
                {t("login")}
              </NextLink>
              <LocaleSwitch locale={locale} pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
          </nav>
        </div>
    </>
  );
}

function NavLink({ href, ...props }: { href: string; className: string; onClick?: () => void; children: React.ReactNode }) {
  return href.startsWith("#") ? <a href={href} {...props} /> : <Link href={href} {...props} />;
}

function LocaleSwitch({
  locale,
  pathname,
  onNavigate,
}: {
  locale: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em]">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="opacity-40">|</span>}
          <Link
            href={pathname}
            locale={l}
            onClick={onNavigate}
            className={l === locale ? "opacity-100" : "opacity-70 transition-opacity hover:opacity-100"}
            aria-current={l === locale ? "true" : undefined}
          >
            {l}
          </Link>
        </span>
      ))}
    </div>
  );
}
