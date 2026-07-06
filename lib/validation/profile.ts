// lib/validation/profile.ts
/** Shared between signUp (app/auth/actions.ts) and updateProfile
 * (app/(app)/account/actions.ts) so a name set at registration can never
 * exceed what editing it later would accept. A plain constants module (not
 * a "use server" file) since Next.js only allows async function exports
 * from a "use server" file. */
export const FULL_NAME_MAX = 120;
