"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { Hotspot } from "@/components/ui/Hotspot";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import {
  KIT_INTRO,
  KIT_ITEMS,
  KIT_ITEMS_COUNTER,
  KIT_ITEMS_TITLE,
  KIT_ROLE,
  KIT_SECTIONS,
  KIT_UNFOLD,
  type KitItem,
} from "@/content/kit";
import { useCaptureMode } from "@/hooks/useCaptureMode";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStickySteps } from "@/hooks/useStickySteps";
import { cn } from "@/lib/cn";
import { readDurationMs, readEase } from "@/lib/tokens";

// 키트 설명 `/kit` — docs/PAGES.md §4: 인트로 → 펼쳐보기(핫스팟) → 구성품 상세 ×5 → 키트가 하는 일
// 사진이 주인공. 글은 짧게, 바탕은 --color-bg 그대로 (PAGES.md §4 화면 연출).
// 구성품: 데스크톱은 고정 스크롤 연출, 모바일·캡처·움직임 줄이기는 세로 나열 (FEATURES.md §3.7).

const TOTAL = 4;
const pad = (n: number) => String(n).padStart(2, "0");

function SectionIndex({ no, label, className }: { no: number; label: string; className?: string }) {
  return (
    <p className={cn("flex items-center gap-4 text-label uppercase", className)}>
      <span className="text-action tabular-nums">
        {pad(no)} / {pad(TOTAL)}
      </span>
      {/* 한글 라벨은 자간 0% (피그마 Typography 규칙) */}
      <span className="tracking-0 text-text-2">{label}</span>
    </p>
  );
}

/** 1. 인트로 — 사진 ②가 첫 화면 전체 (메인 히어로와 같은 방식) */
function Intro() {
  return (
    <section aria-labelledby="kit-title" className="relative flex min-h-dvh items-end">
      <PhotoFrame photo={KIT_INTRO.photo} priority placeholderAlign="top" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-bg via-bg/80 to-transparent" />
      <div className="relative container-page flex flex-col gap-6 pt-10 pb-9">
        <SectionIndex no={1} label={KIT_SECTIONS.intro} />
        <h1 id="kit-title" className="text-h1 text-text lg:w-3/4">
          {KIT_INTRO.title}
        </h1>
        <p className="text-lead text-text-2 lg:w-1/2">{KIT_INTRO.body}</p>
      </div>
    </section>
  );
}

/** 2. 펼쳐보기 — 연출샷 위 번호 핫스팟 ①~⑤ → 해당 구성품으로 */
function Unfold() {
  return (
    <section aria-labelledby="kit-unfold" className="container-page flex flex-col gap-7 py-9 lg:py-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-5">
          <SectionIndex no={2} label={KIT_SECTIONS.unfold} />
          <h2 id="kit-unfold" className="text-h2 text-text">
            {KIT_UNFOLD.title}
          </h2>
        </div>
        <p className="text-body text-text-2">{KIT_UNFOLD.hint}</p>
      </div>
      {/* 핫스팟 위치(%)가 사진과 맞도록 사진 비율(3:2) 그대로 — 데스크톱은 한 화면에 들어오게 폭을 줄인다 */}
      <div className="relative aspect-3/2 w-full lg:mx-auto lg:w-2/3">
        <PhotoFrame photo={KIT_UNFOLD.photo} sizes="(min-width: 1024px) 66vw, 100vw" />
        {KIT_ITEMS.map((item, i) => (
          <Hotspot
            key={item.id}
            href={`#${item.id}`}
            label={String(i + 1)}
            x={item.spot.x}
            y={item.spot.y}
            aria-label={KIT_UNFOLD.hotspotLabel(item.no, item.name)}
          />
        ))}
      </div>
    </section>
  );
}

/** 구성품 하나의 글: 번호 · 이름 · 의미 */
function ItemBody({ item, index }: { item: KitItem; index: number }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-label uppercase text-text-3 tabular-nums">{KIT_ITEMS_COUNTER(index + 1, KIT_ITEMS.length)}</p>
      <h3 className="text-h2 text-text">
        <span className="text-action">{item.no}</span> {item.name}
      </h3>
      <p className="text-lead text-text-2">{item.meaning}</p>
    </div>
  );
}

function ItemsHeader() {
  return (
    <div className="flex flex-col gap-5">
      <SectionIndex no={3} label={KIT_SECTIONS.items} />
      <h2 id="kit-items" className="text-h3 text-text">
        {KIT_ITEMS_TITLE}
      </h2>
    </div>
  );
}

/** 3. 구성품 상세 — 데스크톱 고정 스크롤 연출 (FEATURES.md §3.7) */
function ItemsScroll() {
  const ref = useRef<HTMLElement>(null);
  const { active, goTo } = useStickySteps(ref, KIT_ITEMS.length);
  const slow = readDurationMs("--dur-slow", 600) / 1000;
  const base = readDurationMs("--dur-base", 300) / 1000;
  const easeInOut = readEase("--ease-in-out", [0.76, 0, 0.24, 1]);
  const easeOut = readEase("--ease-out", [0.16, 1, 0.3, 1]);
  const item = KIT_ITEMS[active];

  return (
    <section ref={ref} aria-labelledby="kit-items" className="relative border-t border-line">
      {/* 주소 조각(/kit#vest …) 도착 지점: i번째 구성품이 시작되는 스크롤 위치 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex flex-col">
        {KIT_ITEMS.map((it) => (
          <div key={it.id} id={it.id} className="h-dvh" />
        ))}
      </div>

      <div className="sticky top-0 h-dvh overflow-hidden pt-8">
        <div className="container-page grid h-full grid-cols-12 gap-gutter">
          {/* 왼쪽: 섹션 제목 + 구성품 목록 (누르면 해당 구성품으로) */}
          <div className="col-span-2 flex flex-col justify-between py-8">
            <ItemsHeader />
            <ol className="flex flex-col gap-1">
              {KIT_ITEMS.map((it, i) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={cn(
                      "flex h-control-sm items-center gap-3 text-ui transition-colors duration-fast ease-out",
                      i === active ? "text-text" : "text-text-3 hover:text-text-2",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("block h-px transition-all duration-base ease-out", i === active ? "w-6 bg-action" : "w-3 bg-line")}
                    />
                    {it.no} {it.name}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* 가운데: 구성품 사진(3:2) — 구성품이 바뀌면 교차 전환 */}
          <div className="relative col-span-6 aspect-3/2 self-center">
            {KIT_ITEMS.map((it, i) => (
              <motion.div
                key={it.id}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0 }}
                transition={{ duration: slow, ease: easeInOut }}
                aria-hidden={i !== active}
              >
                <PhotoFrame photo={it.photo} sizes="50vw" />
              </motion.div>
            ))}
          </div>

          {/* 오른쪽: 번호 · 이름 · 의미 */}
          <div className="col-span-4 flex items-center pl-6" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                className="w-full"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: base, ease: easeOut }}
              >
                <ItemBody item={item} index={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 스크롤 길이: 고정 화면 1개 + 나머지 구성품 수만큼 화면 높이 */}
      {KIT_ITEMS.slice(1).map((it) => (
        <div key={it.id} aria-hidden className="h-dvh" />
      ))}
    </section>
  );
}

/** 3. 구성품 상세 — 모바일·캡처·움직임 줄이기: 세로 나열 */
function ItemsStack() {
  return (
    <section aria-labelledby="kit-items" className="border-t border-line">
      <div className="container-page py-9">
        <ItemsHeader />
      </div>
      {KIT_ITEMS.map((item, i) => (
        <article key={item.id} id={item.id} className="container-page grid scroll-mt-8 grid-cols-1 gap-6 pb-9 md:grid-cols-12 md:gap-gutter lg:items-center">
          <div className="relative aspect-3/2 md:col-span-6">
            <PhotoFrame photo={item.photo} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
          <div className="md:col-span-6">
            <ItemBody item={item} index={i} />
          </div>
        </article>
      ))}
    </section>
  );
}

/** 4. 키트가 하는 일 — 키트(물리) ↔ 웹사이트(디지털) */
function Role() {
  return (
    <section aria-labelledby="kit-role" className="border-t border-line">
      <div className="container-page flex flex-col gap-7 py-9 lg:py-10">
        <div className="flex flex-col gap-5">
          <SectionIndex no={4} label={KIT_SECTIONS.role} />
          <h2 id="kit-role" className="text-h2 text-text lg:w-2/3">
            {KIT_ROLE.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-gutter">
          {KIT_ROLE.sides.map((side) => (
            <div key={side.key} className="flex flex-col gap-4 border-t border-line pt-6">
              <p className="text-label tracking-0 text-action">{side.label}</p>
              <h3 className="text-h3 text-text">{side.title}</h3>
              <p className="text-body text-text-2">{side.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KitContent() {
  const capture = useCaptureMode();
  const reduced = useReducedMotion() ?? false;
  const desktop = useMediaQuery("(min-width: 1024px)");
  const animated = desktop && !capture && !reduced;

  // 서버는 세로 배치로 그린 뒤 데스크톱이면 고정 연출로 바뀐다 → 주소 조각(#vest)이 있으면 바뀐 배치에서 다시 찾아간다
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !KIT_ITEMS.some((it) => it.id === id)) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  return (
    <article>
      <Intro />
      <Unfold />
      {animated ? <ItemsScroll /> : <ItemsStack />}
      <Role />
    </article>
  );
}
