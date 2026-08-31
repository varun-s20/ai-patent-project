// lib/legal/company.ts
// The handful of real-world facts the legal pages need. Kept in one place so
// /terms and /privacy can never drift apart, and so the details only the
// operator knows are a single edit rather than a search across two documents.

export const LEGAL = {
  /** Registered legal entity + ABN. Not the brand name. */
  entity: "Playing for Pies Pty Ltd (ABN 94 699 119 385)",

  /** Trading name shown to users. */
  brand: "AI Patent Register",

  /** Where privacy requests, deletion requests and complaints go. */
  contactEmail: "playingforpies@gmail.com",

  /** State or territory whose courts govern. e.g. "New South Wales". */
  state: "New South Wales",

  /** Shown as "Last updated" on both legal pages. Bump when either changes. */
  updated: "29 August 2026",

  /**
   * The AI provider that processes submissions. Named explicitly because a
   * vague "our service providers" defeats the point of the disclosure, and
   * because naming it is what makes the confidentiality claim verifiable.
   */
  aiProvider: "Groq, Inc.",
} as const;
