import { z } from "zod";
import { INDUSTRIES } from "@/lib/types";

export const DESCRIPTION_MIN = 100;
/** Not a product limit — a context-window guard. The description is interpolated
 * raw into the Groq prompt (lib/report/prompt.ts, lib/evaluation/prompt.ts), so
 * an unbounded body would fail the model call instead of the form. 50k chars is
 * ~12k tokens, well inside the window with room for the rest of the prompt.
 * ponytail: raise it if a real submission ever gets close. */
export const DESCRIPTION_MAX = 50_000;
export const PROBLEM_MAX = 50_000;
export const TITLE_MAX = 120;
export const INVENTOR_NAME_MAX = 120;

export const submissionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(TITLE_MAX),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, `Description must be at least ${DESCRIPTION_MIN} characters`)
    .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters`),
  problem: z.string().trim().max(PROBLEM_MAX).optional(),
  industry: z.enum(INDUSTRIES),
  inventorName: z.string().trim().min(1, "Inventor name is required").max(INVENTOR_NAME_MAX),
  email: z.string().trim().email("Enter a valid email"),
});

export type SubmissionSchema = z.infer<typeof submissionSchema>;
