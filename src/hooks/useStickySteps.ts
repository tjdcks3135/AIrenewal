"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useState, type RefObject } from "react";

// 화면에 고정(sticky)된 구간을 한 단계당 화면 높이 1개 분량씩 스크롤하며 넘기는 연출의 공통 계산.
// 메인 ScrollStory(FEATURES.md §3.6)와 키트 구성품(§3.7)이 함께 쓴다.
// 구간 = 고정 화면 1개 + (단계 수 - 1) × 화면 높이. i번째 단계는 구간 시작 + i × 화면 높이 지점.

export function useStickySteps(ref: RefObject<HTMLElement | null>, count: number) {
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(count - 1, Math.max(0, Math.round(p * (count - 1)))));
  });

  /** i번째 단계가 시작되는 스크롤 위치로 이동 */
  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + i * window.innerHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return { active, goTo };
}
