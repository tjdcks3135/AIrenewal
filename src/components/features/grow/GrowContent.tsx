"use client";

import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { StatCounter } from "@/components/ui/StatCounter";
import { GROW_TEXT } from "@/content/grow";
import { WORLD } from "@/content/world";
import { useCaptureMode } from "@/hooks/useCaptureMode";
import { useFeelingCount } from "@/hooks/useFeelingCount";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRecentFeelings } from "@/hooks/useRecentFeelings";
import { cn } from "@/lib/cn";
import { ChildBlob } from "./ChildBlob";
import { FeelingInput } from "./FeelingInput";
import { FeelingSphere } from "./FeelingSphere";
import { SLOTS, SphereMotion } from "./sphereMotion";

// AI키우기 `/grow` — PAGES.md §7 화면 구도 (이전 사이트 키우기 페이지처럼 가운데 정렬 한 단)
// 데스크톱: 화면 폭만 한 안개 원의 중심을 첫 화면 아래 끝에 두어 위쪽 반원이 돔처럼 보인다.
//           위에 헤드카피·카운터, 아래에 입력창. 전해진 마음들은 돔 안에 떠 있다.
// 모바일: 헤드카피·카운터 → 둥근 안개 전체 → 입력창

/**
 * 존재감(0~1): 실제 사용자가 전한 마음이 늘수록 조금씩 커지고 또렷해진다 (FEATURES.md §3.1).
 * 시안 값 — 기본 0.5에서 실제 마음 300개쯤이면 0.8 근처. TODO(팀) 확정
 */
function presenceOf(total: number | null): number {
  if (total === null) return 0;
  const real = Math.max(0, total - WORLD.feelingsBase);
  return 0.5 + 0.5 * (1 - Math.exp(-real / 250));
}

function TodoBox({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center rounded-sm border border-dashed border-line bg-surface p-5", className)}>
      <p className="text-center text-caption text-text-3">{text}</p>
    </div>
  );
}

export function GrowContent() {
  const capture = useCaptureMode();
  const reduced = useReducedMotion() ?? false;
  const desktop = useMediaQuery("(min-width: 1024px)");
  // 안개와 안개 속 마음이 함께 도는 회전 상태 (매 프레임 바뀌는 값은 이 객체 안에)
  const [motion] = useState(() => new SphereMotion());

  const count = useFeelingCount();
  const feelings = useRecentFeelings(SLOTS);
  const total = count.status === "loading" ? null : count.value;
  const items = feelings.status === "loading" ? [] : feelings.items;
  // 빈 상태 문구는 정말로 0개일 때만 (오류일 때는 안개만 — 토스트가 알린다)
  const empty = feelings.status === "ready" && items.length === 0;

  const blob = (
    <ChildBlob
      presence={presenceOf(total)}
      still={capture}
      reduced={reduced}
      getRotation={motion.getRotation}
      getSources={motion.getFogSources}
      className="absolute inset-0"
    />
  );

  const heading = (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 id="grow-title" className="text-h1 text-text">
        {GROW_TEXT.headline}
      </h1>
      <StatCounter value={total} format={GROW_TEXT.feelings} className="text-h3 text-action" />
    </div>
  );

  const hint = !capture && items.length > 0 && (
    <p aria-hidden className="text-center text-caption text-text-3">
      {GROW_TEXT.dragHint}
    </p>
  );

  const emptyText = empty && <p className="px-8 text-center text-body text-text-2">{GROW_TEXT.empty}</p>;

  return (
    <>
      {desktop ? (
        <section aria-labelledby="grow-title" className="relative h-dvh overflow-clip">
          {/* 돔: 화면 폭의 1.25배인 원(양옆으로 넘침), 중심이 이 화면의 아래쪽(5/6 지점) → 위쪽 반원이 크게 보인다 */}
          <div className="absolute top-5/6 -left-1/8 aspect-square w-5/4 -translate-y-1/2">{blob}</div>
          {/* 아래 끝이 칼로 자른 듯 끊기지 않게 바탕색으로 스며들게 */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/6 bg-linear-to-t from-bg to-transparent" />
          <FeelingSphere items={items} motion={motion} frame="dome" still={capture} reduced={reduced} className="absolute inset-0 isolate" />

          {/* 위: 헤드카피·카운터 / 아래: 입력창 — 사이는 비워 두어 안개 속 마음을 끌 수 있게 */}
          <div className="pointer-events-none relative container-page flex h-full flex-col items-center justify-between pt-10 pb-7">
            <div className="pointer-events-auto">{heading}</div>
            {emptyText}
            <div className="pointer-events-auto flex w-7/12 flex-col items-center gap-3">
              {hint}
              <FeelingInput className="w-full" />
            </div>
          </div>
        </section>
      ) : (
        <section aria-labelledby="grow-title" className="container-page flex flex-col items-center gap-6 pt-10 pb-9">
          {heading}
          <div className="relative aspect-square w-full">
            {blob}
            <FeelingSphere items={items} motion={motion} frame="circle" still={capture} reduced={reduced} className="absolute inset-0 isolate" />
            {empty && <div className="pointer-events-none absolute inset-0 flex items-center justify-center">{emptyText}</div>}
          </div>
          {hint}
          <FeelingInput className="w-full" />
        </section>
      )}

      <section aria-label={GROW_TEXT.growthTodo} className="border-t border-line">
        <div className="container-page py-9">
          <TodoBox text={GROW_TEXT.growthTodo} className="h-10" />
        </div>
      </section>
    </>
  );
}
