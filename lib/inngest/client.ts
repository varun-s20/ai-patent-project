import { Inngest, eventType, staticSchema } from "inngest";

export const submissionPaid = eventType("submission/paid", {
  schema: staticSchema<{ submissionId: string }>(),
});

export const inngest = new Inngest({
  id: "ai-invention-registry",
});
