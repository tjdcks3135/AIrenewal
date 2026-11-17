"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { MAIN_STORY } from "@/content/main";
import { cn } from "@/lib/cn";
import { readDurationMs, readEase } from "@/lib/tokens";
import { ChapterBody, TOTAL_SECTIONS, type Chapter, type MainLiveData } from "./ChapterBody";

// DESIGN.md §3 ScrollStory — 메인 섹션 2~5 스크롤 연출 (FEATURES.md §3.6, 데스크톱 lg 이상)
// 구간이 화면에 고정(sticky)되고, 한 장당 화면 높이 1개 분량을 스크롤하면 사진·글·진행 표시가 바뀐다.
// 일반 페이지 스크롤을 그대로 쓴다 (휠을 막거나 가로채지 않음).

type ScrollStoryProps = { chapters: readonly Chapter[]; live: MainLiveData };

export function ScrollStory({ chapters, live }: ScrollStoryProps) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const n = chapters.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // 스크롤 가능한 길이 = (장 수 - 1) × 화면 높이. i번째 장은 i × 화면 높이 지점을 중심으로 보인다 (goTo 와 같은 기준).
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(n - 1, Math.max(0, Math.round(p * (n - 1)))));
  });

  const slow = readDurationMs("--dur-slow", 600) / 1000;
  const base = readDurationMs("--dur-base", 300) / 1000;
  const easeInOut = readEase("--ease-in-out", [0.76, 0, 0.24, 1]);
  const easeOut = readEase("--ease-out", [0.16, 1, 0.3, 1]);

  /** 진행 점: 해당 장이 시작되는 스크롤 위치로 이동 */
  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + i * window.innerHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }

  const chapter = chapters[active];

  return (
    <section ref={ref} className="relative">
      <div className="sticky top-0 h-dvh overflow-hidden pt-8">
        <div className="grid h-full grid-cols-12">
          {/* 사진: 화면 절반 이상 (12칸 중 7칸) — 장이 바뀌면 교차 전환 */}
          <div className="relative col-span-7">
            {chapters.map((c, i) => (
              <motion.div
                key={c.key}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0 }}
                transition={{ duration: slow, ease: easeInOut }}
                aria-hidden={i !== active}
              >
                <PhotoFrame photo={c.photo} sizes="60vw" />
              </motion.div>
            ))}
          </div>

          {/* 글: 들어오는 쪽에서 살짝 밀려 들어오며 바뀜 */}
          <div className="relative col-span-5 flex items-center px-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={chapter.key}
                className="w-full"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: base, ease: easeOut }}
              >
                <ChapterBody chapter={chapter} index={active} live={live} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 진행 표시: 카운터 + 점 */}
        <div className="absolute right-6 bottom-7 flex items-center gap-5">
          <p className="text-label uppercase text-text-2 tabular-nums">{MAIN_STORY.counter(active + 2, TOTAL_SECTIONS)}</p>
          <ol className="flex items-center gap-2">
            {chapters.map((c, i) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={MAIN_STORY.dotLabel(c.title)}
                  aria-current={i === active ? "step" : undefined}
                  className="flex h-6 items-center"
                >
                  <span
                    className={cn(
                      "block h-2 rounded-pill transition-all duration-base ease-out",
                      i === active ? "w-6 bg-brand-deep" : "w-2 bg-line hover:bg-text-3",
                    )}
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 스크롤 길이: 고정 화면 1개 + 나머지 장 수만큼 화면 높이 */}
      {chapters.slice(1).map((c) => (
        <div key={c.key} aria-hidden className="h-dvh" />
      ))}
    </section>
  );
}
