import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ideas already registered — the figure the urgency badge shows. Counts exactly
 * the statuses registry_similarity (0008) compares against, so the landing page
 * and the report can never disagree about what "registered" means.
 *
 * Returns 0 on failure, and the badge hides itself at 0: a placeholder number
 * here would be a fabricated count on the one page where that matters most.
 */
export async function registeredCount(): Promise<number> {
  // The whole body, not just the query, is guarded: createAdminClient() itself
  // throws when SUPABASE_SERVICE_ROLE_KEY is missing, which would otherwise
  // 500 the public landing page instead of degrading like the doc comment
  // above promises.
  try {
    const { count, error } = await createAdminClient()
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing", "complete"]);

    if (error) {
      console.error("[registry] registered count failed:", error);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error("[registry] registered count failed:", err);
    return 0;
  }
}
