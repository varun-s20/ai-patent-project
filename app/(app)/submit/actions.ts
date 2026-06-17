"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submissionSchema } from "@/lib/validation/submission";

export type SubmitState = { error?: string; id?: string };

export async function createSubmission(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const parsed = submissionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    problem: formData.get("problem") || undefined,
    industry: formData.get("industry"),
    inventorName: formData.get("inventorName"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const d = parsed.data;
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      title: d.title,
      description: d.description,
      problem: d.problem ?? null,
      industry: d.industry,
      inventor_name: d.inventorName,
      email: d.email,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Success — the client clears its draft and navigates to payment.
  return { id: data.id };
}
