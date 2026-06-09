import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { evaluateSubmission } from "@/lib/inngest/functions/evaluate-submission";

// The evaluation step calls Claude inside this route; give it room beyond the
// default serverless timeout so a slow model call isn't killed and falsely refunded.
export const runtime = "nodejs";
export const maxDuration = 60;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [evaluateSubmission],
});
