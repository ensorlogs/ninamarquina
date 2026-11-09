import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { legacyRedirect } from "./lib/legacy-redirects";

const intl = createMiddleware(routing);

async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export default function middleware(request: NextRequest) {
  const legacy = legacyRedirect(request.nextUrl.pathname);
  if (legacy) return NextResponse.redirect(new URL(legacy, request.url), 308);
  return /^\/(admin|portal|acceso)(\/|$)/.test(request.nextUrl.pathname) ? refreshAdminSession(request) : intl(request);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
