"use client";

export function CharacterCounter({
  count,
  min,
  max,
}: {
  count: number;
  min: number;
  max: number;
}) {
  const tooShort = count < min;
  const tooLong = count > max;
  const color = tooShort || tooLong ? "text-red-600" : "text-muted";
  return (
    <p className={`mt-2 text-xs ${color}`} aria-live="polite">
      {count}/{max}
      {tooShort && ` (min ${min})`}
    </p>
  );
}
