"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCaptureMode } from "@/hooks/useCaptureMode";
import { readDurationMs, readEase } from "@/lib/tokens";

// DESIGN.md §3 Preloader — 메인 로딩 화면 (FEATURES.md §3.5)
// 메인에 들어올 때마다: 로고(원본 그대로) 등장(--dur-slow) → 유지(--dur-slow) → 화면 퇴장(--dur-slow).
// 클릭·아무 키로 즉시 사라진다. 캡처 모드에서는 없음. 움직임 줄이기면 움직임 없이 짧게.
// 데이터 로딩을 기다리지 않는 연출용 화면이다.

export function Preloader() {
  const capture = useCaptureMode();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [instant, setInstant] = useState(false);

  const slow = readDurationMs("--dur-slow", 600);
  const easeOut = readEase("--ease-out", [0.16, 1, 0.3, 1]);
  const easeInOut = readEase("--ease-in-out", [0.76, 0, 0.24, 1]);

  // 자동 퇴장: 등장 + 유지 후
  useEffect(() => {
    if (capture || !visible) return;
    const id = setTimeout(() => setVisible(false), reduced ? slow : slow * 2);
    return () => clearTimeout(id);
  }, [capture, visible, reduced, slow]);

  // 건너뛰기: 클릭·아무 키 → 즉시
  useEffect(() => {
    if (capture || !visible) return;
    const skip = () => {
      setInstant(true);
      setVisible(false);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [capture, visible]);

  // 보이는 동안 뒤 페이지 스크롤 잠금
  useEffect(() => {
    if (capture || !visible) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [capture, visible]);

  if (capture) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          aria-hidden
          className="fixed inset-0 z-50 flex items-center justify-center bg-header"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: instant || reduced ? 0 : slow / 1000, ease: easeInOut }}
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: slow / 1000, ease: easeOut }}
          >
            <Image src="/images/brand/logo.png" alt="" width={711} height={557} priority unoptimized className="h-10 w-auto" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
