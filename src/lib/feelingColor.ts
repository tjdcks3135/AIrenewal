// 마음의 색 (DESIGN.md §1.3): 사용자가 고른 색상(hue 0~359) + 고정 채도·밝기(--feeling-saturation / --feeling-lightness)

/** CSS 색 문자열 — 채도·밝기는 토큰에서 */
export const feelingCss = (hue: number) => `hsl(${hue} var(--feeling-saturation) var(--feeling-lightness))`;

function readPercent(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isNaN(v) ? fallback : v / 100;
}

/** 셰이더용 0~1 RGB (sRGB 그대로) */
export function feelingRgb(hue: number): [number, number, number] {
  const s = readPercent("--feeling-saturation", 0.8);
  const l = readPercent("--feeling-lightness", 0.7);
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}
