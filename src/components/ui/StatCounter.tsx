"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCaptureMode } from "@/hooks/useCaptureMode";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { readDurationMs, readEase } from "@/lib/tokens";
import { Skeleton } from "./Skeleton";

// DESIGN.md §3 StatCounter — 숫자 + 설명, 증가 애니메이션.
// value 가 null 이면 로딩(스켈레톤). 값이 늘면 이전 값에서 새 값까지 세어 올라간다.
// 캡처 모드·움직임 줄이기에서는 바로 새 값을 보여준다.

type StatCounterProps = {
  value: number | null;
  /** 숫자(쉼표 포함 문자열)를 받아 문장을 만든다. 예: n => `${n}개의 마음이 모였습니다` */
  format: (formatted: string) => string;
  className?: string;
};

export function StatCounter({ value, format, className }: StatCounterProps) {
  const reduced = useReducedMotion();
  const capture = useCaptureMode();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (value === null) return;
    if (from === null || from === value || reduced || capture) {
      // 첫 값이거나 움직임을 끈 경우: 바로 표시 (다음 틱 — effect 안 동기 setState 방지)
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }
    const controls = animate(from, value, {
      duration: readDurationMs("--dur-breath", 1200) / 1000,
      ease: readEase("--ease-out", [0.16, 1, 0.3, 1]),
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduced, capture]);

  if (shown === null) {
    return <Skeleton shape="pill" className={cn("h-6 w-full", className)} />;
  }
  return (
    <p className={cn("tabular-nums", className)} aria-live="polite">
      {format(formatNumber(shown))}
    </p>
  );
}
