import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/submit", "/dashboard", "/settings", "/processing", "/admin"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Apply the no-cache headers the library passes alongside auth cookies,
          // so a CDN/proxy can't cache a response carrying one user's session token.
          Object.entries(responseHeaders ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAuth = PROTECTED_PREFIXES.some((p) => request.nextUrl.pathname.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Disabled users are bounced from every protected surface. A failed query
  // (not just "no row") must deny access, not silently fall through as
  // "not disabled" — `profile` being undefined on a real DB error looks
  // identical to a healthy non-disabled user otherwise.
  if (needsAuth && user) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("is_disabled")
      .eq("id", user.id)
      .single();
    if (profileErr) {
      console.error("[middleware] profile lookup failed, denying access:", profileErr);
    }
    if (profileErr || profile?.is_disabled) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set(
        "error",
        profileErr ? "Something went wrong. Please try again." : "Your account has been disabled.",
      );
      return NextResponse.redirect(url);
    }
  }

  return response;
}
