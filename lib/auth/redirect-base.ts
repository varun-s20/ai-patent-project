import { headers } from "next/headers";

/**
 * The origin that auth emails should link back to.
 *
 * Prefers the origin the request actually came from, so a link always returns
 * to the host the user signed up on — aipatentregister.com from production,
 * localhost from dev, the preview host from a preview deploy. Falls back to
 * NEXT_PUBLIC_BASE_URL when there's no origin header.
 *
 * Hardcoding NEXT_PUBLIC_BASE_URL instead is what sent confirmation links to a
 * stale host: the env var trails the domain, the request origin never does.
 * Supabase's Redirect URLs allowlist is what stops a spoofed Origin from
 * turning this into an open redirect — every host used here must be listed
 * there, or Supabase silently falls back to its own Site URL.
 */
export async function authRedirectBase(): Promise<string> {
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL;
  if (!origin) {
    throw new Error(
      "No request origin and NEXT_PUBLIC_BASE_URL is not set — cannot build an auth redirect URL",
    );
  }
  return origin.replace(/\/$/, "");
}
