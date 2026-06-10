import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { evaluateSubmission } from "@/lib/inngest/functions/evaluate-submission";

// Each Inngest step runs as one invocation of this route, and a step makes a full
// model call. On slower/CPU-only Ollama a single narrative call can take a few
// minutes, so give it generous headroom — too low a cap kills the step mid-call and
// falsely refunds a paid evaluation.
export const runtime = "nodejs";
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [evaluateSubmission],
});
