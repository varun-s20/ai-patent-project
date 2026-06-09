import { type Dimension } from "@/lib/types";

/** One-line guidance per dimension, injected into the system prompt. */
export const DIMENSION_GUIDE: Record<Dimension, string> = {
  novelty:
    "How new and non-obvious the invention is versus existing prior art. Score low if it already exists or is an obvious combination of known ideas.",
  commercial:
    "Size of the addressable market and strength of real-world demand for the invention.",
  defensibility:
    "How hard it would be for competitors to design around a patent on this invention; the breadth of protectable claims.",
  licensing:
    "Potential to license or otherwise monetize the resulting patent with third parties.",
  timing:
    "Whether market and technology timing make now the right moment to patent and commercialize.",
};
