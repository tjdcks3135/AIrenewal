"use client";

import { useEffect, useRef } from "react";
import { GROW_TEXT } from "@/content/grow";
import { feelingCss, feelingRgb } from "@/lib/feelingColor";
import { cn } from "@/lib/cn";
import type { FeelingView } from "@/lib/data";
import { FeelingItem } from "./FeelingItem";
import type { SphereFrame, SphereMotion } from "./sphereMotion";

// DESIGN.md §3 FeelingSphere — 안개 속 마음들 (FEATURES.md §3.2)
// 마음들은 안개 안의 보이지 않는 구 표면에 고르게 흩어져 있다. 끌면 구가 돌고,
// 앞쪽(보는 사람 쪽)에 온 마음이 또렷해진다. 뒤쪽은 감정 색 점으로만 비친다.
// 글은 3D 구 표면에 붙어 원근이 적용된다 (가장자리로 갈수록 기울어 보임).
// 회전·위치 계산은 SphereMotion 이 하고, 매 프레임 DOM 스타일을 직접 바꾼다 (React 로 매 프레임 다시 그리지 않음).

type FeelingSphereProps = {
  items: FeelingView[];
  /** 회전 상태 — 안개(ChildBlob)와 공유 */
  motion: SphereMotion;
  /** 구를 놓는 자리: 데스크톱 돔 / 모바일 둥근 안개 */
  frame: SphereFrame;
  still: boolean;
  reduced: boolean;
  className?: string;
};

export function FeelingSphere({ items, motion, frame, still, reduced, className }: FeelingSphereProps) {
  const box = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());

  // 마음 목록이 바뀌면 자리 배정 (새 마음 쪽으로 돌기는 움직이는 모드에서만) + 안개가 쓸 감정 색
  useEffect(() => {
    motion.setColors(new Map(items.map((f) => [f.id, feelingRgb(f.hue)])));
    motion.assign(
      items.map((f) => f.id),
      !still,
    );
  }, [motion, items, still]);

  // 매 프레임 회전 → 배치. 캡처 모드는 고정 각도 한 장면 (크기가 바뀌면 다시 배치)
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const map = nodes.current;
    if (still) {
      motion.freeze();
      motion.layout(el, map, frame);
      const ro = new ResizeObserver(() => motion.layout(el, map, frame));
      ro.observe(el);
      return () => ro.disconnect();
    }
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      motion.step(Math.min(0.05, (now - prev) / 1000), reduced);
      prev = now;
      motion.layout(el, map, frame);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion, frame, still, reduced, items]);

  return (
    <div
      ref={box}
      role="group"
      aria-label={GROW_TEXT.childLabel}
      tabIndex={still ? -1 : 0}
      onPointerDown={(e) => {
        if (still) return;
        motion.pointerDown(e.clientX, e.clientY);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => motion.pointerMove(e.clientX, e.clientY, e.pointerType === "touch")}
      onPointerUp={() => motion.pointerUp()}
      onPointerCancel={() => motion.pointerUp()}
      onKeyDown={(e) => {
        if (!still && motion.key(e.key)) e.preventDefault();
      }}
      className={cn("touch-pan-y overflow-hidden select-none", !still && "cursor-grab active:cursor-grabbing", className)}
    >
      {items.map((f) => (
        <div
          key={f.id}
          aria-hidden
          ref={(node) => {
            if (node) nodes.current.set(f.id, node);
            else nodes.current.delete(f.id);
          }}
          className="pointer-events-none absolute top-0 left-0 w-2/5 opacity-0 backface-hidden lg:w-1/5"
        >
          <FeelingItem feeling={f} lines={3} showTime={false} align="center" />
          {/* 뒤쪽에 있을 때 비치는 색 점 (사용자가 고른 색) */}
          <span
            className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-pill"
            style={{ backgroundColor: feelingCss(f.hue) }}
          />
        </div>
      ))}

      {/* 스크린리더: 안개 속 마음 목록 */}
      <ul className="sr-only" aria-label={GROW_TEXT.sphereListLabel}>
        {items.map((f) => (
          <li key={f.id}>
            <FeelingItem feeling={f} />
          </li>
        ))}
      </ul>
    </div>
  );
}
