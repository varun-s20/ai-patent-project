import { createClient } from "@/lib/supabase/server";
import { registeredCount } from "@/lib/registry/registered-count";
import { StartPanel, type Attribution } from "@/components/start/start-panel";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; canceled?: string }>;
}) {
  const { error, canceled } = await searchParams;
  const attribution: Attribution = { landingPath: "/submit" };

  // A logged-in visitor gets their email prefilled and loses the urgency
  // badges — they've already bought before, no sales pitch needed. The
  // certificate preview stays either way.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="section-light">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-14 sm:px-10 lg:px-16">
        <StartPanel
          attribution={attribution}
          registeredCount={await registeredCount()}
          defaultEmail={user?.email}
          hideUrgencyBadges={!!user}
          intro={
            <div className="min-w-0">
              <h1 className="font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tight text-ink sm:text-[2.7rem]">
                Get your idea on record — then find out what it&apos;s worth.
              </h1>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-2">
                A five-dimension AI evaluation, an 8-section report, and a timestamped
                certificate of registration. One flat $49 — no account needed to start.
              </p>
              {error && (
                <p
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              {canceled && (
                <p className="mt-6 rounded-xl border border-line bg-card p-3 text-sm text-ink-2">
                  No payment was taken. Your details are saved — fill the form again when
                  you&apos;re ready and we&apos;ll pick up where you left off.
                </p>
              )}
            </div>
          }
        />
      </div>
    </main>
  );
}
