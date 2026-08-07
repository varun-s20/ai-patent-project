import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Gate for admin-only surfaces. Redirects unauthenticated users to /login and
 * non-admins to /dashboard. Returns the authenticated admin's user id.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await isAdminUser(user.id))) redirect("/dashboard");
  return user.id;
}

/**
 * Whether a user is an admin, without redirecting. For surfaces that stay open
 * to every logged-in user but show an admin more — the status page, which the
 * admin console links to for other people's submissions.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  return Boolean(profile?.is_admin);
}
