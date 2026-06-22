import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmissionForm } from "@/components/submission-form";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, title, description, problem, industry, inventor_name, email, status")
    .eq("id", id)
    .single();

  if (!submission) notFound();
  // Only drafts are editable; anything paid/evaluated is locked — send it to its report.
  if (submission.status !== "draft") redirect(`/status/${id}`);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Eyebrow>Edit draft</Eyebrow>
      <h1 className="mt-5 font-display text-4xl tracking-tight text-ink sm:text-5xl">
        Edit your invention
      </h1>
      <p className="mt-3 text-muted">
        Update the details below, then save. You can pay to evaluate it whenever you&apos;re ready.
      </p>
      <Card className="mt-7">
        <SubmissionForm
          editId={submission.id}
          initialValues={{
            title: submission.title,
            description: submission.description,
            problem: submission.problem ?? "",
            industry: submission.industry,
            inventorName: submission.inventor_name,
            email: submission.email,
          }}
        />
      </Card>
    </main>
  );
}
