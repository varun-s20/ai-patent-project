"use client";

/** `max` is optional: fields with no product-facing ceiling show progress toward
 * the minimum only, so the counter never reads as "you must stop here". */
export function CharacterCounter({
  count,
  min = 0,
  max,
}: {
  count: number;
  min?: number;
  max?: number;
}) {
  const tooShort = count < min;
  const tooLong = max !== undefined && count > max;
  const color = tooShort || tooLong ? "text-red-600" : "text-muted";
  return (
    <p className={`mt-2 text-xs ${color}`} aria-live="polite">
      {max === undefined ? `${count} characters` : `${count}/${max}`}
      {tooShort && ` (min ${min})`}
      {tooLong && ` (max ${max})`}
    </p>
  );
}
