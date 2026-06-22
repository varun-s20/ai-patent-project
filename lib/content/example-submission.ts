/**
 * The one canonical worked example used across the site — the self-cooling
 * water bottle. Kept in a single place so the homepage hero, the workflow tour,
 * the "how much detail" section, and the submit form all stay in sync.
 *
 * `thinDescription` is the deliberately sparse version used to contrast against
 * the full `description`; `score`/`verdict` mirror the sample shown in the hero.
 */
export const EXAMPLE_SUBMISSION = {
  title: "Self-cooling water bottle",
  industry: "Consumer Goods",
  thinDescription: "A water bottle that keeps your drink cold.",
  description:
    "A vacuum-insulated stainless-steel bottle with a thermoelectric (Peltier) cooling element in the base. A small rechargeable battery powers it, and a companion app holds your drink at a set temperature — say 4°C — for up to 12 hours. Unlike a normal insulated bottle that only slows warming, it actively chills the contents, and recharges over USB-C overnight.",
  problem:
    "Insulated bottles only delay warming — on a long hike or a hot commute, water still turns lukewarm. There's no affordable, portable way to keep a drink genuinely cold for hours.",
  score: 76,
  verdict: "Proceed now",
} as const;
