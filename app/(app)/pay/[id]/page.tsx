import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "../actions";
import { PRICE_CENTS } from "@/lib/stripe/checkout";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, title, status")
    .eq("id", id)
    .single();

  if (!submission) notFound();
  if (submission.status !== "draft") redirect(`/status/${id}`);

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Evaluate your invention</h1>
      <p className="mt-2 text-gray-600">{submission.title}</p>
      <p className="mt-4 text-lg font-medium">${(PRICE_CENTS / 100).toFixed(0)} — one-time</p>
      <form action={createCheckoutSession} className="mt-6">
        <input type="hidden" name="submissionId" value={submission.id} />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Pay &amp; Evaluate
        </button>
      </form>
    </main>
  );
}
