import { z } from "zod";
import { INDUSTRIES } from "@/lib/types";

export const DESCRIPTION_MIN = 100;
export const DESCRIPTION_MAX = 2000;

export const submissionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, `Description must be at least ${DESCRIPTION_MIN} characters`)
    .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters`),
  problem: z.string().trim().max(2000).optional(),
  industry: z.enum(INDUSTRIES),
  inventorName: z.string().trim().min(1, "Inventor name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
});

export type SubmissionSchema = z.infer<typeof submissionSchema>;
