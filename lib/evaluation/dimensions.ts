import { type Dimension } from "@/lib/types";

/** Per-dimension guidance (what it measures + what low vs high looks like), injected into the system prompt. */
export const DIMENSION_GUIDE: Record<Dimension, string> = {
  novelty:
    "How new and non-obvious the invention is versus existing prior art. Score low if it already exists or is an obvious combination of known products; reserve high scores for a genuinely new, non-obvious mechanism.",
  commercial:
    "Size of the addressable market and strength of real, demonstrated demand. Score low for tiny, niche, or purely speculative demand; score high only for a large market with clear evidence of need.",
  defensibility:
    "How hard it is for competitors to design around a patent, and how broad the protectable claims are. Score low if it is trivially copied or only narrowly protectable; score high only for strong, broad, enforceable claims.",
  licensing:
    "Likelihood a company would buy or license the resulting patent. Score low if there is no identifiable buyer or weak deal precedent; score high only with concrete buyers and comparable licensing deals.",
  timing:
    "Whether market and technology maturity make now the right moment to file and commercialize. Score low if it is too early, too late, or the trend is unclear; score high only when timing is clearly favorable.",
};
