import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { PasswordChangeForm } from "@/components/account/password-change-form";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

const SAVED_MESSAGE: Record<string, string> = {
  profile: "Profile updated.",
  email: "Profile updated — check your inbox to confirm the new email address.",
  password: "Password changed.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink">Settings</h1>
      <p className="mt-2 text-sm text-muted">Manage your name, email, and password.</p>

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && SAVED_MESSAGE[saved] && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {SAVED_MESSAGE[saved]}
        </p>
      )}

      <Card className="mt-7">
        <h2 className="font-display text-xl tracking-tight text-ink">Profile</h2>
        <form action={updateProfile} className="mt-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted">Full name</label>
            <input
              name="fullName"
              type="text"
              defaultValue={fullName}
              placeholder="Full name"
              required
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted">Email</label>
            <input
              type="email"
              defaultValue={user.email ?? ""}
              readOnly
              disabled
              className={`mt-1.5 ${inputClass} cursor-not-allowed bg-ink/[0.03] text-muted`}
            />
            <p className="mt-1.5 text-xs text-muted">Your email can’t be changed.</p>
          </div>
          <SubmitButton variant="primary" className="w-full" pendingLabel="Saving…">
            Save profile
          </SubmitButton>
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl tracking-tight text-ink">Password</h2>
        <PasswordChangeForm />
      </Card>
    </main>
  );
}
