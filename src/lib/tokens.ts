// JS 애니메이션에서 디자인 토큰(tokens.css)을 읽는다. 값의 원본은 tokens.css 하나.

/** "--dur-slow" → 600 (ms). 읽지 못하면 fallback */
export function readDurationMs(name: `--dur-${string}`, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return fallback;
  return raw.endsWith("ms") ? n : n * 1000;
}

/** "--ease-out" → [0.16, 1, 0.3, 1] (Motion 의 cubic-bezier 배열) */
export function readEase(name: `--ease-${string}`, fallback: [number, number, number, number]): [number, number, number, number] {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const m = raw.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return fallback;
  const parts = m[1].split(",").map((v) => parseFloat(v));
  return parts.length === 4 && parts.every((v) => !Number.isNaN(v)) ? (parts as [number, number, number, number]) : fallback;
}
